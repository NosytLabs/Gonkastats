import {openapi} from '../src/core/openapi';
import type {ReadErrorCode} from '../src/core/read-errors';
import {beforeEach,expect,it,vi} from 'vitest';
import {emptySnapshot} from '../src/core/sources';
vi.mock('../src/core/service',()=>({getSnapshot:vi.fn(),detail:vi.fn(),epochDiff:vi.fn()}));
vi.mock('../src/db/store',()=>({history:vi.fn(async()=>[])}));
import {getSnapshot,detail,epochDiff} from '../src/core/service';
import * as route from '../src/app/api/v1/[resource]/route';
const read=(resource:string,query='',headers:Record<string,string>={})=>route.GET(new Request('https://example.test/api/v1/'+resource+query,{headers}),{params:Promise.resolve({resource})});
beforeEach(()=>{vi.clearAllMocks();vi.mocked(getSnapshot).mockResolvedValue(emptySnapshot());(globalThis as typeof globalThis&{gonkaApiBudget?:unknown}).gonkaApiBudget=undefined;});
function errorHeaders(response:Response){expect(response.headers.get('cache-control')).toBe('no-store');expect(response.headers.get('access-control-allow-origin')).toBe('*');}
it.each<[ReadErrorCode,number]>([
 ['upstream-failed',502],['unavailable',503],['rate-limited',429],['not-found',404]
])('epoch failures do not return cacheable success: %s',async(errorCode,status)=>{
 const error='A human-readable message, independent of the code';
 vi.mocked(epochDiff).mockResolvedValue({from:1,to:2,rows:[],urls:[],fetchedAt:new Date().toISOString(),error,errorCode});
 const response=await read('epoch-diff','?from=1&to=2');expect(response.status).toBe(status);errorHeaders(response);const body=await response.json();expect(body.data.error).toBe(error);expect(body.error).toBe(error);
 if(status===429)expect(response.headers.get('retry-after')).toBe('60');
});
it('invalid epoch pairs fail before reading the full snapshot',async()=>{
 const response=await read('epoch-diff','?from=5&to=4');expect(response.status).toBe(400);errorHeaders(response);expect(getSnapshot).not.toHaveBeenCalled();expect(epochDiff).not.toHaveBeenCalled();
});
it.each([['simulate-cost','?model=not-in-catalog',404],['simulate-cost','?attempts=99',400],['unknown','',404]])('early %s errors retain public API headers',async(resource,query,status)=>{
 const response=await read(resource,query);expect(response.status).toBe(status);errorHeaders(response);
});
it('lookup budget failures include retry guidance',async()=>{
 vi.mocked(detail).mockResolvedValue({kind:'blocks',id:'1',url:'',data:null,fetchedAt:new Date().toISOString(),error:'Please wait',errorCode:'rate-limited'});
 const response=await read('lookup','?kind=blocks&id=1');expect(response.status).toBe(429);errorHeaders(response);expect(response.headers.get('retry-after')).toBe('60');
});
it('successful responses retain ETag support and expose it to browser clients',async()=>{
 const response=await read('metrics'),etag=response.headers.get('etag');expect(response.status).toBe(200);expect(etag).toBeTruthy();expect(response.headers.get('access-control-expose-headers')).toContain('ETag');
 const cached=await read('metrics','',{'If-None-Match':etag!});expect(cached.status).toBe(304);
});
it('conditional-GET preflight is read-only and performs no source work',async()=>{
 expect('OPTIONS' in route).toBe(true);
 const response=await route.OPTIONS(new Request('https://example.test/api/v1/metrics',{method:'OPTIONS'}),{params:Promise.resolve({resource:'metrics'})});
 expect(response.status).toBe(204);expect(response.headers.get('access-control-allow-methods')).toBe('GET, HEAD, OPTIONS');expect(response.headers.get('access-control-allow-headers')).toBe('If-None-Match');expect(getSnapshot).not.toHaveBeenCalled();
});
it('status uses a typed code even if the human-facing message changes',async()=>{
 vi.mocked(epochDiff).mockResolvedValue({from:1,to:2,rows:[],urls:[],fetchedAt:new Date().toISOString(),error:'This wording can change safely',errorCode:'not-found'});
 expect((await read('epoch-diff','?from=1&to=2')).status).toBe(404);
});
it('documented header constants match actual route responses',async()=>{
 const spec=JSON.parse(JSON.stringify(openapi()));
 const options=await route.OPTIONS(new Request('https://example.test/api/v1/metrics',{method:'OPTIONS'}),{params:Promise.resolve({resource:'metrics'})});
 const assertHeaders=(response:Response,documented:Record<string,{schema:{const?:string}}>)=>{for(const [name,header] of Object.entries(documented))if(header.schema.const!==undefined)expect(response.headers.get(name),name).toBe(header.schema.const);};
 assertHeaders(options,spec.paths['/metrics'].options.responses['204'].headers);
 const success=await read('metrics');assertHeaders(success,spec.paths['/metrics'].get.responses['200'].headers);
 vi.mocked(detail).mockResolvedValue({kind:'blocks',id:'1',url:'',data:null,fetchedAt:new Date().toISOString(),error:'Please wait',errorCode:'rate-limited'});
 assertHeaders(await read('lookup','?kind=blocks&id=1'),spec.paths['/lookup'].get.responses['429'].headers);
});
