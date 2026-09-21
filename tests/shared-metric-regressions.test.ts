import {it,expect} from 'vitest';
import {emptySnapshot,unavailable} from '../src/core/sources';
import {metricData} from '../src/core/api-data';
import {overviewFacts} from '../src/core/insights';
import {historyPoint} from '../src/core/history-point';
it('API and dashboard share exact declared-weight totals, even beyond 50 digits',()=>{const s=emptySnapshot();s.sources=[{...unavailable('participants'),status:'recent',error:null}];s.participants=[{address:'fixture',weight:'12345678901234567890123456789012345678901234567890123456789',models:[],nodes:null,nodeIds:[],excluded:false,reason:null}];const api=metricData(s).find(m=>m.id==='declared_weight');expect(api?.value).toBe(s.participants[0].weight);expect(api?.value).toBe(overviewFacts(s).weight);});
it('an unproven rate is not returned as an observed price',()=>{const s=emptySnapshot();s.fx='0.1';expect(metricData(s).find(m=>m.id==='gnk_conversion_reference')?.value).toBeNull();});
it('history freshness also validates retrieval timestamps',()=>{const s=emptySnapshot();s.sources=[{...unavailable('participants'),status:'recent',error:null,sourceTime:s.generatedAt,fetchedAt:'invalid'}];expect(historyPoint(s).weight).toBeNull();});
