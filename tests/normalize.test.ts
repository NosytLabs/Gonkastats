import {it,expect} from 'vitest';
import {participantData,epochData,blockData,modelData,catalogData,hardwareData} from '../src/core/normalize';
it('missing ML nodes are unknown',()=>expect(participantData({active_participants:{participants:[{index:'x',weight:'1'}]}})[0].nodes).toBeNull());
it('deduplicates model node memberships',()=>expect(participantData({active_participants:{participants:[{index:'x',weight:'1',ml_nodes:[{ml_nodes:[{node_id:'a'}]},{ml_nodes:[{node_id:'a'}]}]}]}})[0].nodes).toBe(1));
it('preserves exclusions separately',()=>expect(participantData({active_participants:{participants:[{index:'x',weight:'1'}]},excluded_participants:[{address:'x',reason:'failed_confirmation_poc'}]})[0].excluded).toBe(true));
it('rejects incomplete epoch',()=>expect(()=>epochData({block_height:'2'})).toThrow());
it('rejects malformed block response',()=>expect(()=>blockData({})).toThrow());
it('missing model capabilities are not false',()=>expect(modelData({data:[{id:'test/model'}]},null,null)[0].tools).toBeNull());
it('preserves a small positive price',()=>expect(modelData({data:[{id:'test/model'}]},null,{models:[{model_id:'test/model',usd_per_million_tokens:'0.00148'}]})[0].price).toBe('0.00148'));
it('counts catalog records not advertised total',()=>expect(catalogData({total_endpoints:999,groups:[{label:'Test',endpoints:[{method:'GET',path:'/status',description:'Status'}]}]})).toHaveLength(1));
it('matches physical registrations only to epoch node IDs',()=>{const p=participantData({active_participants:{participants:[{index:'x',weight:'1',ml_nodes:[{ml_nodes:[{node_id:'current'}]}]}]}});expect(hardwareData({nodes:[{participant:'x',hardware_nodes:[{local_id:'current',hardware:[{type:'GPU',count:8}]},{local_id:'old',hardware:[{type:'GPU',count:80}]}]}]},p)).toEqual([{model:'GPU',count:8}]);});

it('rejects duplicate indexed heights instead of double-counting activity',()=>{
 const row={block_height:'10',block_time:'2026-09-21 00:00:00',num_txs:'1',total_gas_used:'100'};
 expect(()=>blockData({blocks:[row,row]})).toThrow('duplicate');
});
it('rejects invalid block timestamps before display',()=>expect(()=>blockData({blocks:[{block_height:'10',block_time:'bad',num_txs:'1',total_gas_used:'100'}]})).toThrow('timestamp'));
