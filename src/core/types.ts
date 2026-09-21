export type Scope='chain'|'indexer'|'provider'|'estimate';
export type Freshness='recent'|'stale'|'snapshot'|'unavailable';
export interface Source {id:string;name:string;url:string;scope:Scope;status:Freshness;fetchedAt:string;sourceTime:string|null;ttl:number;error:string|null;coverage:string;}
export interface Epoch {id:number;height:number;phase:string;start:number;end:number;boundaries:{label:string;height:number}[];progress:number;remaining:number;}
export interface Participant {address:string;weight:string;models:string[];nodes:number|null;nodeIds:string[];excluded:boolean;reason:string|null;}
export interface Model {id:string;name:string;slug:string;provider:string;context:number|null;output:number|null;vram:number|null;tools:boolean|null;reasoning:boolean|null;price:string|null;ngonka:string|null;hfRepo:string|null;hfCommit:string|null;}
export interface Block {height:number;time:string;transactions:number;gas:string;}
export interface Proposal {id:string;title:string;summary:string;status:string;votingStart:string;votingEnd:string;messages:string[];yes:string;no:string;abstain:string;}
export interface Hardware {model:string;count:number;}
export interface ModelStat {model:string;tokens:string;requests:string;}
export interface Endpoint {method:string;path:string;description:string;group:string;params:string;cache:string;}
export interface Snapshot {version:1;generatedAt:string;mode:'live'|'snapshot';sources:Source[];epoch:Epoch|null;participants:Participant[];models:Model[];blocks:Block[];proposals:Proposal[];hardware:Hardware[];stats:ModelStat[];fx:string|null;fxAt:string|null;totalSupply:string|null;tokenomics:Record<string,string>;communityPool:string|null;protocol:Record<string,string>;validators:number|null;statsWindow:{from:string;to:string}|null;endpoints:Endpoint[];catalogAuth:string|null;}
export interface Detail {kind:string;id:string;url:string;fetchedAt:string;data:unknown|null;error:string|null;}
export interface HistoryPoint {gap?:true;at:string;weight:string|null;price:string|null;participants:number|null;}
export interface EpochDiff {from:number;to:number;fetchedAt:string;rows:{address:string;before:string|null;after:string|null;delta:string;state:'joined'|'left'|'retained'}[];urls:string[];error:string|null;}
