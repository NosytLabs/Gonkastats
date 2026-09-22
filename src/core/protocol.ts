export type ProtocolModelState='active'|'provider-only'|'registered-inactive'|'poc-only'|'network-only'|'unknown';
export function buildProtocolSnapshot(_s:unknown){return {models:[],pocModelCoverage:'unavailable',networkModelCoverage:'unavailable',governanceModelCoverage:'unavailable',devshardVersions:[],endpointCount:null,versions:{}};}
export function modelStatusMap(s:unknown){return new Map(buildProtocolSnapshot(s).models.map((model:any)=>[model.id,model]));}
