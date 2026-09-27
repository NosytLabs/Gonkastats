import {spawn, execSync} from 'node:child_process';

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function winPidsOnPort(port){
  let out='';
  try{out=execSync(`netstat -ano -p tcp | findstr ":${port} .*LISTENING"`,{encoding:'utf8'});}catch{}
  const pids=[...new Set(out.split(/\r?\n/).map(l=>l.trim().split(/\s+/).pop()).filter(p=>/^\d+$/.test(p)))];
  return pids;
}

function killByPort(port,child){
  if(process.platform==='win32'){
    // The Next CLI exits right after spawning its server worker, so the child
    // handle is useless. Kill whatever PID actually owns the port instead.
    for(const pid of winPidsOnPort(port)){
      try{execSync(`taskkill /pid ${pid} /T /F`,{stdio:'ignore'});}catch{}
    }
    try{execSync(`taskkill /pid ${child?.pid??0} /T /F`,{stdio:'ignore'});}catch{}
  }else{
    child?.kill('SIGTERM');
  }
}

/**
 * Spawn `next start` on a fixed port in snapshot mode and wait until the
 * OpenAPI endpoint answers. Fails fast if the port is already taken instead of
 * silently reusing whatever leftover process happens to answer. On Windows the
 * Next CLI orphans its server child on SIGTERM, so stop() must kill the tree.
 */
export async function startServer(port,onData=()=>{}){
  let out='';
  const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],
    {env:{...process.env,DATA_MODE:'snapshot',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
  const pipe=c=>{out+=c.toString();onData(c);};
  server.stdout.on('data',pipe);server.stderr.on('data',pipe);
  const base='http://127.0.0.1:'+port;let ready=false,failure=null;
  for(let i=0;i<60;i++){
    if(/EADDRINUSE|Failed to start server/.test(out)){failure='port '+port+' is already in use (leftover server?)';break;}
    try{const r=await fetch(base+'/api/v1/openapi');if(r.ok){ready=true;break;}}catch{}
    await sleep(1000);
  }
  if(!ready){
    if(failure===null&&server.exitCode!==null)failure='server exited with code '+server.exitCode;
    killByPort(port,server);
    throw new Error('Production server on port '+port+' did not start: '+(failure??'timed out after 60s')+'\n'+out.slice(-2000));
  }
  return {base,child:server,stop(){killByPort(port,server);}};
}
