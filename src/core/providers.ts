import type {Snapshot} from './types';
export interface ProviderMetadata {id:'openbroker'|'proxy'|'feather';name:string;scope:string;status:'observed'|'documented'|'not-configured';sourceIds:string[];publicModels:boolean;privateUsage:string;billing:string;}
export function providerMetadata(_s:Pick<Snapshot,'sources'>):ProviderMetadata[]{return [];}
