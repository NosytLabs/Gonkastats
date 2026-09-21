import {it} from 'vitest';
import assert from 'node:assert/strict';
import type {Source,Model,Participant} from '../src/core/types';
import {emptySnapshot,ageSnapshot} from '../src/core/sources';
import {concentration,overviewFacts,percentage,compareAmounts,isSourceFresh,readModelFilters,filterModels,modelFootprint,compareCells} from '../src/core/insights';
const source:Source={id:'participants',name:'Test source',url:'https://example.test',scope:'chain',coverage:'test fixture',status:'recent',error:null,ttl:300,fetchedAt:'2026-09-21T06:00:00Z',sourceTime:null};
const member=(address:string,weight:string):Participant=>({address,weight,models:[],nodes:null,nodeIds:[],excluded:false,reason:null});
const s=emptySnapshot();
const model=(name:string,price:string|null,tools:boolean|null,context:number|null):Model=>({name,id:name,slug:'61',price,tools,context,reasoning:null,provider:'test',output:null,vram:null,ngonka:null,hfRepo:null,hfCommit:null});
const tests:[string,()=>void][]=[
 ['exact uint64 ordering',()=>assert.equal(compareAmounts('9007199254740992','9007199254740993'),-1)],
 ['tiny decimal prices order correctly',()=>assert.equal(compareAmounts('0.000000000000000002','0.000000000000000001'),1)],
 ['equivalent decimal strings',()=>assert.equal(compareAmounts('001.50','1.5'),0)],
 ['reject bad numeric inputs',()=>assert.throws(()=>compareAmounts('NaN','1'))],
 ['zero denominator is unknown',()=>assert.equal(percentage('0','0'),null)],
 ['percentages round at two places',()=>assert.equal(percentage('1','6'),'16.67')],
 ['concentration sorted without mutation',()=>{const a=[member('a','9007199254740992'),member('b','9007199254740993')];assert.equal(concentration(a)[0].address,'b');assert.equal(a[0].address,'a')}],
 ['cumulative shares reach 100 exactly',()=>assert.equal(concentration([member('a','1'),member('b','2')]).at(-1)!.cumulativeShare,'100.00')],
 ['missing membership is unknown not zero',()=>assert.equal(overviewFacts(s).members,null)],
 ['observed empty membership is zero',()=>assert.equal(overviewFacts({...s,sources:[source]}).members,0)],
 ['missing ML nodes remain unknown',()=>assert.equal(overviewFacts({...s,sources:[source],participants:[member('a','1')]}).nodes,null)],
 ['invalid source time never fresh',()=>assert.equal(isSourceFresh({...source,sourceTime:'invalid'},Date.parse(source.fetchedAt)),false)],
 ['future source time never fresh',()=>assert.equal(isSourceFresh({...source,sourceTime:'2027-01-01'},Date.parse(source.fetchedAt)),false)],
 ['old fetched value never fresh',()=>assert.equal(isSourceFresh(source,Date.parse(source.fetchedAt)+301000),false)],
 ['valid recent source stays fresh',()=>assert.equal(isSourceFresh(source,Date.parse(source.fetchedAt)),true)],
 ['scope stays explicit in footprint',()=>assert.equal(modelFootprint({...s,models:[model('test',null,null,null)]})[0].count,null)],
 ['missing capability excluded from tools filter',()=>assert.equal(filterModels([model('unknown',null,null,null),model('yes','0.1',true,128000)],{q:'',capability:'tools',sort:'name',view:'cards',compare:[]}).length,1)],
 ['unknown prices sorted last',()=>assert.equal(filterModels([model('unknown',null,null,null),model('zero','0',null,null)],{q:'',capability:'all',sort:'price',view:'cards',compare:[]})[0].name,'zero')],
 ['filters reject unsupported modes',()=>assert.equal(readModelFilters(new URLSearchParams('capability=fake&sort=random&view=map')).capability,'all')],
 ['comparison deduplicates and bounds',()=>assert.deepEqual(readModelFilters(new URLSearchParams('compare=61&compare=61&compare=62&compare=63&compare=64&compare=../../secret')).compare,['61','62','63'])]
];
for(const [name,run] of tests) it(name,run);
it('table sort does not round uint64 or tiny prices',()=>{assert.equal(compareCells('9007199254740992','9007199254740993'),-1);assert.equal(compareCells('0.001','0.01'),-1);});
it('unknown values sort last in either direction',()=>{assert.equal(compareCells(null,'1'),1);assert.equal(compareCells(null,'1',true),1);});
it('negative deltas sort correctly',()=>assert.equal(compareCells('-10','-2'),-1));
it('invalid source time becomes stale in displayed observations',()=>{const v=emptySnapshot();v.sources=[{...source,sourceTime:'invalid'}];assert.equal(ageSnapshot(v).sources[0].status,'stale');});
