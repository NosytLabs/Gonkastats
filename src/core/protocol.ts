import type {Snapshot} from './types';

export type ProtocolModelState='active'|'provider-only'|'registered-inactive'|'poc-only'|'network-only'|'unknown';
export interface ProtocolModelStatus {
  id:string;
  name:string;
  state:ProtocolModelState;
  providerAvailable:boolean|null;
  networkAvailable:boolean|null;
  governanceRegistered:boolean|null;
  pocActive:boolean|null;
  weightScaleFactor:string|null;
}
export interface ProtocolSnapshot {
  models:ProtocolModelStatus[];
  pocModelCoverage:'observed'|'unavailable';
  networkModelCoverage:'observed'|'unavailable';
  governanceModelCoverage:'observed'|'unavailable';
  devshardVersions:{name:string;binary:string|null;sha256:string|null}[];
  endpointCount:number|null;
  versions:Record<string,string>;
}

const observed=(s:Snapshot,id:string)=>s.sources.some(source=>source.id===id&&source.status!=='unavailable');
const fallbackName=(id:string)=>id.split('/').at(-1)??id;

export function buildProtocolSnapshot(s:Snapshot):ProtocolSnapshot {
  const providerObserved=observed(s,'models');
  const networkObserved=observed(s,'networkModels');
  const governanceObserved=observed(s,'governanceModels');
  const pocObserved=observed(s,'params');
  const provider=new Map((s.models??[]).map(m=>[m.id,m.name]));
  const network=new Set(s.networkModels??[]);
  const governance=new Set((s.governanceModels??[]).map(m=>m.id));
  const poc=new Map((s.pocModels??[]).map(m=>[m.id,m]));
  const ids=[...new Set([...(s.networkModels??[]),...(s.pocModels??[]).map(m=>m.id),...(s.models??[]).map(m=>m.id),...(s.governanceModels??[]).map(m=>m.id)])];
  const models=ids.map(id=>{
    const inProvider=provider.has(id),inNetwork=network.has(id),inGovernance=governance.has(id),inPoc=poc.has(id);
    let state:ProtocolModelState='unknown';
    if(networkObserved&&pocObserved){
      if(inNetwork&&inPoc)state='active';
      else if(inPoc)state='poc-only';
      else if(inNetwork)state='network-only';
      else if(inGovernance&&governanceObserved)state='registered-inactive';
      else if(inProvider&&providerObserved)state='provider-only';
    }
    return {
      id,
      name:provider.get(id)??fallbackName(id),
      state,
      providerAvailable:providerObserved?inProvider:null,
      networkAvailable:networkObserved?inNetwork:null,
      governanceRegistered:governanceObserved?inGovernance:null,
      pocActive:pocObserved?inPoc:null,
      weightScaleFactor:poc.get(id)?.weightScaleFactor??null,
    };
  });
  return {
    models,
    pocModelCoverage:pocObserved?'observed':'unavailable',
    networkModelCoverage:networkObserved?'observed':'unavailable',
    governanceModelCoverage:governanceObserved?'observed':'unavailable',
    devshardVersions:pocObserved?[...(s.devshardVersions??[])]:[],
    endpointCount:s.endpointDeclaredTotal??(s.endpoints?.length||null),
    versions:{...(s.versions??{})},
  };
}

export function modelStatusMap(s:Snapshot):Map<string,ProtocolModelStatus>{
  return new Map(buildProtocolSnapshot(s).models.map(model=>[model.id,model]));
}
