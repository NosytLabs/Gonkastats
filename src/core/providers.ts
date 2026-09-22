import type {Snapshot} from './types';
export interface ProviderMetadata {id:'openbroker'|'proxy'|'feather';name:string;scope:string;status:'observed'|'documented'|'not-configured';sourceIds:string[];publicModels:boolean;privateUsage:string;billing:string;}
const observed=(s:Pick<Snapshot,'sources'>,ids:string[])=>ids.some(id=>s.sources.some(source=>source.id===id&&source.status!=='unavailable'));
export function providerMetadata(s:Pick<Snapshot,'sources'>):ProviderMetadata[]{return [
 {id:'openbroker',name:'OpenBroker',scope:'managed provider',status:observed(s,['models'])?'observed':'documented',sourceIds:['models'],publicModels:true,privateUsage:'Documented; not connected',billing:'GNK/ngonka provider ledger'},
 {id:'proxy',name:'Proxy by gonka.gg',scope:'managed provider',status:observed(s,['capabilities','pricing'])?'observed':'documented',sourceIds:['capabilities','pricing'],publicModels:true,privateUsage:'Provider account; not connected',billing:'Provider-advertised USD/GNK pricing metadata'},
 {id:'feather',name:'Feather',scope:'self-hosted indexer',status:'not-configured',sourceIds:[],publicModels:false,privateUsage:'N/A',billing:'Operator infrastructure; no GonkaStats instance configured'},
];}
