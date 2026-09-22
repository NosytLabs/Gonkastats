export interface SourceDependency {route:string;sourceIds:string[];purpose:string;}
export const sourceDependencies:SourceDependency[]=[
 {route:'/',sourceIds:['epoch','participants','blocks','models','networkModels','capabilities','pricing','params','governance','catalog'],purpose:'overview'},
 {route:'/protocol',sourceIds:['epoch','params','versions','networkModels','governanceModels','governance','catalog'],purpose:'current protocol state'},
 {route:'/models',sourceIds:['models','networkModels','capabilities','pricing','params','governanceModels','participants'],purpose:'model availability, lifecycle and access'},
 {route:'/network',sourceIds:['participants','hardware','epoch','params','networkModels'],purpose:'compute membership and hardware'},
 {route:'/inference',sourceIds:['stats'],purpose:'reported inference statistics'},
 {route:'/activity',sourceIds:['blocks'],purpose:'indexed chain activity'},
 {route:'/providers',sourceIds:['models','capabilities','pricing'],purpose:'provider metadata'},
 {route:'/agents',sourceIds:['catalog'],purpose:'RPC discovery'},
 {route:'/sources',sourceIds:[],purpose:'source observability'},
];
export const dependenciesForRoute=(path:string)=>sourceDependencies.filter(x=>x.route===path);
export const sourceDependents=(id:string)=>sourceDependencies.filter(x=>x.sourceIds.includes(id)).map(x=>x.route);
