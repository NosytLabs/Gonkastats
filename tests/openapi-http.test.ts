import {expect,it} from 'vitest';
import {openapi} from '../src/core/openapi';
it('documents the actual preflight contract without promising credentials',()=>{
 const spec=JSON.parse(JSON.stringify(openapi()));
 for(const p of Object.values(spec.paths) as any[]){expect(p.options.responses['204'].headers['Access-Control-Allow-Methods'].schema.const).toBe('GET, HEAD, OPTIONS');expect(p.options.responses['204'].headers['Access-Control-Allow-Credentials']).toBeUndefined();}
});
it('documents ETag and 304 only on conditional-read resources',()=>{
 const spec=JSON.parse(JSON.stringify(openapi()));
 expect(spec.paths['/metrics'].get.responses['200'].headers.ETag).toBeDefined();expect(spec.paths['/metrics'].get.responses['304']).toBeDefined();expect(spec.paths['/openapi'].get.responses['304']).toBeUndefined();
});
it('describes structured error envelopes and retry guidance',()=>{
 const spec=JSON.parse(JSON.stringify(openapi()));
 expect(spec.components.schemas.Observation.properties.error.type).toBe('string');expect(spec.components.schemas.Error.required).toContain('error');
 expect(spec.paths['/epoch-diff'].get.responses['503'].content['application/json'].schema.$ref).toBe('#/components/schemas/Error');expect(spec.paths['/lookup'].get.responses['429'].headers['Retry-After']).toBeDefined();
});
