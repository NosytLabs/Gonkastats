import {it} from 'vitest';
import assert from 'node:assert/strict';
import {readModelFilters} from '../src/core/insights';

const comparisonCatalog = [{slug: '61'}, {slug: '62'}, {slug: '63'}, {slug: '64'}];
it('unknown catalog IDs cannot occupy all comparison slots', () => {
  assert.deepEqual(readModelFilters(new URLSearchParams('compare=ff&compare=ee&compare=dd'), comparisonCatalog).compare, []);
});
it('catalog filtering happens before the three-model limit', () => {
  assert.deepEqual(readModelFilters(new URLSearchParams('compare=ff&compare=ee&compare=dd&compare=61&compare=62&compare=63&compare=64'), comparisonCatalog).compare, ['61', '62', '63']);
});
it('valid comparison selections keep order and remain deduplicated', () => {
  assert.deepEqual(readModelFilters(new URLSearchParams('compare=62&compare=ff&compare=62&compare=61'), comparisonCatalog).compare, ['62', '61']);
});
it('empty catalog has no actionable comparison selections', () => {
  assert.deepEqual(readModelFilters(new URLSearchParams('compare=61'), []).compare, []);
});
