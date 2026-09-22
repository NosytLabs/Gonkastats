export interface SourceDependency {route:string;sourceIds:string[];purpose:string;}
export const sourceDependencies:SourceDependency[]=[];
export const dependenciesForRoute=(path:string)=>sourceDependencies.filter(x=>x.route===path);
export const sourceDependents=(id:string)=>sourceDependencies.filter(x=>x.sourceIds.includes(id)).map(x=>x.route);
