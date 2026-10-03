import {createRequire} from 'node:module';

// Test-only owned worker. Use the pinned Next version's production start
// implementation in this process, not a separate CLI launcher or custom app.
// Next upgrades are checked by every production browser suite.
const port=Number(process.argv[2]);
if(!Number.isInteger(port)||port<1||port>65535||!process.send)throw new Error('QA worker requires a valid port and an owner IPC channel');
process.once('disconnect',()=>process.exit(1));
const require=createRequire(import.meta.url);
const {nextStart}=require('next/dist/cli/next-start');
try{
  await nextStart({port,hostname:'127.0.0.1'},process.cwd());
  process.send({type:'gonkastats:ready',pid:process.pid,port});
}catch(error){console.error(error);process.exit(1);}
