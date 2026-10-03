import type {Participant,Snapshot} from './types';
import {hasObservation} from './insights';

/** A failed source cannot establish that a public address is absent. */
export function memberObservation(s:Snapshot,address:string){
  const available=hasObservation(s,'participants');
  const participant=available?s.participants.find(p=>p.address===address)??null:null;
  const label=!available?'Membership unavailable':!participant?'Not in retained epoch':
    participant.excluded?'Marked excluded':'Declared member';
  return {available,participant,label};
}

/** Hardware is joined by address + node ID, not weight or response order. */
export function sameHardwareMembership(a:Participant[],b:Participant[]):boolean{
  const key=(members:Participant[])=>JSON.stringify(members.map(p=>
    [p.address,p.nodes===null,[...p.nodeIds].sort()] as const
  ).sort((x,y)=>x[0].localeCompare(y[0])));
  return key(a)===key(b);
}
