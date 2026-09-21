import assert from 'node:assert/strict';
import {activityData,reconcileModels,historyWithGaps} from '../src/core/audit';
import type {Block,Model,HistoryPoint} from '../src/core/types';
const blocks:Block[]=[{height:13,time:'2026-09-21T00:00:30Z',transactions:12,gas:'9007199254740993'},{height:10,time:'2026-09-21T00:00:00Z',transactions:3,gas:'2'}];
const old:Model={id:'lab/model',name:'Model',slug:'abcd',provider:'OpenBroker',context:128000,output:8000,vram:80,tools:true,reasoning:false,price:'0.004',ngonka:'10',hfRepo:'lab/model',hfCommit:'rev'};
const fresh:Model={...old,context:256000,output:null,tools:false,price:null,ngonka:null};
const point=(at:string):HistoryPoint=>({at,price:'1',weight:'1',participants:1});
export const auditCases:Record<string,()=>void>={
 'activity exact uint64 sum':()=>assert.equal(activityData(blocks).gas,'9007199254740995'),
 'activity logical ordering':()=>assert.deepEqual(activityData(blocks).rows.map(r=>r.height),[10,13]),
 'activity cumulative selected transactions':()=>assert.deepEqual(activityData(blocks).rows.map(r=>r.cumulativeTransactions),['3','15']),
 'activity missing heights are gaps, not empty blocks':()=>assert.equal(activityData(blocks).missingHeights,2),
 'activity observed span':()=>assert.equal(activityData(blocks).spanSeconds,30),
 'activity duplicate heights fail closed':()=>assert.throws(()=>activityData([...blocks,blocks[0]])),
 'activity invalid dates fail closed':()=>assert.throws(()=>activityData([{...blocks[0],time:'invalid'}])),
 'activity rejects negative gas':()=>assert.throws(()=>activityData([{...blocks[0],gas:'-1'}])),
 'activity empty source has no endpoints':()=>assert.equal(activityData([]).first,null),
 'model retains unavailable pricing but updates capabilities':()=>{const r=reconcileModels([old],[fresh],{pricing:false,capabilities:true})[0];assert.equal(r.price,old.price);assert.equal(r.context,256000);},
 'model retains unavailable capabilities but accepts missing new price':()=>{const r=reconcileModels([old],[fresh],{pricing:true,capabilities:false})[0];assert.equal(r.context,128000);assert.equal(r.price,null);},
 'model does not invent values for new ids':()=>assert.equal(reconcileModels([old],[{...fresh,id:'new/model',price:null}],{pricing:false,capabilities:true})[0].price,null),
 'model fresh explicit false is preserved':()=>assert.equal(reconcileModels([old],[fresh],{pricing:true,capabilities:true})[0].tools,false),
 'history inserts missing-collection gap':()=>{const rows=historyWithGaps([point('2026-09-21T00:00:00Z'),point('2026-09-21T01:00:00Z')]);assert.equal(rows.length,3);assert.equal(rows[1].price,null);},
 'history does not duplicate close observations':()=>assert.equal(historyWithGaps([point('2026-09-21T00:00:00Z'),point('2026-09-21T00:05:00Z')]).length,2),
 'history invalid dates rejected':()=>assert.throws(()=>historyWithGaps([point('bad')]))
};
