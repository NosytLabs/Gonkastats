import {afterEach,beforeEach,expect,it,vi} from 'vitest';
vi.mock('server-only',()=>({}));
import {detail} from '../src/core/service';
const state=globalThis as typeof globalThis&{gonkaDetails?:Map<string,unknown>;gonkaDetailFlights?:Map<string,unknown>;gonkaReadBudget?:{start:number;count:number}};
beforeEach(()=>{state.gonkaDetails=undefined;state.gonkaDetailFlights=undefined;state.gonkaReadBudget=undefined;vi.stubEnv('DATA_MODE','live');});
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
it('coalesces identical concurrent public lookups into one source read and one budget debit',async()=>{
 const pending:((r:Response)=>void)[]=[];const fetcher=vi.fn(()=>new Promise<Response>(r=>{pending.push(r);}));vi.stubGlobal('fetch',fetcher);
 const reads=Array.from({length:3},()=>detail('blocks','10'));
 await vi.waitFor(()=>expect(fetcher).toHaveBeenCalled());const calls=fetcher.mock.calls.length;
 // Release every pending response in the old implementation too: no hung tests.
 for(const respond of pending)respond(Response.json({height:'10'}));
 expect(calls).toBe(1);
 const values=await Promise.all(reads);expect(values.every(v=>v.error===null)).toBe(true);expect(state.gonkaReadBudget?.count).toBe(1);expect(state.gonkaDetailFlights?.size).toBe(0);
});
it('coalesces failures but allows a new attempt after the failure settles',async()=>{
 const fetcher=vi.fn(async()=>new Response('{}',{status:503,headers:{'content-type':'application/json'}}));vi.stubGlobal('fetch',fetcher);
 const failed=await Promise.all([detail('blocks','11'),detail('blocks','11')]);expect(failed.every(v=>v.errorCode==='upstream-failed')).toBe(true);expect(fetcher).toHaveBeenCalledTimes(1);
 fetcher.mockResolvedValue(Response.json({height:'11'}));expect(await detail('blocks','11')).toMatchObject({error:null});expect(fetcher).toHaveBeenCalledTimes(2);
});
it('keeps independent lookup identifiers independent',async()=>{
 const fetcher=vi.fn(async()=>Response.json({ok:true}));vi.stubGlobal('fetch',fetcher);
 const results=await Promise.all([detail('blocks','12'),detail('blocks','13')]);expect(results.map(v=>v.id)).toEqual(['12','13']);expect(fetcher).toHaveBeenCalledTimes(2);
});
it('does not reuse a cached observation from a differently configured source origin',async()=>{
 const fetcher=vi.fn(async()=>Response.json({ok:true}));vi.stubGlobal('fetch',fetcher);
 await detail('blocks','14');vi.stubEnv('GONKA_RPC_URL','https://alternate.example');
 expect((await detail('blocks','14')).url).toMatch(/^https:\/\/alternate\.example\//);expect(fetcher).toHaveBeenCalledTimes(2);
});
it('snapshot mode never reuses an earlier live detail cache entry',async()=>{
 const fetcher=vi.fn(async()=>Response.json({ok:true}));vi.stubGlobal('fetch',fetcher);
 await detail('blocks','15');vi.stubEnv('DATA_MODE','snapshot');expect(await detail('blocks','15')).toMatchObject({errorCode:'unavailable',data:null});expect(fetcher).toHaveBeenCalledTimes(1);
});
