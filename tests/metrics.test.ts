import {describe,it,expect} from 'vitest';
import {ngnk,ratio,exponentDecimal,midpoint,parseExact,csvCell,slugFor,idFromSlug,bech32Address,sourceAge,elapsedPerBlock} from '../src/core/metrics';
describe('exact accounting and safe output',()=>{
it('preserves native amounts',()=>expect(ngnk('442914217233016211')).toBe('442914217.233016211'));
it('preserves raw uint64',()=>expect((parseExact('{"amount":18446744073709551615}') as {amount:string}).amount).toBe('18446744073709551615'));
it('does not treat missing as zero',()=>expect(ratio('10','0')).toBeNull());
it('divides exactly',()=>expect(ratio('1','4')).toBe('0.25'));
it('parses coefficient/exponent decimals',()=>expect(exponentDecimal({value:'-475',exponent:-6})).toBe('-0.000475'));
it('bounds exponents',()=>expect(()=>exponentDecimal({value:'1',exponent:999})).toThrow());
it('rejects crossed markets',()=>expect(midpoint('2','1')).toBeNull());
it('calculates midpoint',()=>expect(midpoint('0.14','0.16')).toBe('0.15'));
it('defuses formula injection',()=>expect(csvCell('=SUM(A1)')).toBe('"\'=SUM(A1)"'));
it('escapes CSV quotes',()=>expect(csvCell('a"b')).toBe('"a""b"'));
it('roundtrips model ids',()=>{const id='deepseek-ai/DeepSeek-V4-Flash-0731';expect(slugFor(id)).not.toContain('/');expect(idFromSlug(slugFor(id))).toBe(id);});
it('rejects invalid model slugs',()=>expect(()=>idFromSlug('../admin')).toThrow());
it('validates address checksum',()=>{expect(bech32Address('gonka10eg5wakkmc0tee3llwj2qwa67knzk48cht38c5')).toBe(true);expect(bech32Address('gonka10eg5wakkmc0tee3llwj2qwa67knzk48cht38c6')).toBe(false);});
it('uses source time, not recent fetch time',()=>expect(sourceAge('2026-01-01T00:00:00Z','2026-02-01T00:00:00Z',Date.parse('2026-02-01T00:00:00Z'))).toBeGreaterThan(86400000));
it('uses block heights when indexed records omit empty blocks',()=>expect(elapsedPerBlock([{height:105,time:'2026-01-01T00:00:25Z'},{height:100,time:'2026-01-01T00:00:00Z'}])).toBe(5));
});
