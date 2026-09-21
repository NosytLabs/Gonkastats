import type {Snapshot,HistoryPoint} from './types';
import {isSourceFresh} from './insights';
export function historyPoint(data:Snapshot):HistoryPoint{
 const at=Date.parse(data.generatedAt);
 const fresh=(id:string)=>{const source=data.sources.find(s=>s.id===id);return source?.status==='recent'&&isSourceFresh(source,at);};
 const members=fresh('participants');
 return {at:data.generatedAt,weight:members?data.participants.reduce((n,p)=>n+BigInt(p.weight),0n).toString():null,price:fresh('pricing')?data.fx:null,participants:members?data.participants.length:null};
}
