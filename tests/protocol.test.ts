import {describe,it,expect} from 'vitest';
import {buildProtocolSnapshot} from '../src/core/protocol';
import {emptySnapshot} from '../src/core/sources';
import type {Model} from '../src/core/types';
const model=(id:string,name=id):Model=>({id,name,slug:Buffer.from(id).toString('hex'),provider:'openbroker',context:null,output:null,vram:null,tools:null,reasoning:null,price:null,ngonka:null,hfRepo:null,hfCommit:null});
const observed=(id:string)=>({id,name:id,url:'https://example.test/'+id,scope:'chain' as const,status:'recent' as const,fetchedAt:'2026-09-22T05:00:00Z',sourceTime:null,ttl:300,error:null,coverage:'fixture'});
describe('protocol snapshot',()=>{
 it('separates active, provider-only, PoC-only and governance-only models',()=>{const s:any=emptySnapshot();s.sources=['models','networkModels','governanceModels','params'].map(observed);s.models=[model('a'),model('b')];s.networkModels=['a'];s.pocModels=[{id:'a',seqLen:'1024',weightScaleFactor:'0.3',penaltyStartEpoch:'1'},{id:'c',seqLen:null,weightScaleFactor:null,penaltyStartEpoch:null}];s.governanceModels=[{id:'a',hfRepo:null,hfCommit:null,vram:null,unitsOfComputePerToken:null,throughputPerNonce:null},{id:'d',hfRepo:null,hfCommit:null,vram:null,unitsOfComputePerToken:null,throughputPerNonce:null}];expect(buildProtocolSnapshot(s).models.map((x:any)=>[x.id,x.state])).toEqual([['a','active'],['c','poc-only'],['b','provider-only'],['d','registered-inactive']]);});
 it('does not invent PoC state when params are unavailable',()=>{const s:any=emptySnapshot();s.sources=[observed('models')];s.models=[model('x')];expect(buildProtocolSnapshot(s).models[0]).toMatchObject({pocActive:null,state:'unknown'});expect(buildProtocolSnapshot(s).pocModelCoverage).toBe('unavailable');});
 it('accepts a retained snapshot that predates version metadata',()=>{const s:any=emptySnapshot();delete s.versions;expect(buildProtocolSnapshot(s).versions).toEqual({});});
});
