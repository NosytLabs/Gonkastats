import {SourceReadError} from './read-errors';
import {parseExact} from './metrics';
let active=0;const waiters:(()=>void)[]=[];
async function acquire(){if(active>=4)await new Promise<void>(r=>waiters.push(r));active++;}
function release(){active--;waiters.shift()?.();}
export function configuredOrigin(name:string,fallback:string):string{const u=new URL(process.env[name]||fallback);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')throw new Error(name+' requires an HTTPS origin without credentials or path');return u.origin;}
export function allowedOrigin(url:string):boolean{try{const u=new URL(url),allowed=[configuredOrigin('GONKA_RPC_URL','https://rpc.gonka.gg'),'https://api.proxy.gonka.gg','https://api.openbroker.gonka.gg','https://api.dexscreener.com','https://api.geckoterminal.com'];if(process.env.FEATHER_URL)allowed.push(configuredOrigin('FEATHER_URL',process.env.FEATHER_URL));return u.protocol==='https:'&&!u.username&&!u.password&&allowed.includes(u.origin);}catch{return false;}}
/** Consume or cancel every body before returning a connection slot. */
export async function readJSON(url:string,timeout=8000,limit=2000000):Promise<unknown>{
 if(!allowedOrigin(url))throw new Error('Source origin is not allowed');
 await acquire();
 let response:Response|undefined,reader:ReadableStreamDefaultReader<Uint8Array>|undefined,consumed=false;
 try{
  response=await fetch(url,{headers:{accept:'application/json','user-agent':'GonkaStats/0.1 (read-only analytics)'},signal:AbortSignal.timeout(timeout),redirect:'error',cache:'no-store'});
  if(!response.ok)throw new SourceReadError(response.status===404?'not-found':response.status===429?'rate-limited':'upstream-failed','Upstream HTTP '+response.status);
  if(!(response.headers.get('content-type')??'').toLowerCase().includes('json'))throw new Error('Upstream did not return JSON');
  if(Number(response.headers.get('content-length'))>limit)throw new Error('Response exceeds size limit');
  if(!response.body)throw new Error('Empty upstream body');
  reader=response.body.getReader();const chunks:Uint8Array[]=[];let length=0;
  while(true){const part=await reader.read();if(part.done){consumed=true;break;}length+=part.value.length;if(length>limit)throw new Error('Response exceeds size limit');chunks.push(part.value);}
  const buffer=new Uint8Array(length);let pos=0;for(const chunk of chunks){buffer.set(chunk,pos);pos+=chunk.length;}
  return parseExact(new TextDecoder().decode(buffer));
 }finally{
  // Cancellation errors must not replace the original HTTP/schema failure.
  try{if(!consumed){try{if(reader)await reader.cancel();else await response?.body?.cancel();}catch{}}}
  finally{try{reader?.releaseLock();}finally{release();}}
 }
}
