import {it,expect} from 'vitest';
import {historyPoint} from '../src/core/history-point';
import {emptySnapshot,unavailable} from '../src/core/sources';
function example(){const s=emptySnapshot();s.generatedAt='2026-09-21T04:00:00Z';s.sources=[{...unavailable('participants'),status:'recent' as const,error:null,fetchedAt:s.generatedAt}];return s;}
it('a successfully observed empty membership is zero, not unknown',()=>{const p=historyPoint(example());expect(p.participants).toBe(0);expect(p.weight).toBe('0');});
it('never relabels stale retained member values as a new history point',()=>{const s=example();s.sources[0].status='stale';expect(historyPoint(s).weight).toBeNull();});
it('an old source timestamp remains a gap after a recent fetch',()=>{const s=example();s.sources[0].sourceTime='2026-01-01T00:00:00Z';expect(historyPoint(s).participants).toBeNull();});
it('invalid source timestamps cannot appear fresh',()=>{const s=example();s.sources[0].sourceTime='invalid';expect(historyPoint(s).weight).toBeNull();});
it('preserves actual observation time rather than rounded storage slot',()=>expect(historyPoint(example()).at).toBe('2026-09-21T04:00:00Z'));
