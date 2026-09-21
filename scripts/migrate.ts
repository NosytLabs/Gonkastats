import postgres from 'postgres';
import {readFile} from 'node:fs/promises';
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL first.');
const sql=postgres(process.env.DATABASE_URL,{max:1});
try{await sql.unsafe(await readFile('migrations/0001_snapshots.sql','utf8'));console.log('Additive snapshot migration applied.');}finally{await sql.end();}
