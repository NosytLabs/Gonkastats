import {existsSync,readFileSync} from 'node:fs';
import {it,expect} from 'vitest';

it('keeps the public application read-only with no chat proxy or BYOK chat surface',()=>{
  expect(existsSync('src/app/api/chat/route.ts')).toBe(false);
  expect(existsSync('src/features/chat.tsx')).toBe(false);
  const page=readFileSync('src/app/[[...route]]/page.tsx','utf8');
  const shell=readFileSync('src/components/shell.tsx','utf8');
  expect(page).not.toContain("from '@/features/chat'");
  expect(page).not.toContain("case 'chat'");
  expect(shell).not.toContain("['/chat','AI Chat'");
  const css=readFileSync('src/app/observatory.css','utf8');
  expect(css).not.toContain('.chat-log');
  expect(css).not.toContain('.key-input');
});

it('runs the v2 browser audit as part of the standard e2e suite',()=>{
  const pkg=JSON.parse(readFileSync('package.json','utf8'));
  expect(pkg.scripts['test:e2e']).toContain('node scripts/v2-qa.mjs');
});

it('does not keep completed one-shot maintenance workflows in the release tree',()=>{
  expect(existsSync('.github/workflows/prune-stale-artifacts-once-20260923.yml')).toBe(false);
});
