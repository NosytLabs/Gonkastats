import {productionStart} from './qa-next.mjs';

// Test-only owned worker. Use the pinned Next version's production start
// implementation in this process, not a separate CLI launcher or custom app.
// The export is unit-tested; startup, handshake and shutdown are browser-tested.
const port=Number(process.argv[2]);
if(!Number.isInteger(port)||port<1||port>65535||!process.send)throw new Error('QA worker requires a valid port and an owner IPC channel');
process.once('disconnect',()=>process.exit(1));
try{
  await productionStart()({port,hostname:'127.0.0.1'},process.cwd());
  process.send({type:'gonkastats:ready',pid:process.pid,port});
}catch(error){console.error(error);process.exit(1);}
