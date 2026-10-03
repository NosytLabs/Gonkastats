import {beforeEach,expect,it,vi} from 'vitest';
import {collect} from '../src/core/collect';
import {emptySnapshot,unavailable} from '../src/core/sources';
import {readJSON} from '../src/core/http';
vi.mock('../src/core/http',()=>({readJSON:vi.fn(),configuredOrigin:()=> 'https://rpc.gonka.gg'}));
const read=vi.mocked(readJSON);
const epoch=(id=7)=>({block_height:105,latest_epoch:{index:id},phase:'Inference',epoch_stages:{poc_start:100,poc_validation_start:101,poc_validation_end:102,set_new_validators:103,next_poc_start:110}});
const membership=(node='a',epochId=7)=>({active_participants:{epoch_id:String(epochId),participants:[{index:'member',weight:'10',models:['test/model'],ml_nodes:[{ml_nodes:[{node_id:node}]}]}]},excluded_participants:[],validators:[{}]});
function prior(){const s=emptySnapshot();s.epoch={id:7,height:105,phase:'Inference',start:100,end:110,remaining:5,progress:50,boundaries:[]};s.participants=[{address:'member',weight:'10',models:['test/model'],nodeIds:['a'],nodes:1,excluded:false,reason:null}];s.validators=1;s.hardware=[{model:'Old GPU',count:8}];s.sources=['epoch','participants','hardware'].map(id=>({...unavailable(id),status:'recent' as const,error:null,ttl:3600}));return s;}
beforeEach(()=>{read.mockReset();});
it('does not carry a validator count into a new epoch with missing membership',async()=>{
 read.mockImplementation(async url=>{if(url.endsWith('/epochs/latest'))return epoch(8);throw new Error('Upstream HTTP 404');});
 const s=await collect(prior());expect(s.validators).toBeNull();expect(s.participants).toEqual([]);expect(s.hardware).toEqual([]);
});
it('invalidates the hardware join when node IDs change within the same epoch',async()=>{
 read.mockImplementation(async url=>{if(url.endsWith('/epochs/latest'))return epoch();if(url.endsWith('/7/participants'))return membership('b');throw new Error('Unavailable');});
 const s=await collect(prior());expect(s.participants[0].nodeIds).toEqual(['b']);expect(s.hardware).toEqual([]);expect(s.sources.find(x=>x.id==='hardware')?.status).toBe('unavailable');expect(read.mock.calls.some(([u])=>u.endsWith('/hardware_nodes_all'))).toBe(true);
});
it('updates the matched hardware immediately when the node footprint changes',async()=>{
 read.mockImplementation(async url=>{if(url.endsWith('/epochs/latest'))return epoch();if(url.endsWith('/7/participants'))return membership('b');if(url.endsWith('/hardware_nodes_all'))return {nodes:[{participant:'member',hardware_nodes:[{local_id:'b',hardware:[{type:'New GPU',count:'4'}]}]}]};throw new Error('Unavailable');});
 const s=await collect(prior());expect(s.hardware).toEqual([{model:'New GPU',count:4}]);
});
it('does not relabel a hardware refresh based on stale membership as current',async()=>{
 const old=prior();const source=old.sources.find(x=>x.id==='hardware')!;source.fetchedAt='2000-01-01T00:00:00Z';
 read.mockImplementation(async url=>{if(url.endsWith('/epochs/latest'))return epoch();if(url.endsWith('/hardware_nodes_all'))return {nodes:[]};throw new Error('Membership unavailable');});
 const s=await collect(old);expect(read.mock.calls.some(([u])=>u.endsWith('/hardware_nodes_all'))).toBe(false);expect(s.hardware).toEqual(old.hardware);const hardware=s.sources.find(x=>x.id==='hardware')!;expect(hardware.status).toBe('stale');expect(hardware.fetchedAt).toBe(source.fetchedAt);expect(hardware.error).toMatch(/membership/i);
});
it('reports the missing hardware dependency instead of a generic no-observation error',async()=>{
 read.mockImplementation(async url=>{if(url.endsWith('/epochs/latest'))return epoch();throw new Error('Upstream HTTP 404');});
 const s=await collect();expect(s.sources.find(x=>x.id==='hardware')?.error).toMatch(/membership/i);
});
it('clears old matched hardware after an observed empty membership list',async()=>{
 read.mockImplementation(async url=>{if(url.endsWith('/epochs/latest'))return epoch();if(url.endsWith('/7/participants'))return {active_participants:{epoch_id:'7',participants:[]},excluded_participants:[]};throw new Error('Unavailable');});
 const s=await collect(prior());expect(s.participants).toEqual([]);expect(s.hardware).toEqual([]);expect(s.validators).toBeNull();
});
it('keeps the hourly hardware cache when member node IDs have not changed',async()=>{
 read.mockImplementation(async url=>{if(url.endsWith('/epochs/latest'))return epoch();if(url.endsWith('/7/participants'))return membership();throw new Error('Unavailable');});
 const old=prior(),s=await collect(old);expect(s.hardware).toEqual(old.hardware);expect(read.mock.calls.some(([u])=>u.endsWith('/hardware_nodes_all'))).toBe(false);
});
