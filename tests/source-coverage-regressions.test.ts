import {expect,it} from 'vitest';
import {sourceDependencies,dependenciesForRoute,sourceDependents} from '../src/core/source-dependencies';
it.each([
 ['hardware',['/','/hardware','/network']],['participants',['/participants','/watchlist','/network']],
 ['pricing',['/cost-lab','/markets']],['capabilities',['/workload']],['community',['/','/treasury']],
 ['stats',['/','/inference']],['participantStats',['/participants']]
])('source health links to actual dependent pages for %s',(source,routes)=>{
 for(const path of routes)expect(sourceDependents(source)).toContain(path);
});
it('nested and legacy provider routes resolve to the canonical dependency owner',()=>{
 for(const path of ['/providers/openbroker','/brokers/openbroker'])expect(dependenciesForRoute(path).flatMap(x=>x.sourceIds)).toContain('models');
 expect(dependenciesForRoute('/models-not-a-route')).toEqual([]);
});
it('dependency owner paths are unique and inference is not substituted for activity',()=>{
 expect(new Set(sourceDependencies.map(x=>x.route)).size).toBe(sourceDependencies.length);expect(sourceDependents('stats')).not.toContain('/activity');
});
