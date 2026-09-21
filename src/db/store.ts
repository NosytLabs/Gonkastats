import postgres from 'postgres';
import {drizzle} from 'drizzle-orm/postgres-js';
import {desc,gte} from 'drizzle-orm';
import {createHash} from 'node:crypto';
import {snapshots} from './schema';
import {historyPoint} from '../core/history-point';
import type {Snapshot,HistoryPoint} from '../core/types';
let connection:ReturnType<typeof postgres>|undefined;
function db(){if(!process.env.DATABASE_URL)throw new Error('Database is not configured');connection??=postgres(process.env.DATABASE_URL,{max:2,connect_timeout:5,idle_timeout:20});return drizzle(connection);}
export async function latest():Promise<Snapshot|undefined>{const rows=await db().select().from(snapshots).orderBy(desc(snapshots.slot)).limit(1);return rows[0]?.data;}
export async function store(value:Snapshot){const slot=new Date(Math.floor(Date.parse(value.generatedAt)/300000)*300000),checksum=createHash('sha256').update(JSON.stringify(value)).digest('hex');await db().insert(snapshots).values({slot,collectedAt:new Date(value.generatedAt),checksum,data:value}).onConflictDoUpdate({target:snapshots.slot,set:{data:value,checksum,collectedAt:new Date(value.generatedAt)}});}
export async function history(hours=24):Promise<HistoryPoint[]>{if(!process.env.DATABASE_URL)return [];const rows=await db().select().from(snapshots).where(gte(snapshots.slot,new Date(Date.now()-Math.min(168,Math.max(1,hours))*3600000))).orderBy(desc(snapshots.slot)).limit(2048);return rows.reverse().map(({data})=>historyPoint(data));}
export async function closeDB(){await connection?.end();connection=undefined;}
