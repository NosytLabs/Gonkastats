import {readFileSync} from 'node:fs';
import {describe,it,expect} from 'vitest';

const shell=readFileSync('src/components/shell.tsx','utf8');
const router=readFileSync('src/app/[[...route]]/page.tsx','utf8');
const protocol=readFileSync('src/features/protocol.tsx','utf8');
const providers=readFileSync('src/features/providers.tsx','utf8');

describe('navigation and UI release surface',()=>{
  it('preserves user-entered spaces while typing in global search',()=>{
    expect(shell).toContain('setQ(e.target.value)');
    expect(shell).not.toContain('setQ(e.target.value.trim())');
  });

  it('uses the same active state for styling and aria-current on nested routes',()=>{
    expect(shell).toContain("aria-current={active?'page':undefined}");
  });

  it('does not keep stale NEW badges or a hard-coded v0.1 footer label',()=>{
    expect(shell).not.toContain('nav-new');
    expect(shell).not.toContain('>v0.1<');
  });

  it('redirects legacy duplicate routes to canonical destinations',()=>{
    expect(router).toContain("redirect('/providers");
    expect(router).toContain("redirect('/providers/proxy')");
    expect(router).toContain("redirect('/pulse')");
    expect(router).toContain("redirect('/sources')");
  });

  it('keeps static protocol and provider views out of the client bundle',()=>{
    expect(protocol.startsWith("'use client'" )).toBe(false);
    expect(providers.startsWith("'use client'" )).toBe(false);
  });
});
