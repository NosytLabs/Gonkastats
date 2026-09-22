import {z} from 'zod';
import {reconcileModels} from './audit';
import {readJSON,configuredOrigin} from './http';
import {epochData,participantData,blockData,proposalData,modelData,networkModelIds,governanceModelData,versionsData,protocolParamsData,statsData,catalogData,catalogDeclaredTotal,hardwareData,record,scalar} from './normalize';
import {registry,emptySnapshot,unavailable,ageSnapshot,normalizeSnapshotShape} from './sources';
import {ngnk} from './metrics';
import type {Snapshot} from './types';
const prefix='/chain-api/productscience/inference/inference/';
export async function collect(previous?:Snapshot):Promise<Snapshot>{const s=previous?normalizeSnapshotShape(structuredClone(previous)):emptySnapshot();s.mode='live';s.generatedAt=new Date().toISOString();const rpc=configuredOrigin('GONKA_RPC_URL','https://rpc.gonka.gg'),sourceMap=new Map(s.sources.map(x=>[x.id,x])),raw:Record<string,unknown>={};
async function read(id:string,url:string,apply:(d:unknown)=>void){try{const data=await readJSON(url,id==='hardware'?15000:8000,id==='hardware'?8000000:2000000);apply(data);raw[id]=data;const def=registry.find(x=>x.id===id)!;sourceMap.set(id,{id,name:def.name,url,scope:def.scope,coverage:def.coverage,status:'recent',fetchedAt:new Date().toISOString(),sourceTime:null,ttl:id==='hardware'?3600:id==='pricing'?600:300,error:null});}catch(error){const old=sourceMap.get(id),message=error instanceof Error?error.message:'Unknown source error';sourceMap.set(id,old&&old.status!=='unavailable'?{...old,status:'stale',error:message}:{...unavailable(id,message),url});}}
await read('epoch',rpc+'/v1/epochs/latest',d=>{s.epoch=epochData(d);});const now=Math.floor(Date.now()/300000)*300000,from=now-86400000;
await Promise.all([
read('blocks',rpc+'/api/ch/blocks?limit=60',d=>{s.blocks=blockData(d);}),
read('models','https://api.openbroker.gonka.gg/v1/models',d=>{modelData(d,null,null);}),
read('networkModels',rpc+'/v1/models',d=>{s.networkModels=networkModelIds(d);}),
read('governanceModels',rpc+'/v1/governance/models',d=>{s.governanceModels=governanceModelData(d);}),
read('versions',rpc+'/v1/versions',d=>{s.versions=versionsData(d);}),
read('capabilities','https://api.proxy.gonka.gg/api/models/capabilities',d=>{z.object({models:z.array(record)}).parse(d);}),
read('pricing','https://api.proxy.gonka.gg/api/pricing',d=>{const amount=scalar.refine(v=>/^\d{1,80}(\.\d{1,40})?$/.test(v),'Invalid pricing amount');const p=z.object({gonka_usd:amount,fx_updated_at:z.string(),models:z.array(z.object({model_id:z.string(),usd_per_million_tokens:amount.nullish()}).passthrough())}).parse(d);s.fx=p.gonka_usd;s.fxAt=p.fx_updated_at;}),
read('params',rpc+prefix+'params',d=>{const p=protocolParamsData(d);s.protocol=p.protocol;s.pocModels=p.pocModels;s.devshardVersions=p.devshardVersions;}),
read('supply',rpc+'/chain-api/cosmos/bank/v1beta1/supply/by_denom?denom=ngonka',d=>{const p=z.object({amount:z.object({denom:z.literal('ngonka'),amount:scalar})}).parse(d);s.totalSupply=ngnk(p.amount.amount);}),
read('tokenomics',rpc+prefix+'tokenomics_data',d=>{const p=z.object({tokenomics_data:z.record(z.string(),scalar)}).parse(d);s.tokenomics=Object.fromEntries(Object.entries(p.tokenomics_data).map(([k,v])=>[k,ngnk(v)]));}),
read('community',rpc+'/chain-api/cosmos/distribution/v1beta1/community_pool',d=>{const p=z.object({pool:z.array(z.object({denom:z.string(),amount:scalar}))}).parse(d),native=p.pool.find(x=>x.denom==='ngonka');s.communityPool=native?ngnk(native.amount):null;}),
read('governance',rpc+'/chain-api/cosmos/gov/v1/proposals?pagination.limit=20&pagination.reverse=true',d=>{s.proposals=proposalData(d);}),
read('stats',rpc+`/v1/stats/models?time_from=${from}&time_to=${now}`,d=>{s.stats=statsData(d);s.statsWindow={from:new Date(from).toISOString(),to:new Date(now).toISOString()};}),
read('catalog',rpc+'/api/endpoints',d=>{s.endpoints=catalogData(d);s.endpointDeclaredTotal=catalogDeclaredTotal(d);const p=record.parse(d);s.catalogAuth=p.auth?JSON.stringify(p.auth):null;})]);
if(s.epoch){if(previous?.epoch?.id!==s.epoch.id){s.participants=[];s.hardware=[];sourceMap.delete('participants');sourceMap.delete('hardware');}await read('participants',rpc+`/v1/epochs/${s.epoch.id}/participants`,d=>{const p=record.parse(d);s.participants=participantData(d);s.validators=Array.isArray(p.validators)?p.validators.length:null;});}
const oldHardware=sourceMap.get('hardware');if(s.participants.length&&(!oldHardware||previous?.epoch?.id!==s.epoch?.id||Date.now()-Date.parse(oldHardware.fetchedAt)>3600000)){await read('hardware',rpc+prefix+'hardware_nodes_all',d=>{s.hardware=hardwareData(d,s.participants);});}
// Reconcile per-source fields even when one of the three providers fails.
const catalog=raw.models??{data:s.models.map(m=>({id:m.id,owned_by:m.provider}))};
s.models=reconcileModels(s.models,modelData(catalog,raw.capabilities,raw.pricing),{capabilities:raw.capabilities!==undefined,pricing:raw.pricing!==undefined});const price=sourceMap.get('pricing');if(price&&s.fxAt)price.sourceTime=s.fxAt;const capabilities=sourceMap.get('capabilities');if(capabilities&&raw.capabilities){const updated=record.parse(raw.capabilities).updated_at;if(typeof updated==='string')capabilities.sourceTime=updated;}const versions=sourceMap.get('versions');if(versions&&raw.versions){const timestamp=record.parse(raw.versions).timestamp;if(typeof timestamp==='string')versions.sourceTime=timestamp;}const blocks=sourceMap.get('blocks');if(blocks&&s.blocks.length)blocks.sourceTime=s.blocks[0].time;s.sources=registry.map(d=>sourceMap.get(d.id)??unavailable(d.id));s.generatedAt=new Date().toISOString();return ageSnapshot(s);}
