import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it,vi} from 'vitest';
import {Agents} from '../src/features/tools';
import {emptySnapshot,unavailable} from '../src/core/sources';
const selection=vi.hoisted(()=>({mode:'GET'}));
vi.mock('react',async()=>{const actual=await vi.importActual<typeof import('react')>('react');return {...actual,useState:(initial:unknown)=>[initial==='GET'?selection.mode:initial,vi.fn()]};});
vi.mock('next/navigation',()=>({useRouter:()=>({refresh:vi.fn()})}));
it.each(['GET','WRITE','ALL'])('Agent Workbench %s filter shows exactly the matching definitions',mode=>{
 selection.mode=mode;const s=emptySnapshot();s.sources=[{...unavailable('catalog'),status:'recent',error:null}];s.endpointDeclaredTotal=2;
 s.endpoints=[{method:'GET',path:'/chain-rpc/status',readOnly:true},{method:'POST',path:'/v1/write-test',readOnly:false}].map(e=>({...e,namespace:'v1',description:'Test definition',group:'Test',params:'',cache:''}));
 const rendered=renderToStaticMarkup(createElement(Agents,{s}));
 if(mode!=='WRITE')expect(rendered).toContain('/chain-rpc/status');else expect(rendered).not.toContain('/chain-rpc/status');
 if(mode!=='GET')expect(rendered).toContain('/v1/write-test');else expect(rendered).not.toContain('/v1/write-test');
});
