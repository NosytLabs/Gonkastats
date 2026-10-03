import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {expect,it} from 'vitest';
import {ComparisonBars} from '../src/components/insight-charts';
it('GNK bar labels preserve a small nonzero scenario cost and real zero distinctly',()=>{
 const html=renderToStaticMarkup(createElement(ComparisonBars,{label:'Cost',unit:'GNK',rows:[{label:'Small',value:'0.0000125'},{label:'Zero',value:'0'},{label:'Missing',value:null}]}));
 expect(html).toContain('>0.0000125 <small>GNK');expect(html).toContain('>0 <small>GNK');expect(html).toContain('>— <small>GNK');
});
