import {afterEach,expect,it,vi} from 'vitest';
import {readJSON} from '../src/core/http';
const url='https://rpc.gonka.gg/v1/versions';
afterEach(()=>vi.unstubAllGlobals());
it.each([404,429,500])('cancels an unread HTTP %s response before rejecting',async status=>{
 const cancel=vi.fn();const body=new ReadableStream<Uint8Array>({cancel});
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(body,{status,headers:{'content-type':'application/json'}})));
 await expect(readJSON(url)).rejects.toThrow('Upstream HTTP '+status);expect(cancel).toHaveBeenCalledOnce();
});
it.each([['text/html','10','JSON'],['application/json','900','size limit']])('cancels responses rejected by headers (%s)',async(type,length,message)=>{
 const cancel=vi.fn();const body=new ReadableStream<Uint8Array>({cancel});
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(body,{headers:{'content-type':type,'content-length':length}})));
 await expect(readJSON(url,8000,100)).rejects.toThrow(message);expect(cancel).toHaveBeenCalledOnce();
});
it('releases the stream reader after a successfully consumed exact JSON response',async()=>{
 const response=new Response('{"height":9007199254740993}',{headers:{'content-type':'application/json'}});
 vi.stubGlobal('fetch',vi.fn(async()=>response));expect(await readJSON(url)).toEqual({height:'9007199254740993'});expect(response.body?.locked).toBe(false);
});
it('cancels and unlocks an oversized streamed body',async()=>{
 const cancel=vi.fn();const body=new ReadableStream<Uint8Array>({start(c){c.enqueue(new TextEncoder().encode('123456'));},cancel});
 const response=new Response(body,{headers:{'content-type':'application/json'}});vi.stubGlobal('fetch',vi.fn(async()=>response));
 await expect(readJSON(url,8000,3)).rejects.toThrow('size limit');expect(cancel).toHaveBeenCalledOnce();expect(body.locked).toBe(false);
});
it('preserves the primary HTTP error if cancellation itself fails',async()=>{
 const body=new ReadableStream<Uint8Array>({cancel(){throw new Error('cancel failed');}});
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(body,{status:404})));await expect(readJSON(url)).rejects.toThrow('Upstream HTTP 404');
});
