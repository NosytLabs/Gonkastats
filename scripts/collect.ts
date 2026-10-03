import {collect} from '../src/core/collect';
import {latest,store,closeDB} from '../src/db/store';
let stop=false;
process.on('SIGINT',()=>{stop=true;});process.on('SIGTERM',()=>{stop=true;});
const once=process.argv.includes('--once');
const configuredSeconds=Number(process.env.COLLECT_INTERVAL_SECONDS);
const seconds=Number.isFinite(configuredSeconds)&&configuredSeconds>0?Math.max(120,configuredSeconds):300;
if(!process.env.DATABASE_URL){
 console.error('DATABASE_URL is required for durable collection. Use npm run snapshot for a local public observation.');process.exitCode=1;
}else{
 try{
  while(!stop){
   try{const value=await collect(await latest());await store(value);console.log(JSON.stringify({at:value.generatedAt,available:value.sources.filter(source=>source.status!=='unavailable').length,total:value.sources.length}));}
   catch(error){console.error('Collection failed:',error instanceof Error?error.message:'unknown');if(once)process.exitCode=1;}
   if(once)break;
   for(let i=0;i<seconds&&!stop;i++)await new Promise(resolve=>setTimeout(resolve,1000));
  }
 }finally{await closeDB();}
}
