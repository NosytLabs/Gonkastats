import {createServer} from 'node:http';
import {afterEach,it,expect} from 'vitest';
import {startServer} from '../scripts/qa-server.mjs';
const servers:ReturnType<typeof createServer>[]=[];
afterEach(async()=>{await Promise.all(servers.splice(0).map(s=>new Promise<void>(resolve=>{s.closeAllConnections();s.close(()=>resolve());})));});
it('never accepts or kills an unrelated service on the requested QA port',async()=>{
 const other=createServer((_req,res)=>{res.writeHead(200,{'content-type':'application/json'});res.end('{}');});servers.push(other);
 await new Promise<void>(resolve=>other.listen(0,'127.0.0.1',resolve));const address=other.address();if(!address||typeof address==='string')throw new Error('Missing port');
 let accepted=false;try{const owned=await startServer(address.port);accepted=true;await owned.stop();}catch(error){expect(String(error)).toMatch(/already in use/);}
 expect(accepted).toBe(false);expect((await fetch('http://127.0.0.1:'+address.port)).status).toBe(200);
});
