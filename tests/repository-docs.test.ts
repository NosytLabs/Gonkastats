import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {expect,it} from 'vitest';
it('published agent instructions match the repository rules',()=>expect(readFileSync('public/AGENTS.md','utf8')).toBe(readFileSync('AGENTS.md','utf8')));
it('README and maintained documentation have no broken relative file links',()=>{
 const files=['README.md',...readdirSync('docs').filter(name=>name.endsWith('.md')).map(name=>'docs/'+name)];
 for(const file of files)for(const match of readFileSync(file,'utf8').matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
  const target=match[1].split('#')[0];if(!target||/^[a-z]+:/i.test(target))continue;
  expect(existsSync(resolve(dirname(file),target)),file+' -> '+target).toBe(true);
 }
});
it('operational logs and interrupted snapshots are not staged as repository content',()=>{
 const rules=readFileSync('.gitignore','utf8').split('\n');expect(rules).toContain('*.log');expect(rules).toContain('data/*.tmp');
});
