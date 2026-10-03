import {expect,it} from 'vitest';
import {memberObservation,sameHardwareMembership} from '../src/core/membership';
import {emptySnapshot,unavailable} from '../src/core/sources';
import type {Participant} from '../src/core/types';
const member:Participant={address:'one',weight:'10',models:[],nodes:2,nodeIds:['b','a'],excluded:false,reason:null};
it('does not infer membership from retained rows when the source is unavailable',()=>{
 const s=emptySnapshot();s.sources=[unavailable('participants')];s.participants=[member];expect(memberObservation(s,'one')).toEqual({available:false,participant:null,label:'Membership unavailable'});
});
it('distinguishes a known absent address from an unavailable observation',()=>{
 const s=emptySnapshot();s.sources=[{...unavailable('participants'),status:'recent',error:null}];expect(memberObservation(s,'one')).toEqual({available:true,participant:null,label:'Not in retained epoch'});
});
it('keeps retained stale membership usable without silently changing source freshness',()=>{
 const s=emptySnapshot();s.sources=[{...unavailable('participants'),status:'stale',error:'Timeout'}];s.participants=[member];expect(memberObservation(s,'one').label).toBe('Declared member');expect(s.sources[0].status).toBe('stale');
});
it('compares hardware join identities independent of order weights and exclusion labels',()=>{
 const second={...member,address:'two',nodeIds:['c']};expect(sameHardwareMembership([member,second],[second,{...member,nodeIds:['a','b'],weight:'999',excluded:true}])).toBe(true);
});
it('distinguishes missing node metadata and real node footprint changes',()=>{
 expect(sameHardwareMembership([member],[{...member,nodes:null}])).toBe(false);expect(sameHardwareMembership([member],[{...member,nodeIds:['c','a']}])).toBe(false);
});
