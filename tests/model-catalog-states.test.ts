import {expect,it,vi} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ModelExplorer} from '../src/features/model-explorer';
import {ModelsList} from '../src/features/shared';
import {emptySnapshot,unavailable} from '../src/core/sources';
vi.mock('next/navigation',()=>({useSearchParams:()=>new URLSearchParams('q=missing'),useRouter:()=>({refresh:vi.fn()})}));
it('the explorer distinguishes an unavailable catalog from unmatched filters',()=>{
 const s=emptySnapshot(),html=renderToStaticMarkup(createElement(ModelExplorer,{s}));
 expect(html).toContain('Model catalog unavailable');expect(html).not.toContain('No models match this view');expect(html).toContain('Inspect source status');
});
it('an observed empty model catalog retains its meaning while a search is active',()=>{
 const s=emptySnapshot();s.sources=[{...unavailable('models'),status:'recent',error:null}];
 const html=renderToStaticMarkup(createElement(ModelExplorer,{s}));expect(html).toContain('No models in this observation');expect(html).not.toContain('No models match this view');
});
it('the overview model list does not call an observed empty catalog unavailable',()=>{
 const s=emptySnapshot();s.sources=[{...unavailable('models'),status:'recent',error:null}];
 const html=renderToStaticMarkup(createElement(ModelsList,{s}));expect(html).toContain('No models in this observation');expect(html).not.toContain('Model catalog unavailable');
});
it('the explorer disables empty filtered exports',()=>{
 const html=renderToStaticMarkup(createElement(ModelExplorer,{s:emptySnapshot()}));expect(html).toMatch(/<button[^>]*disabled[^>]*>[\s\S]*?Export filtered/);
});
