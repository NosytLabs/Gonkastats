import {mkdir,writeFile,rename} from 'node:fs/promises';
import {collect} from '../src/core/collect';
const snapshot=await collect();await mkdir('data',{recursive:true});await writeFile('data/snapshot.tmp',JSON.stringify(snapshot,null,2));await rename('data/snapshot.tmp','data/snapshot.json');console.log(JSON.stringify({at:snapshot.generatedAt,sources:snapshot.sources.map(s=>({name:s.name,status:s.status,error:s.error}))},null,2));
