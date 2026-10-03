import {expect,it,vi} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Markets} from '../src/features/ecosystem';
import {emptySnapshot} from '../src/core/sources';
vi.mock('next/navigation',()=>({useRouter:()=>({refresh:vi.fn()})}));
it.each(['12.34','-7.5'])('preserves provider percentage units for a %s percent 24h move',change=>{
 const s=emptySnapshot();s.dex={symbol:'WGNK',name:'Gonka',dex:'uniswap',pairAddress:null,priceUsd:'1',marketCap:null,fdv:null,liquidity:null,volume24h:null,priceChange24h:change,baseToken:null,quoteToken:null};
 const html=renderToStaticMarkup(createElement(Markets,{s,points:[]}));
 expect(html).toContain('24h '+Number(change).toFixed(2)+'%');
});
