import {beforeEach,it,expect,vi} from 'vitest';
vi.mock('../src/core/http',()=>({readJSON:vi.fn(),configuredOrigin:()=> 'https://rpc.gonka.gg'}));
import {readJSON} from '../src/core/http';
import {collect} from '../src/core/collect';
const mockRead=vi.mocked(readJSON);
beforeEach(()=>{mockRead.mockReset();});
it('a malformed pricing row is isolated instead of crashing the entire observation',async()=>{
 mockRead.mockImplementation(async url=>{if(url.endsWith('/v1/models'))return {data:[{id:'test/model'}]};if(url.endsWith('/api/pricing'))return {gonka_usd:'0.1',fx_updated_at:new Date().toISOString(),models:[{model_id:'test/model',usd_per_million_tokens:'NaN'}]};throw new Error('Fixture: unavailable');});
 const s=await collect();expect(s.models[0].id).toBe('test/model');expect(s.models[0].price).toBeNull();expect(s.sources.find(x=>x.id==='pricing')?.status).toBe('unavailable');
});
it('capability freshness preserves the upstream timestamp',async()=>{
 mockRead.mockImplementation(async url=>{if(url.endsWith('/v1/models'))return {data:[{id:'test/model'}]};if(url.endsWith('/api/models/capabilities'))return {models:[{id:'test/model',max_model_len:1000}],updated_at:'2000-01-01T00:00:00Z'};throw new Error('Fixture: unavailable');});
 const s=await collect();const source=s.sources.find(x=>x.id==='capabilities');expect(source?.sourceTime).toBe('2000-01-01T00:00:00Z');expect(source?.status).toBe('stale');
});
it('fresh pricing refreshes retained catalog values when the catalog read fails',async()=>{
 mockRead.mockImplementation(async url=>{if(url.endsWith('/v1/models'))return {data:[{id:'test/model'}]};if(url.endsWith('/api/pricing'))return {gonka_usd:'0.1',fx_updated_at:new Date().toISOString(),models:[{model_id:'test/model',usd_per_million_tokens:'0.01'}]};throw new Error('Fixture: unavailable');});
 const first=await collect();expect(first.models[0].price).toBe('0.01');
 mockRead.mockImplementation(async url=>{if(url.endsWith('/api/pricing'))return {gonka_usd:'0.2',fx_updated_at:new Date().toISOString(),models:[{model_id:'test/model',usd_per_million_tokens:'0.02'}]};throw new Error('Fixture: unavailable');});
 const next=await collect(first);expect(next.models[0].price).toBe('0.02');expect(next.sources.find(x=>x.id==='models')?.status).toBe('stale');expect(next.sources.find(x=>x.id==='pricing')?.status).toBe('recent');
});
