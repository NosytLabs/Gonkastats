import type {Snapshot,HistoryPoint} from './types';
export function historyPoint(data:Snapshot):HistoryPoint{
 const at=Date.parse(data.generatedAt);
 const fresh=(id:string)=>{const s=data.sources.find(s=>s.id===id);if(!s||s.status!=='recent'||s.error!==null)return false;const t=Date.parse(s.sourceTime??s.fetchedAt);return Number.isFinite(t)&&Number.isFinite(at)&&t<=at+60000&&at-t<=s.ttl*1000;};
 const members=fresh('participants');
 return {at:data.generatedAt,weight:members?data.participants.reduce((n,p)=>n+BigInt(p.weight),0n).toString():null,price:fresh('pricing')?data.fx:null,participants:members?data.participants.length:null};
}
