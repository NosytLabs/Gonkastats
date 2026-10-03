export interface SourceDependency {route:string;sourceIds:string[];purpose:string;}
// Directly displayed metric/context dependencies, not every source in the export bundle.
// A page family owns its detail routes; ad-hoc explorer reads are separately attributed.
export const sourceDependencies:SourceDependency[]=[
 {route:'/',sourceIds:['epoch','participants','hardware','blocks','models','capabilities','pricing','supply','community','stats','params','governance'],purpose:'overview metrics, charts and coverage'},
 {route:'/protocol',sourceIds:['epoch','params','versions','networkModels','governanceModels','catalog'],purpose:'current protocol state'},
 {route:'/models',sourceIds:['models','networkModels','capabilities','pricing','params','governanceModels','participants'],purpose:'model availability, lifecycle and access'},
 {route:'/network',sourceIds:['participants','hardware','epoch','params','networkModels','models'],purpose:'compute membership and hardware'},
 {route:'/participants',sourceIds:['participants','participantStats','epoch'],purpose:'membership and source-reported participant counters'},
 {route:'/hardware',sourceIds:['participants','hardware'],purpose:'epoch-matched hardware registrations'},
 {route:'/epochs',sourceIds:['epoch','blocks','params'],purpose:'current epoch boundaries and timing estimates'},
 {route:'/inference',sourceIds:['stats','params'],purpose:'reported inference statistics and current token price'},
 {route:'/activity',sourceIds:['blocks'],purpose:'indexed chain activity'},
 {route:'/blocks',sourceIds:['blocks'],purpose:'retained indexed block list; canonical details use attributed lookups'},
 {route:'/cost-lab',sourceIds:['models','pricing','params'],purpose:'exact workload cost scenarios'},
 {route:'/workload',sourceIds:['models','capabilities'],purpose:'provider-reported context and output limits'},
 {route:'/providers',sourceIds:['models','capabilities','pricing','params'],purpose:'provider metadata'},
 {route:'/markets',sourceIds:['dex','pricing','supply'],purpose:'wrapped-token quotes, native supply and retained FX observations'},
 {route:'/tokenomics',sourceIds:['tokenomics','params'],purpose:'module counters and current parameters'},
 {route:'/rewards',sourceIds:['tokenomics','params'],purpose:'reward counters and parameters'},
 {route:'/treasury',sourceIds:['community','supply'],purpose:'native community pool and issued supply'},
 {route:'/vesting',sourceIds:['tokenomics','params'],purpose:'current vesting parameters; schedules use attributed lookups'},
 {route:'/devshards',sourceIds:['params'],purpose:'current escrow terms'},
 {route:'/governance',sourceIds:['governance'],purpose:'recent proposal window; details use attributed lookups'},
 {route:'/watchlist',sourceIds:['participants'],purpose:'membership context for locally saved addresses'},
 {route:'/signals',sourceIds:['participants','pricing','params','catalog'],purpose:'deterministic membership, pricing and discovery context'},
 {route:'/agents',sourceIds:['catalog'],purpose:'RPC discovery'},
 {route:'/sources',sourceIds:[],purpose:'source observability'},
];
const aliases:Record<string,string>={'/brokers':'/providers','/proxy':'/providers/proxy','/media':'/pulse','/status':'/sources','/token':'/tokenomics'};
export function dependenciesForRoute(path:string):SourceDependency[]{
 const parts=path.split(/[?#]/,1)[0].split('/').filter(Boolean);const root='/'+(parts[0]??'');
 const canonical=aliases[root]??root;
 return sourceDependencies.filter(x=>x.route===canonical||canonical.startsWith(x.route+'/'));
}
export const sourceDependents=(id:string)=>sourceDependencies.filter(x=>x.sourceIds.includes(id)).map(x=>x.route);
