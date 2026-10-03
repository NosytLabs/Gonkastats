import {it,expect} from 'vitest';
import {productionStart} from '../scripts/qa-next.mjs';

it('the installed Next.js package exposes the QA production-start contract before a build',()=>{
  expect(typeof productionStart()).toBe('function');
});
