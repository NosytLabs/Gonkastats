import {expect,it,vi} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {emptySnapshot,unavailable} from '../src/core/sources';
import {ParticipantsTable} from '../src/features/shared';
import {ParticipantsView} from '../src/features/network';
import {DataTable} from '../src/components/ui';
vi.mock('next/navigation',()=>({useRouter:()=>({refresh:vi.fn()})}));
it('unavailable membership is not presented as an unmatched table filter',()=>{
 const s=emptySnapshot();s.sources=[unavailable('participants','Upstream HTTP 404')];const html=renderToStaticMarkup(createElement(ParticipantsTable,{s}));
 expect(html).toContain('Membership data unavailable');expect(html).not.toContain('No records match this view.');expect(html).toContain('href="/sources"');
});
it('an unavailable member lookup does not claim the address is absent from the epoch',()=>{
 const s=emptySnapshot();s.sources=[unavailable('participants')];const html=renderToStaticMarkup(createElement(ParticipantsView,{s,address:'public-address'}));
 expect(html).toContain('Membership data unavailable');expect(html).not.toContain('This address is not in the current membership response.');
});
it('an observed empty membership list is distinguished from a failed source',()=>{
 const s=emptySnapshot();s.sources=[{...unavailable('participants'),status:'recent',error:null}];const html=renderToStaticMarkup(createElement(ParticipantsTable,{s}));
 expect(html).toContain('No members were returned for this epoch.');expect(html).not.toContain('Membership data unavailable');
});
it('empty shared tables do not offer an empty CSV download',()=>{
 const html=renderToStaticMarkup(createElement(DataTable,{rows:[],rowKey:()=>'',columns:[{key:'id',label:'ID',value:()=>''}]}));
 expect(html).toMatch(/<button[^>]*disabled[^>]*>[\s\S]*?Export CSV/);expect(html).toContain('No records were returned for this observation.');
});
