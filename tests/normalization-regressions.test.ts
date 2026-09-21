import {it,expect} from 'vitest';
import {participantData,modelData} from '../src/core/normalize';
it('participant ordering preserves weights above Number.MAX_SAFE_INTEGER',()=>{const result=participantData({active_participants:{participants:[{index:'smaller',weight:'9007199254740992'},{index:'larger',weight:'9007199254740993'}]}});expect(result[0].address).toBe('larger');});
it('rejects malformed participant weights',()=>expect(()=>participantData({active_participants:{participants:[{index:'a',weight:'NaN'}]}})).toThrow());
it('invalid provider price is rejected rather than shown as free',()=>expect(()=>modelData({data:[{id:'test/model'}]},null,{models:[{model_id:'test/model',usd_per_million_tokens:'NaN'}]})).toThrow());
