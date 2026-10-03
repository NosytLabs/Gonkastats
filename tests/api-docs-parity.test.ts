import {expect,it,vi} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ApiReference} from '../src/features/api-reference';
import {emptySnapshot} from '../src/core/sources';
import {READ_FAILURE_STATUS} from '../src/core/read-errors';
vi.mock('next/navigation',()=>({useRouter:()=>({refresh:vi.fn()})}));
it('the rendered developer guide names the shared machine-readable error codes',()=>{
 const html=renderToStaticMarkup(createElement(ApiReference,{s:emptySnapshot()}));
 expect(html).toContain('data.errorCode');for(const code of Object.keys(READ_FAILURE_STATUS))expect(html).toContain(code);
 expect(html).toContain('not a stable machine key');
});
