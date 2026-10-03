import {afterEach,describe,it,expect} from 'vitest';
import {pageMetadata,sitemapUrls} from '../src/core/seo';
import {slugFor} from '../src/core/metrics';
import type {Model} from '../src/core/types';
const original=process.env.SITE_URL;
afterEach(()=>{if(original===undefined)delete process.env.SITE_URL;else process.env.SITE_URL=original;});
const model:Model={id:'example/Readable-Model',name:'Readable-Model',slug:slugFor('example/Readable-Model'),provider:'OpenBroker',context:32768,output:4096,vram:null,tools:null,reasoning:null,price:null,ngonka:null,hfRepo:null,hfCommit:null};
describe('SEO policy and model detail identity',()=>{
 it('uses a confirmed model name, not its transport slug',()=>{const m=pageMetadata('/models/'+model.slug,{model});expect(m.title).toBe('Readable-Model — model details');expect(m.description).toContain(model.id);expect(m.robots).toMatchObject({index:true});});
 it('keeps unconfirmed model URLs out of the index',()=>expect(pageMetadata('/models/'+model.slug).robots).toMatchObject({index:false}));
 it('does not authorize a model slug with another catalog record',()=>expect(pageMetadata('/models/61',{model}).robots).toMatchObject({index:false}));
 it('does not index raw account or block lookups as rich landing pages',()=>{for(const path of ['/blocks/123','/transactions/'+'a'.repeat(64),'/addresses/gonka1example','/epochs/123','/participants/gonka1example','/governance/99999'])expect(pageMetadata(path).robots).toMatchObject({index:false});});
 it('keeps unavailable intelligence out of the sitemap',()=>{expect(pageMetadata('/intelligence').robots).toMatchObject({index:false});expect(sitemapUrls().some(u=>u.endsWith('/intelligence'))).toBe(false);});
 it('strips query and fragment state from canonicals',()=>{process.env.SITE_URL='https://stats.example';expect(pageMetadata('/models?sort=price#compare').alternates?.canonical).toBe('https://stats.example/models');});
 it('rejects absolute and protocol-relative canonical inputs',()=>{expect(()=>pageMetadata('//other.example/models')).toThrow();expect(()=>pageMetadata('https://other.example/models')).toThrow();});
 it('includes only curated provider detail routes in the sitemap',()=>{const urls=sitemapUrls();for(const id of ['openbroker','proxy','feather'])expect(urls.some(u=>u.endsWith('/providers/'+id))).toBe(true);expect(urls.some(u=>u.includes('/brokers'))).toBe(false);});
});
