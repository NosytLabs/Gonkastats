import {it,expect} from 'vitest';
import {dependenciesForRoute,sourceDependents} from '../src/core/source-dependencies';
it('models keep provider and chain lifecycle sources distinct',()=>{const ids=dependenciesForRoute('/models').flatMap(x=>x.sourceIds);expect(ids).toEqual(expect.arrayContaining(['models','networkModels','params','governanceModels']));expect(ids).not.toContain('stats');});
it('inference statistics do not affect activity',()=>{expect(sourceDependents('stats')).toContain('/inference');expect(sourceDependents('stats')).not.toContain('/activity');});
it('software versions affect protocol but not activity',()=>{expect(sourceDependents('versions')).toContain('/protocol');expect(sourceDependents('versions')).not.toContain('/activity');});
