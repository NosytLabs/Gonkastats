import {createHash} from 'node:crypto';
import Decimal from 'decimal.js';
import {getSnapshot,detail,epochDiff} from '@/core/service';
import {history} from '@/db/store';
import {apiDefinitions,validateQuery} from '@/core/api-definitions';
import {metricData,healthData,chartData} from '@/core/api-data';
import {openapi} from '@/core/openapi';
import {simulateCost} from '@/core/cost';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const state=globalThis as typeof globalThis & {gonkaApiBudget?:{at:number;count:number}};
function headers(){return {'Cache-Control':'public, max-age=0, s-maxage=30, stale-while-revalidate=60','Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff'};}
export async function GET(request:Request,{params}:{params:Promise<{resource:string}>}){
 const {resource}=await params,def=apiDefinitions.find(d=>d.id===resource);
 if(!def)return Response.json({error:'Unknown read-only endpoint'},{status:404,headers:headers()});
 let query:Record<string,string>;
 try{query=validateQuery(def,new URL(request.url).searchParams);}catch(e){return Response.json({error:e instanceof Error?e.message:'Invalid query'},{status:400,headers:{...headers(),'Cache-Control':'no-store'}});}
 if(resource==='openapi')return Response.json(openapi(),{headers:headers()});
 const now=Date.now();if(!state.gonkaApiBudget||now-state.gonkaApiBudget.at>=60000)state.gonkaApiBudget={at:now,count:0};if(++state.gonkaApiBudget.count>240)return Response.json({error:'Public read budget reached. Try again in one minute.'},{status:429,headers:{...headers(),'Cache-Control':'no-store','Retry-After':'60'}});
 try{const s=await getSnapshot();let data:unknown,status=200,pagination:unknown;const meta:{schemaVersion:string;generatedAt:string;mode:string;sources:typeof s.sources;pagination?:unknown;coverage?:string}={schemaVersion:'1',generatedAt:s.generatedAt,mode:s.mode,sources:s.sources};
 const page=<T,>(rows:T[],text:(row:T)=>string)=>{const selected=rows.filter(r=>!query.q||text(r).toLowerCase().includes(query.q.toLowerCase())),offset=Number(query.offset??0),limit=Number(query.limit??20);const result=selected.slice(offset,offset+limit);pagination={offset,limit,returned:result.length,retainedMatches:selected.length};return result;};
 switch(resource){
 case 'overview':data=s;break;
 case 'metrics':data=metricData(s);break;
 case 'models':{let rows=s.models.filter(m=>!query.capability||(query.capability==='tools'?m.tools===true:m.reasoning===true));rows=[...rows].sort((a,b)=>query.sort==='context'?(b.context??-1)-(a.context??-1):query.sort==='price'?a.price===null?1:b.price===null?-1:new Decimal(a.price).cmp(b.price):a.name.localeCompare(b.name));data=page(rows,m=>m.id);break;}
 case 'participants':data=page(s.participants,p=>p.address+' '+p.models.join(' '));break;
 case 'blocks':data=page(s.blocks,b=>String(b.height));break;
 case 'epochs':data=s.epoch;break;
 case 'inference':data={models:s.stats,window:s.statsWindow,coverage:'API-node-reported; global DevShard completeness not verified',source:s.sources.find(x=>x.id==='stats')};break;
 case 'live':data=s.blocks.filter(b=>!query.since||Date.parse(b.time)>=Date.parse(query.since)).slice(0,Number(query.limit??20)).map(b=>({type:'indexed-block',id:String(b.height),at:b.time,transactions:b.transactions,gas:b.gas,href:'/blocks/'+b.height}));meta.coverage='Retained indexed blocks only. Not every transaction or inference event.';break;
 case 'sources':data=s.sources;break;
 case 'health':case 'status':data=healthData(s);if(healthData(s).usableSources===0)status=503;break;
 case 'endpoints':data=page(s.endpoints.filter(e=>query.method==='ALL'||e.method===(query.method??'GET')),e=>e.path+' '+e.description+' '+e.group);break;
 case 'history':case 'charts':{const points=await history(Number(query.hours??24));data=resource==='history'?{points,storage:process.env.DATABASE_URL?'configured':'not-configured'}:{...chartData(points,(query.metric??'weight') as 'weight'|'price'|'participants',Number(query.maxPoints??200)),storage:process.env.DATABASE_URL?'configured':'not-configured'};meta.coverage='Only actual retained database observations. No fabricated backfill.';break;}
 case 'lookup':{const result=await detail(query.kind,query.id);data=result;if(result.error)status=result.error==='Invalid lookup.'?400:result.error.includes('budget')?429:result.error.includes('404')?404:result.error.includes('snapshot')?503:502;break;}
 case 'epoch-diff':{if(Number(query.to)<=Number(query.from)||Number(query.to)-Number(query.from)>30)return Response.json({error:'Choose increasing epochs at most 30 apart'},{status:400});data=await epochDiff(Number(query.from),Number(query.to));break;}
 case 'simulate-cost':{const model=query.model?s.models.find(m=>m.id===query.model):s.models[0];if(query.model&&!model)return Response.json({error:'Model not present in the observed catalog'},{status:404});try{data={...simulateCost({prompt:query.prompt,completion:query.completion,requests:query.requests,attempts:query.attempts},{tokenPrice:s.protocol['devshard_escrow_params.token_price']??null,providerPrice:model?.price??null,fx:s.fx}),model:model?.id??null,classification:'scenario',excludes:['escrow creation','per-nonce fees','gas','separate ledger adjustments']};}catch(e){return Response.json({error:e instanceof Error?e.message:'Invalid scenario'},{status:400});}break;}
 default:return Response.json({error:'Unimplemented endpoint'},{status:404});
 }
 if(pagination)meta.pagination=pagination;const payload={data,meta},text=JSON.stringify(payload),etag='"'+createHash('sha256').update(text).digest('hex')+'"';if(status===200&&request.headers.get('If-None-Match')===etag)return new Response(null,{status:304,headers:{...headers(),ETag:etag}});return new Response(text,{status,headers:{...headers(),'Content-Type':'application/json; charset=utf-8',ETag:etag,...(status>=400?{'Cache-Control':'no-store'}:{})}});
 }catch(e){console.error('Read-only API error:',e instanceof Error?e.name:'Unknown');return Response.json({error:'The requested source operation could not be completed'},{status:502,headers:{...headers(),'Cache-Control':'no-store'}});}
}
