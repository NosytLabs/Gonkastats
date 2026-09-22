import type {Scope,Source,Snapshot} from './types';
import {isSourceFresh} from './insights';
export const registry:{id:string;name:string;scope:Scope;coverage:string;docs:string}[]=[
{id:'epoch',name:'Gonka epoch API',scope:'chain',coverage:'Latest epoch and returned stage boundaries.',docs:'https://rpc.gonka.gg/v1/epochs/latest'},
{id:'participants',name:'Epoch membership',scope:'chain',coverage:'Epoch membership, with current exclusions separately marked. Not the live consensus-power distribution.',docs:'https://rpc.gonka.gg/llms-full.txt'},
{id:'blocks',name:'Indexed blocks',scope:'indexer',coverage:'Latest 60 indexed records. May omit empty blocks; not a complete chain history.',docs:'https://rpc.gonka.gg/api/ch/blocks?limit=60'},
{id:'models',name:'OpenBroker catalog',scope:'provider',coverage:'Provider model availability, not independently measured performance.',docs:'https://api.openbroker.gonka.gg/v1/models'},
{id:'networkModels',name:'Gonka network model list',scope:'chain',coverage:'Models returned by the Gonka API node. Separate from provider availability and governance registration.',docs:'https://rpc.gonka.gg/v1/models'},
{id:'governanceModels',name:'Governance model registry',scope:'chain',coverage:'Governance-registered model metadata. Registration does not prove current PoC activation or provider availability.',docs:'https://rpc.gonka.gg/v1/governance/models'},
{id:'versions',name:'Gonka software versions',scope:'chain',coverage:'Software version metadata returned by the Gonka API node.',docs:'https://rpc.gonka.gg/v1/versions'},
{id:'capabilities',name:'Proxy capabilities',scope:'provider',coverage:'Reported registration capabilities. Not measured benchmarks.',docs:'https://api.proxy.gonka.gg/api/models/capabilities'},
{id:'pricing',name:'Proxy pricing and FX',scope:'provider',coverage:'Advertised price and provider conversion reference. Not a market trade or settled cost.',docs:'https://api.proxy.gonka.gg/api/pricing'},
{id:'params',name:'Inference parameters',scope:'chain',coverage:'Current parameters. Historical escrows retain their creation-time terms.',docs:'https://rpc.gonka.gg/chain-api/productscience/inference/inference/params'},
{id:'supply',name:'Native token supply',scope:'chain',coverage:'Issued supply, not circulating supply or a maximum supply.',docs:'https://rpc.gonka.gg/chain-api/cosmos/bank/v1beta1/supply/by_denom?denom=ngonka'},
{id:'tokenomics',name:'Tokenomics counters',scope:'chain',coverage:'Module cumulative counters, not revenue attribution.',docs:'https://rpc.gonka.gg/chain-api/productscience/inference/inference/tokenomics_data'},
{id:'community',name:'Distribution community pool',scope:'chain',coverage:'Native balance in this module pool, not all ecosystem treasury funds.',docs:'https://rpc.gonka.gg/chain-api/cosmos/distribution/v1beta1/community_pool'},
{id:'governance',name:'Governance proposals',scope:'chain',coverage:'Latest 20 proposals in reverse order. Counts refer only to this window.',docs:'https://rpc.gonka.gg/chain-api/cosmos/gov/v1/proposals'},
{id:'stats',name:'dAPI inference statistics',scope:'indexer',coverage:'Last 24 hours as reported by this API. Global completeness is unverified.',docs:'https://github.com/gonka-ai/gonka/blob/main/decentralized-api/internal/server/public/stats_handlers.go'},
{id:'hardware',name:'Epoch-matched GPU registrations',scope:'chain',coverage:'Current registry entries matched by participant and ML-node ID to declared epoch members, including marked exclusions. Counts are registrations, not independently verified inventory.',docs:'https://rpc.gonka.gg/chain-api/productscience/inference/inference/hardware_nodes_all'},
{id:'catalog',name:'RPC endpoint catalog',scope:'provider',coverage:'Discovery metadata, not proof each endpoint works. Read/write methods stay distinct.',docs:'https://rpc.gonka.gg/api/endpoints'}];
export function emptySnapshot():Snapshot{return {version:1,generatedAt:new Date().toISOString(),mode:'live',sources:[],epoch:null,participants:[],models:[],networkModels:[],governanceModels:[],pocModels:[],devshardVersions:[],versions:{},endpointDeclaredTotal:null,blocks:[],proposals:[],hardware:[],stats:[],fx:null,fxAt:null,totalSupply:null,tokenomics:{},communityPool:null,protocol:{},validators:null,statsWindow:null,endpoints:[],catalogAuth:null};}
export function normalizeSnapshotShape(s:Snapshot):Snapshot{return {...s,networkModels:s.networkModels??[],governanceModels:s.governanceModels??[],pocModels:s.pocModels??[],devshardVersions:s.devshardVersions??[],versions:s.versions??{},endpointDeclaredTotal:s.endpointDeclaredTotal??null,endpoints:s.endpoints??[]};}
export function unavailable(id:string,error='No successful observation'):Source{const d=registry.find(x=>x.id===id)!;return {id,name:d.name,url:d.docs,scope:d.scope,coverage:d.coverage,status:'unavailable',fetchedAt:new Date().toISOString(),sourceTime:null,ttl:300,error};}
export function ageSnapshot(s: Snapshot, mode: 'live' | 'snapshot' = s.mode): Snapshot {
  s=normalizeSnapshotShape(s);
  return {...s, mode, sources: s.sources.map(source => ({...source,
    status: source.status === 'unavailable' ? 'unavailable' : mode === 'snapshot' ? 'snapshot' :
      isSourceFresh(source) ? 'recent' : 'stale'}))};
}
