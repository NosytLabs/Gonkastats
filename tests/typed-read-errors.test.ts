import {afterEach,beforeEach,expect,it,vi} from 'vitest';
vi.mock('server-only',()=>({}));
import {detail,epochDiff} from '../src/core/service';
const state=globalThis as typeof globalThis&{gonkaDetails?:unknown;gonkaReadBudget?:unknown};
beforeEach(()=>{state.gonkaDetails=undefined;state.gonkaReadBudget=undefined;vi.stubEnv('DATA_MODE','live');});
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
it.each([[404,'not-found'],[429,'rate-limited'],[500,'upstream-failed']])('HTTP %s becomes a typed lookup failure',async(status,code)=>{
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}',{status,headers:{'content-type':'application/json'}})));
 expect(await detail('blocks','1')).toMatchObject({errorCode:code,data:null});
});
it('invalid requests and disabled snapshot reads carry separate machine codes',async()=>{
 expect(await detail('blocks','invalid')).toMatchObject({errorCode:'invalid-request'});
 vi.stubEnv('DATA_MODE','snapshot');expect(await detail('blocks','1')).toMatchObject({errorCode:'unavailable'});
});
it('epoch comparison propagates the failed detail code',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('{}',{status:404,headers:{'content-type':'application/json'}})));
 expect(await epochDiff(1,2)).toMatchObject({errorCode:'not-found',rows:[]});
});
it('invalid epoch response shapes carry an upstream failure code',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json({unexpected:true})));
 expect(await epochDiff(1,2)).toMatchObject({errorCode:'upstream-failed',rows:[]});
});
it('does not replay a five-minute cached rate-limit failure after the read budget resets',async()=>{
 state.gonkaReadBudget={start:Date.now(),count:30};
 expect(await detail('blocks','2')).toMatchObject({errorCode:'rate-limited'});
 state.gonkaReadBudget={start:Date.now(),count:0};vi.stubGlobal('fetch',vi.fn(async()=>Response.json({block:{height:'2'}})));
 expect(await detail('blocks','2')).toMatchObject({error:null,data:{block:{height:'2'}}});
});
