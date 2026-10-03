import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it,vi} from 'vitest';
import {Signals,Documentation} from '../src/features/platform';
import {CostLabPage} from '../src/features/cost-lab';
import {emptySnapshot,unavailable} from '../src/core/sources';
vi.mock('next/navigation',()=>({useRouter:()=>({refresh:vi.fn()})}));
const html=(s:ReturnType<typeof emptySnapshot>)=>renderToStaticMarkup(createElement(Signals,{s}));
it('Signal Desk preserves observed zero members and an observed empty discovery catalog',()=>{
 const s=emptySnapshot();s.sources=['participants','catalog'].map(id=>({...unavailable(id),status:'recent',error:null}));
 const rendered=html(s);expect(rendered).toContain('contains 0 declared members');expect(rendered).toContain('0 endpoint definitions');expect(rendered).not.toContain('contains unknown');
});
it('Signal Desk does not use retained rows as observations when their sources are unavailable',()=>{
 const s=emptySnapshot();s.sources=['participants','params','catalog'].map(id=>unavailable(id));s.participants=[{address:'old',weight:'123',models:[],nodes:0,nodeIds:[],excluded:true,reason:null}];s.protocol['devshard_escrow_params.token_price']='987654';
 const rendered=html(s);expect(rendered).toContain('Membership data unavailable');expect(rendered).not.toContain('contains 1 declared');expect(rendered).not.toContain('987654');expect(rendered).toContain('Discovery catalog unavailable');
});
it('Cost Lab never computes monetary totals from source fields marked unavailable',()=>{
 const s=emptySnapshot();s.sources=['params','pricing','models'].map(id=>unavailable(id));s.protocol['devshard_escrow_params.token_price']='987654';s.fx='2';
 const rendered=renderToStaticMarkup(createElement(CostLabPage,{s}));expect(rendered).toMatch(/data-testid="cost-single">—/);expect(rendered).toContain('Model catalog unavailable');
});
it('the changelog describes the actually merged API and membership releases',()=>{
 const rendered=renderToStaticMarkup(createElement(Documentation,{s:emptySnapshot(),section:'changelog'}));expect(rendered).toContain('/pull/17');expect(rendered).toContain('/pull/16');expect(rendered).not.toContain('v0.1 · Initial implementation');
});
it('Cost Lab programmatic examples include the actually selected model',()=>{
 const s=emptySnapshot();s.sources=['models','params','pricing'].map(id=>({...unavailable(id),status:'recent',error:null}));
 s.models=[{id:'test/model',name:'Test model',slug:'746573742f6d6f64656c',provider:'openbroker',context:null,output:null,vram:null,tools:null,reasoning:null,price:'0.01',ngonka:null,hfRepo:null,hfCommit:null}];
 const rendered=renderToStaticMarkup(createElement(CostLabPage,{s}));expect(rendered).toContain('model=test%2Fmodel');expect(rendered).toContain('Copy scenario API');
});

it('small nonzero GNK costs remain visible instead of rounding to zero',()=>{
 const s=emptySnapshot();s.sources=['params'].map(id=>({...unavailable(id),status:'recent',error:null}));s.protocol['devshard_escrow_params.token_price']='10';
 const rendered=renderToStaticMarkup(createElement(CostLabPage,{s}));expect(rendered).toContain('data-testid="cost-single">0.0000125 ');expect(rendered).toContain('data-testid="cost-retry">0.00001875 ');
});
