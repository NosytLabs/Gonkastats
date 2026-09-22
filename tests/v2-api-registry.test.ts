import {it,expect} from 'vitest';
import {apiDefinitions} from '../src/core/api-definitions';
import {openapi} from '../src/core/openapi';

it('registers normalized protocol provider and source-health reads',()=>{
  const ids=apiDefinitions.map(x=>x.id);
  expect(ids).toEqual(expect.arrayContaining(['protocol','providers','source-health']));
});
it('OpenAPI stays generated from the implementation registry',()=>{
  const spec=openapi();
  for(const id of ['protocol','providers','source-health'])expect(spec.paths['/'+id]).toBeTruthy();
});
