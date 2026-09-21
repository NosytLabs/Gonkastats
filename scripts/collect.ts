import {collect} from '../src/core/collect';
import {latest,store,closeDB} from '../src/db/store';
let stop=false;process.on('SIGINT',()=>{stop=true;});process.on('SIGTERM',()=>{stop=true;});const seconds=Math.max(120,Number(process.env.COLLECT_INTERVAL_SECONDS)||300);
try{while(!stop){try{const value=await collect(await latest());await store(value);console.log(JSON.stringify({at:value.generatedAt,available:value.sources.filter(s=>s.status!=='unavailable').length,total:value.sources.length}));}catch(e){console.error('Collection failed:',e instanceof Error?e.message:'unknown');}if(process.argv.includes('--once'))break;for(let i=0;i<seconds&&!stop;i++)await new Promise(r=>setTimeout(r,1000));}}finally{await closeDB();}
