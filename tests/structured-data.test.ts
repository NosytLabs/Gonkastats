import {it,expect} from 'vitest';
import * as seo from '../src/core/seo';
it('serializes embedded text without executable script terminators',()=>{
 const input={name:'</script><script>alert(1)</script>',description:'A & B > C'};
 expect(typeof seo.serializeJsonLd).toBe('function');
 const encoded=seo.serializeJsonLd(input);
 expect(encoded).not.toContain('<');expect(encoded).not.toContain('&');expect(JSON.parse(encoded)).toEqual(input);
});
it('identifies the independent publisher without invented product claims',()=>{
 expect(typeof seo.siteStructuredData).toBe('function');const graph=seo.siteStructuredData();
 expect(graph['@graph'].find(n=>n['@type']==='WebSite')?.name).toBe('GonkaStats');
 expect(graph['@graph'].find(n=>n['@type']==='Organization')?.name).toBe('Nosyt Labs');
 expect(JSON.stringify(graph)).not.toMatch(/AggregateRating|SearchAction|InvestmentFund|Dataset/);
});
