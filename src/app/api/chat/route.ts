import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
export const runtime='nodejs';

// Server-side chat proxy. Serves the local, free AntSeed proxy on this machine
// (127.0.0.1:8377) so the browser chat console works same-origin without CORS.
// AntSeed is free/local, so this is not a paid inference path and forwards no
// user credentials. The provider key ('antseed') lives on the server only; it is
// never shipped to the client. OpenBroker remains bring-your-own-key and is not
// routed here (no paid key should pass through this server).
const ANTSEED='http://127.0.0.1:8377/v1/chat/completions';
const ANTSEED_KEY=process.env.ANTSEED_KEY||'antseed';
const BUDGET_MAX=200000; // output token cap (defensive)

export async function OPTIONS(){return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});}

export async function POST(request:Request){
  let body:unknown;const ctype=request.headers.get('content-type')||'';
  if(ctype.includes('application/json')){try{body=await request.json();}catch{return NextResponse.json({error:'Invalid JSON body'},{status:400});}}
  if(!body||typeof body!=='object'||!(body as any).messages||!Array.isArray((body as any).messages)||!(body as any).messages.length){return NextResponse.json({error:'AntSeed chat requires a messages array'},{status:400});}
  const model=(body as any).model||'deepseek-v4-flash';
  const max_tokens=Math.min(Number((body as any).max_tokens)||1200,BUDGET_MAX);
  try{
    const upstream=await fetch(ANTSEED,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+ANTSEED_KEY},body:JSON.stringify({model,messages:(body as any).messages,max_tokens}),cache:'no-store',signal:AbortSignal.timeout(120000)});
    const data=await upstream.json();
    if(!upstream.ok)return NextResponse.json(data,{status:upstream.status<=599?upstream.status:502});
    return NextResponse.json(data,{headers:{'Access-Control-Allow-Origin':'*'}});
  }catch(e){return NextResponse.json({error:e instanceof Error?('AntSeed unreachable: '+e.message):'AntSeed unreachable'},{status:502});}
}
