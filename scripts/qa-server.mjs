import {fork,execFileSync} from 'node:child_process';
import {createServer} from 'node:net';

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

async function requireFreePort(port){
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('QA port must be an integer from 1 to 65535');
  await new Promise((resolve,reject)=>{
    const probe=createServer();
    probe.once('error',error=>reject(new Error(error.code==='EADDRINUSE'?'QA port '+port+' is already in use; existing service left untouched':error.message)));
    probe.listen({port,host:'127.0.0.1',exclusive:true},()=>probe.close(error=>error?reject(error):resolve()));
  });
}

/** Own one server process and await its IPC readiness; never adopt a port owner. */
export async function startServer(port,onData=()=>{}){
  await requireFreePort(port);
  let output='',spawnError=null,ready=false;
  const child=fork(new URL('./qa-worker.mjs',import.meta.url),[String(port)],{
    execPath:process.execPath,execArgv:[],
    env:{...process.env,NODE_ENV:'production',DATA_MODE:'snapshot',NEXT_TELEMETRY_DISABLED:'1'},
    stdio:['ignore','pipe','pipe','ipc'],
  });
  const pipe=chunk=>{output=(output+chunk.toString()).slice(-20000);onData(chunk);};
  child.stdout.on('data',pipe);child.stderr.on('data',pipe);
  child.once('error',error=>{spawnError=error;});
  child.on('message',message=>{if(message?.type==='gonkastats:ready'&&message.pid===child.pid&&message.port===port)ready=true;});
  const exited=new Promise(resolve=>child.once('exit',resolve));
  let stopping;
  const stop=()=>stopping??=(async()=>{
    // This PID is the listening worker itself. Do not kill a dead/reused PID.
    if(child.exitCode!==null||child.signalCode!==null||!child.pid)return;
    if(process.platform==='win32'){
      try{execFileSync('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore'});}catch{}
    }else child.kill('SIGTERM');
    let timer;
    const done=await Promise.race([exited.then(()=>true),new Promise(resolve=>{timer=setTimeout(()=>resolve(false),3000);})]);
    clearTimeout(timer);
    if(!done&&child.exitCode===null&&child.signalCode===null){child.kill('SIGKILL');await exited;}
  })();
  const base='http://127.0.0.1:'+port,deadline=Date.now()+60000;
  try{
    while(Date.now()<deadline){
      if(spawnError)throw spawnError;
      if(/EADDRINUSE|Failed to start server/.test(output))throw new Error('QA port '+port+' is already in use; existing service left untouched');
      if(child.exitCode!==null||child.signalCode!==null)throw new Error('Owned QA server exited before readiness');
      if(ready){try{const response=await fetch(base+'/api/v1/openapi',{signal:AbortSignal.timeout(1500)});if(response.ok)return {base,child,stop};}catch{}}
      await sleep(200);
    }
    throw new Error(ready?'Owned server never answered /api/v1/openapi within 60 seconds':'Owned server never signaled IPC readiness within 60 seconds');
  }catch(error){await stop();throw new Error('Production server on port '+port+' did not start: '+error.message+'\n'+output.slice(-2000));}
}
