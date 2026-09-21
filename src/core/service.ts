import 'server-only';
import {readFile} from 'node:fs/promises';
import {collect} from './collect';
import {ageSnapshot,emptySnapshot,registry,unavailable} from './sources';
import {readJSON,configuredOrigin} from './http';
import {bech32Address} from './metrics';
import {participantData} from './normalize';
import Decimal from 'decimal.js';
import type {Snapshot,Detail,EpochDiff} from './types';
import {latest} from '../db/store';
const state=globalThis as typeof globalThis & {gonkaCache?:{value:Snapshot;expires:number};gonkaFlight?:Promise<Snapshot>;gonkaDetails?:Map<string,{value:Detail|EpochDiff;expires:number}>;gonkaReadBudget?:{start:number;count:number}};
export async function getSnapshot():Promise<Snapshot>{if(state.gonkaCache&&Date.now()<state.gonkaCache.expires)return ageSnapshot(state.gonkaCache.value);if(state.gonkaFlight)return state.gonkaFlight;state.gonkaFlight=(async()=>{let value:Snapshot|undefined;
if(process.env.DATA_MODE==='snapshot'){try{value=JSON.parse(await readFile('data/snapshot.json','utf8')) as Snapshot;if(value.version!==1)throw new Error('Unsupported snapshot');value=ageSnapshot(value,'snapshot');}catch{value=emptySnapshot();value.mode='snapshot';value.sources=registry.map(x=>unavailable(x.id,'Snapshot file is missing or invalid. Run npm run snapshot.'));}}
else if(process.env.DATABASE_URL){try{value=await latest();}catch{}if(!value){value=emptySnapshot();value.sources=registry.map(x=>unavailable(x.id,'Database configured but no collected snapshot is available. Run the collector.'));}}
else{value=await collect(state.gonkaCache?.value);}state.gonkaCache={value,expires:Date.now()+120000};return ageSnapshot(value);})().finally(()=>{state.gonkaFlight=undefined;});return state.gonkaFlight;}
function budget(){const now=Date.now();if(!state.gonkaReadBudget||now-state.gonkaReadBudget.start>60000)state.gonkaReadBudget={start:now,count:0};if(++state.gonkaReadBudget.count>30)throw new Error('Read budget reached; try again next minute.');}
export async function detail(kind:string,id:string):Promise<Detail>{const rpc=configuredOrigin('GONKA_RPC_URL','https://rpc.gonka.gg');let url='';
if(kind==='blocks'&&/^\d{1,10}$/.test(id))url=rpc+'/chain-rpc/block?height='+id;
if(kind==='transactions'&&/^[a-fA-F0-9]{64}$/.test(id))url=rpc+'/api/ch/tx/'+id;
if(kind==='addresses'&&bech32Address(id))url=rpc+'/chain-api/cosmos/bank/v1beta1/balances/'+id+'?pagination.limit=100';
if(kind==='vesting'&&bech32Address(id))url=rpc+'/chain-api/productscience/inference/streamvesting/vesting_schedule/'+id;
if(kind==='history'&&bech32Address(id))url=rpc+'/api/ch/address/'+id+'?limit=50';
if(kind==='governance'&&/^\d{1,8}$/.test(id))url=rpc+'/chain-api/cosmos/gov/v1/proposals/'+id;
if(kind==='epochs'&&/^\d{1,6}$/.test(id))url=rpc+'/v1/epochs/'+id+'/participants';
const result:Detail={kind,id,url,fetchedAt:new Date().toISOString(),data:null,error:null};if(!url)return {...result,error:'Invalid lookup.'};const key=kind+':'+id;state.gonkaDetails??=new Map();const cached=state.gonkaDetails.get(key);if(cached&&cached.expires>Date.now())return cached.value as Detail;if(process.env.DATA_MODE==='snapshot')return {...result,error:'Live lookup is disabled in snapshot mode.'};try{budget();result.data=await readJSON(url);}catch(e){result.error=e instanceof Error?e.message:'Source unavailable';}if(state.gonkaDetails.size>100)state.gonkaDetails.delete(state.gonkaDetails.keys().next().value!);state.gonkaDetails.set(key,{value:result,expires:Date.now()+300000});return result;}
export async function epochDiff(from:number,to:number):Promise<EpochDiff>{if(!Number.isInteger(from)||!Number.isInteger(to)||from<1||to<=from||to-from>30||to>1000000)throw new Error('Choose two epochs, at most 30 epochs apart.');const [a,b]=await Promise.all([detail('epochs',String(from)),detail('epochs',String(to))]);const base:EpochDiff={from,to,fetchedAt:new Date().toISOString(),urls:[a.url,b.url],rows:[],error:a.error??b.error};if(base.error)return base;try{const first=new Map(participantData(a.data).map(p=>[p.address,p.weight])),last=new Map(participantData(b.data).map(p=>[p.address,p.weight]));base.rows=[...new Set([...first.keys(),...last.keys()])].map(address=>({address,before:first.get(address)??null,after:last.get(address)??null,delta:new Decimal(last.get(address)??0).minus(first.get(address)??0).toFixed(),state:!first.has(address)?'joined' as const:!last.has(address)?'left' as const:'retained' as const}));}catch{base.error='One epoch returned an unsupported membership schema.';}return base;}
