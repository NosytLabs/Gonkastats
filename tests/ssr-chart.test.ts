import {it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ConcentrationChart} from '../src/components/insight-charts';
import {emptySnapshot,unavailable} from '../src/core/sources';
it('the actual concentration component renders its SVG accessible title on the server',()=>{
 const s=emptySnapshot();s.sources=[{...unavailable('participants'),status:'recent',error:null}];s.participants=[{address:'fixture',weight:'1',models:[],nodes:1,nodeIds:['fixture-node'],excluded:false,reason:null}];
 const html=renderToStaticMarkup(createElement(ConcentrationChart,{s}));
 expect(html).toMatch(/<title[^>]*>Cumulative share of declared epoch weight by member rank\. The top 1 account for 100\.00 percent\.<\/title>/);
 expect(html).not.toMatch(/<title[^>]*><\/title>/);
});
