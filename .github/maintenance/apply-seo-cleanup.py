from pathlib import Path
import re,json
root=Path('.')
def write(path,text):
 p=root/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text.strip()+'\n')
def replace(path,old,new):
 p=root/path;s=p.read_text()
 if old not in s:raise RuntimeError(path+': expected source pattern missing')
 p.write_text(s.replace(old,new))

write('src/core/seo.ts',r'''
import type {Metadata} from 'next';
import {idFromSlug} from './metrics';
type PageInfo={title:string;description:string;index?:boolean};
/** Shared publication inventory. No generated prices, ratings or invented production domain. */
const pages:Record<string,PageInfo>={
 '/':{title:'Gonka network statistics and community tools',description:'Explore Gonka compute, epochs, model access and token economics with explicit source coverage and observation times.'},
 '/network':{title:'Gonka network and compute participation',description:'Compare declared epoch weights, membership, model support and reported hardware. Compute weight is not consensus voting power.'},
 '/protocol':{title:'Gonka protocol radar',description:'Inspect current chain parameters, model lifecycle, approved DevShard runtimes and source-reported software versions.'},
 '/models':{title:'Gonka model explorer and comparison',description:'Compare OpenBroker availability with separately attributed Proxy context limits, capabilities and advertised model prices.'},
 '/providers':{title:'Gonka providers and infrastructure',description:'Understand OpenBroker, Proxy and Feather: inference access, pricing metadata and self-hosted analytics are distinct layers.'},
 '/providers/openbroker':{title:'OpenBroker model access and accounting',description:'Understand public model discovery, private usage endpoints and estimated versus settled GNK accounting.'},
 '/providers/proxy':{title:'Proxy model capabilities and pricing',description:'Explore Proxy-reported model limits and advertised prices without treating metadata as independent benchmarks.'},
 '/providers/feather':{title:'Feather for Gonka analytics',description:'Learn where a self-hosted Feather RPC and analytics index fits and how its routes differ from managed indexing.'},
 '/participants':{title:'Gonka epoch participants',description:'Explore declared member weights, model support and separately reported exclusions, with public address profiles.'},
 '/epochs':{title:'Gonka epochs and protocol stages',description:'Inspect returned epoch boundaries and parameters. Wall-clock estimates use observed block timing.'},
 '/inference':{title:'Gonka inference data and coverage',description:'Inspect API-reported inference statistics and coverage limits. Blockchain transactions are not AI requests.'},
 '/activity':{title:'Gonka blockchain activity lab',description:'Analyze indexed blocks with exact transaction and gas totals, missing-height disclosure and downloadable records.'},
 '/hardware':{title:'Gonka reported hardware registrations',description:'Browse GPU registrations matched to declared epoch ML-node IDs, not independently audited physical inventory.'},
 '/learn':{title:'Gonka field guide',description:'Understand Gonka epochs, compute, model limits, provider billing and settlement through plain-language explanations.'},
 '/developers':{title:'GonkaStats API reference',description:'Use implemented read-only APIs, bounded queries, source-aware responses and the generated OpenAPI reference.'},
 '/agents':{title:'Gonka agent workbench',description:'Search discovered RPC definitions and try curated reads. Write and broadcast definitions are documentation-only.'},
 '/cost-lab':{title:'Gonka inference cost calculator',description:'Model provider quotes and protocol cost scenarios with exact arithmetic, explicit retry assumptions and excluded fees.'},
 '/workload':{title:'Gonka model context budget planner',description:'Compare an assumed prompt and output reserve with reported model limits. The planner does not tokenize or submit requests.'},
 '/epoch-diff':{title:'Compare Gonka epochs',description:'Compare declared epoch memberships and exact weight changes without equating weights with current consensus power.'},
 '/markets':{title:'GNK market observations and price provenance',description:'Separate provider conversion references, reported market observations and supply definitions with source attribution.'},
 '/tokenomics':{title:'Gonka tokenomics and issued GNK supply',description:'Inspect issued native supply, module counters and current economic parameters without assuming circulating supply.'},
 '/treasury':{title:'Gonka community pool observations',description:'Inspect the native distribution community-pool balance without mislabeling it as the entire ecosystem treasury.'},
 '/rewards':{title:'Gonka reward parameters',description:'Read current protocol reward parameters and source units without invented APY or hardware profitability forecasts.'},
 '/vesting':{title:'Gonka vesting information',description:'Inspect reported vesting parameters and public schedules without assuming epoch periods are calendar days.'},
 '/devshards':{title:'Gonka DevShard execution and settlement',description:'Understand gateway, escrow, execution and settlement layers and inspect current chain escrow parameters.'},
 '/bridge':{title:'Gonka cross-chain accounting guide',description:'Understand native and wrapped GNK accounting boundaries and find original bridge integration documentation.'},
 '/governance':{title:'Gonka governance proposals',description:'Explore returned proposals, tallies and states while separating proposal text from executed protocol changes.'},
 '/blocks':{title:'Gonka indexed block explorer',description:'Browse recently indexed blocks and inspect canonical block responses. The index may omit empty blocks.'},
 '/pulse':{title:'Gonka community reading room',description:'Find attributed Gonka updates, protocol documentation and media resources. No independent sentiment feed is claimed.'},
 '/ecosystem':{title:'Gonka community directory',description:'Discover Gonka protocol resources, gateways and analytics tools through attributed original project links.'},
 '/signals':{title:'Gonka source-aware signal desk',description:'Read deterministic observations about membership, source availability and pricing, not generated market predictions.'},
 '/sources':{title:'GonkaStats data sources and status',description:'Inspect source scope, timestamps, freshness, coverage and affected features. Fetch success is not an uptime score.'},
 '/methodology':{title:'GonkaStats methodology',description:'Review metric definitions, denominators, precision rules and coverage limits used by charts and API responses.'},
 '/about':{title:'About GonkaStats',description:'GonkaStats is an independent Gonka community observatory by Nosyt Labs, not an official Gonka service.'},
 '/privacy':{title:'GonkaStats privacy',description:'Read how the observatory uses public data and browser-local preferences without requesting wallet seeds or provider credentials.'},
 '/changelog':{title:'GonkaStats changelog',description:'Review implementation boundaries and product release notes for the independent GonkaStats observatory.'},
 '/watchlist':{title:'Your local Gonka watchlist',description:'Public participant addresses saved in your browser. No wallet connection is required.',index:false},
 '/account':{title:'Account integration — not configured',description:'Private provider analytics are not connected in this public observatory.',index:false},
 '/account/usage':{title:'Account usage — not configured',description:'Private OpenBroker account usage is not connected in GonkaStats.',index:false},
 '/intelligence':{title:'Intelligence — not configured',description:'Hosted inference and remote MCP execution are not enabled. Use the source-aware signal desk.',index:false},
 '/transactions':{title:'Gonka transaction lookup',description:'Look up a public transaction hash through the read-only explorer.',index:false},
};
export const publicPaths=Object.keys(pages).filter(path=>pages[path].index!==false);
/** Do not infer a production domain from request headers, localhost or a preview deployment. */
export function siteOrigin(value=process.env.SITE_URL):string|null {
 if(!value?.trim())return null;
 let u:URL;try{u=new URL(value);}catch{throw new Error('SITE_URL must be a public HTTPS origin');}
 if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash||!u.hostname.includes('.')||/^\d+(?:\.\d+){3}$/.test(u.hostname)||/\.(?:localhost|local|internal)$/.test(u.hostname))throw new Error('SITE_URL must be a public HTTPS origin without a path or credentials');
 return u.origin;
}
export function indexingEnabled():boolean {return Boolean(siteOrigin())&&process.env.DATA_MODE!=='snapshot'&&process.env.VERCEL_ENV!=='preview'&&process.env.SITE_NOINDEX!=='true';}
export function canonicalPath(input:string):string|null {
 const path=input.split(/[?#]/,1)[0].replace(/\/$/,'')||'/';
 if(!path.startsWith('/')||path.startsWith('//')||/[\\\x00-\x20]/.test(path)||path.split('/').some(x=>x==='.'||x==='..')||/%(?:2f|5c)/i.test(path))return null;
 const aliases:Record<string,string>={'/proxy':'/providers/proxy','/media':'/pulse','/status':'/sources','/token':'/tokenomics','/brokers':'/providers'};
 if(aliases[path])return aliases[path];
 if(path.startsWith('/brokers/'))return '/providers/'+path.slice(9);
 if(path.startsWith('/address/'))return '/addresses/'+path.slice(9);
 return path;
}
function definition(path:string):PageInfo|null {
 if(pages[path])return pages[path];
 const [,section,id,...rest]=path.split('/');if(!id||rest.length)return null;
 if(section==='models'){try{const name=idFromSlug(id).split('/').at(-1);return {title:name+' — Gonka model profile',description:'Inspect '+name+' availability, reported capabilities and price provenance. Field groups retain separate sources.'};}catch{return null;}}
 if(['epochs','governance','blocks'].includes(section)&&/^[1-9]\d{0,9}$/.test(id))return {title:({epochs:'Gonka epoch',governance:'Gonka proposal',blocks:'Gonka block'} as Record<string,string>)[section]+' '+id,description:pages['/'+section].description,index:section!=='blocks'};
 if(['participants','addresses','transactions'].includes(section))return {title:'Gonka '+section.replace(/s$/,'')+' '+id,description:'Read-only public chain lookup. Source coverage and lookup availability are shown on the page.',index:false};
 return null;
}
export function pageMetadata(input:string):Metadata {
 const path=canonicalPath(input),info=path?definition(path):null,origin=siteOrigin();const title=info?.title??'Page not found',description=info?.description??'The requested GonkaStats page is unavailable.';const url=origin&&path&&info?origin+path:undefined;
 return {title,description,robots:{index:indexingEnabled()&&Boolean(info)&&info?.index!==false,follow:true},...(url?{alternates:{canonical:url},openGraph:{title,description,url,siteName:'GonkaStats',type:'website'},twitter:{card:'summary',title,description}}:{})};
}
export function pageGraph(input:string):Record<string,unknown>|null {
 const path=canonicalPath(input),origin=siteOrigin(),info=path?definition(path):null;if(!path||!origin||!info||info.index===false)return null;
 const crumbs=[{name:'GonkaStats',url:origin+'/'}];if(path!=='/'){const parent='/'+path.split('/')[1];if(parent!==path&&pages[parent])crumbs.push({name:pages[parent].title,url:origin+parent});crumbs.push({name:info.title,url:origin+path});}
 return {'@context':'https://schema.org','@graph':[{'@type':'WebPage','@id':origin+path+'#page',url:origin+path,name:info.title,description:info.description,isPartOf:{'@id':origin+'/#website'}},{'@type':'BreadcrumbList',itemListElement:crumbs.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:item.url}))}]};
}
export function serializeJsonLd(value:unknown):string{return JSON.stringify(value).replace(/</g,'\\u003c');}
''')
write('src/components/page-schema.tsx','''import {pageGraph,serializeJsonLd} from '@/core/seo';
export function PageSchema({path}:{path:string}){const graph=pageGraph(path);return graph?<script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(graph)}}/>:null;}''')
write('src/app/robots.ts','''import type {MetadataRoute} from 'next';
import {siteOrigin,indexingEnabled} from '@/core/seo';
export const dynamic='force-dynamic';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/api/']},...(indexingEnabled()?{sitemap:siteOrigin()+'/sitemap.xml'}:{})};}''')
write('src/app/sitemap.ts','''import type {MetadataRoute} from 'next';
import {siteOrigin,indexingEnabled,publicPaths} from '@/core/seo';
export const dynamic='force-dynamic';
/** Landing pages only; observed model details remain discoverable from catalog links. */
export default function sitemap():MetadataRoute.Sitemap{if(!indexingEnabled())return [];const origin=siteOrigin()!;return publicPaths.map(path=>({url:origin+path}));}''')
replace('.env.example','SITE_URL=http://localhost:3000','# Required to publish indexable metadata. Leave blank for local work and previews.\nSITE_URL=\n# Disable indexing for an explicitly configured preview (snapshot mode already does).\nSITE_NOINDEX=false')
p=root/'src/app/layout.tsx';s=p.read_text().replace("import type {ReactNode} from 'react';","import type {ReactNode} from 'react';\nimport {siteOrigin,indexingEnabled,serializeJsonLd} from '@/core/seo';")
a=s.index('export const metadata:Metadata=');b=s.index('\nexport const viewport',a)
s=s[:a]+"export function generateMetadata():Metadata{const origin=siteOrigin();return {title:{default:'GonkaStats — The Gonka Observatory',template:'%s | GonkaStats'},description:'Independent Gonka community analytics by Nosyt Labs.',icons:{icon:'/brand/favicon.svg'},robots:{index:indexingEnabled(),follow:true},...(origin?{metadataBase:new URL(origin)}:{})};}\n"+s[b:]
s=s.replace('return <html lang=',"const origin=siteOrigin();const entity=origin?{'@context':'https://schema.org','@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'GonkaStats',description:'Independent Gonka community analytics by Nosyt Labs.',publisher:{'@type':'Organization',name:'Nosyt Labs'}}:null;return <html lang=")
s=s.replace('<head><script dangerouslySetInnerHTML','<head>{entity&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:serializeJsonLd(entity)}}/>}<script dangerouslySetInnerHTML');p.write_text(s)
for p in (root/'src/app').rglob('page.tsx'):
 route='/'+p.relative_to(root/'src/app').as_posix().removesuffix('/page.tsx')
 if '[' in route or route=='/token':continue
 s="import {pageMetadata} from '@/core/seo';\nimport {PageSchema} from '@/components/page-schema';\n"+p.read_text()
 s,n=re.subn(r'export const metadata\s*=\s*\{.*?\};',"export function generateMetadata(){return pageMetadata('"+route+"');}",s,flags=re.S)
 if n!=1:raise RuntimeError(str(p)+': no unique metadata declaration')
 a=s.find('return <')+len('return ');b=s.rfind(';')
 if a<len('return ') or b<a:raise RuntimeError(str(p)+': page return not found')
 s=s[:a]+'<><PageSchema path="'+route+'"/>'+s[a:b]+'</>'+s[b:];p.write_text(s)
p=root/'src/app/[[...route]]/page.tsx';s="import {pageMetadata} from '@/core/seo';\nimport {PageSchema} from '@/components/page-schema';\n"+p.read_text();s=s.replace('import {notFound,redirect}','import {notFound,permanentRedirect as redirect}')
a=s.index('export async function generateMetadata(');b=s.index('\nexport default',a);s=s[:a]+"export async function generateMetadata({params}:{params:Promise<{route?:string[]}>}){return pageMetadata('/'+((await params).route??[]).join('/'));}"+s[b:]
s=s.replace('const s=await getSnapshot();',"const s=await getSnapshot();if(section==='models'&&id&&s.sources.some(source=>source.id==='models'&&source.status!=='unavailable')&&!s.models.some(model=>model.slug===id))notFound();")
s=s.replace('switch(section){','const render=async()=>{switch(section){',1).rstrip();assert s.endswith('}}');s=s[:-2]+"}};return <><PageSchema path={'/'+routes.join('/')}/>{await render()}</>;}\n";p.write_text(s)
for file in ['src/app/token/page.tsx','src/app/address/[address]/page.tsx']:
 p=root/file;s=p.read_text().replace('{redirect}','{permanentRedirect as redirect}').replace('{redirect,notFound}','{permanentRedirect as redirect,notFound}');p.write_text(s)
replace('next.config.mjs','poweredByHeader:false,',"poweredByHeader:false,async redirects(){return [{source:'/brokers',destination:'/providers',permanent:true},{source:'/brokers/:provider(openbroker|proxy|feather)',destination:'/providers/:provider',permanent:true},{source:'/proxy',destination:'/providers/proxy',permanent:true},{source:'/media',destination:'/pulse',permanent:true},{source:'/status',destination:'/sources',permanent:true},{source:'/token',destination:'/tokenomics',permanent:true}];},")
replace('next.config.mjs',"return [{source:'/:path*'","return [{source:'/api/:path*',headers:[{key:'X-Robots-Tag',value:'noindex'}]},{source:'/:path*'")
p=root/'src/app/community.css';s=p.read_text().replace('.kpi-tile{overflow:visible!important}','').replace('.kpi-tile .source-note[open]>div{width:min(320px,80vw)!important;max-width:none!important}','').replace('.kpi-tile:nth-child(2n) .source-note[open]>div{left:auto;right:0}','');p.write_text(s)
replace('src/app/observatory.css','.kpi-tile .source-note[open]>div{width:100%;max-width:100%}','.kpi-tile .source-note[open]>div{width:100%;max-width:100%;overflow-wrap:anywhere}')
p=root/'src/app/observatory.css';p.write_text(p.read_text()+'\n/* In-flow provenance remains readable within its own card. */\n.kpi-tile>.source-note summary{min-height:36px}\n@media(max-width:620px){.kpi-tile>.source-note summary{min-height:44px}.icon-button{min-width:40px;min-height:40px}}\n')
replace('src/components/ui.tsx','<div className="table-scroll"><table><thead>','<div className="table-scroll" tabIndex={0} role="region" aria-label={exportName+\' table\'}><table><thead>')
write('scripts/qa-server.mjs',r'''
import {spawn,execFileSync} from 'node:child_process';
import {createServer} from 'node:net';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function checkPort(port){
 if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid QA port');
 await new Promise((resolve,reject)=>{const probe=createServer();probe.once('error',error=>reject(new Error('QA port '+port+' is occupied or unavailable: '+error.message)));probe.listen({host:'127.0.0.1',port,exclusive:true},()=>probe.close(error=>error?reject(error):resolve()));});
}
/** Own the child process, not the port. Never test or terminate a pre-existing listener. */
export async function startServer(port,onData=()=>{}){
 await checkPort(port);
 const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env:{...process.env,DATA_MODE:'snapshot',NEXT_TELEMETRY_DISABLED:'1'},detached:process.platform!=='win32',stdio:['ignore','pipe','pipe']});
 let output='',spawnError=null,stopped=false;child.on('error',error=>{spawnError=error;});
 const pipe=chunk=>{output=(output+chunk.toString()).slice(-16000);onData(chunk);};child.stdout.on('data',pipe);child.stderr.on('data',pipe);
 const signal=name=>{if(!child.pid)return;try{if(process.platform==='win32'){if(child.exitCode===null&&child.signalCode===null)execFileSync('taskkill',['/PID',String(child.pid),'/T','/F'],{stdio:'ignore'});}else process.kill(-child.pid,name);}catch(error){if(error.code!=='ESRCH'&&process.platform!=='win32')throw error;}};
 async function stop(){if(stopped)return;stopped=true;signal('SIGTERM');for(let i=0;i<30&&child.exitCode===null&&child.signalCode===null;i++)await sleep(100);if(child.exitCode===null&&child.signalCode===null)signal('SIGKILL');}
 const base='http://127.0.0.1:'+port,deadline=Date.now()+60000;
 try{while(Date.now()<deadline){if(spawnError)throw spawnError;if(child.exitCode!==null||child.signalCode!==null)throw new Error('QA server exited before readiness');if(/EADDRINUSE|Failed to start server/.test(output))throw new Error('QA port '+port+' is already in use');if(/Ready in/i.test(output)){try{const response=await fetch(base+'/api/v1/openapi',{signal:AbortSignal.timeout(2000)});if(response.ok)return {base,child,stop};}catch{}}await sleep(200);}throw new Error('QA server readiness timed out');}catch(error){await stop();throw new Error(error.message+'\n'+output.slice(-2000));}
}
''')
for p in (root/'scripts').glob('*qa.mjs'):p.write_text(p.read_text().replace('server.stop();','await server.stop();'))
write('tests/seo.test.ts',r'''
import {afterEach,describe,it,expect,vi} from 'vitest';
import {canonicalPath,pageMetadata,siteOrigin,indexingEnabled,pageGraph,serializeJsonLd,publicPaths} from '../src/core/seo';
import {slugFor} from '../src/core/metrics';
import sitemap from '../src/app/sitemap';
import robots from '../src/app/robots';
afterEach(()=>vi.unstubAllEnvs());
function published(){vi.stubEnv('SITE_URL','https://stats.example.org');vi.stubEnv('DATA_MODE','live');vi.stubEnv('VERCEL_ENV','production');vi.stubEnv('SITE_NOINDEX','false');}
describe('publication and route metadata',()=>{
 it('never invents a public hostname',()=>{vi.stubEnv('SITE_URL','');expect(siteOrigin()).toBeNull();expect(indexingEnabled()).toBe(false);});
 it('rejects local or non-origin configuration',()=>{for(const value of ['http://localhost:3000','https://127.0.0.1','https://example.org/path','https://u:p@example.org','javascript:alert(1)','https://example.org?x=1'])expect(()=>siteOrigin(value)).toThrow();});
 it('normalizes the configured public origin',()=>expect(siteOrigin('https://stats.example.org/')).toBe('https://stats.example.org'));
 it('keeps snapshots and previews out of indexing',()=>{published();expect(indexingEnabled()).toBe(true);vi.stubEnv('DATA_MODE','snapshot');expect(indexingEnabled()).toBe(false);vi.stubEnv('DATA_MODE','live');vi.stubEnv('VERCEL_ENV','preview');expect(indexingEnabled()).toBe(false);});
 it('canonicalizes aliases and UI filters without external URLs',()=>{expect(canonicalPath('/models?sort=price')).toBe('/models');expect(canonicalPath('/brokers/openbroker')).toBe('/providers/openbroker');expect(canonicalPath('/proxy')).toBe('/providers/proxy');expect(canonicalPath('//evil.test')).toBeNull();expect(canonicalPath('/models/../privacy')).toBeNull();});
 it('uses unique human-readable model titles',()=>{published();const a=pageMetadata('/models/'+slugFor('org/Model-A')),b=pageMetadata('/models/'+slugFor('org/Model-B'));expect(a.title).toContain('Model-A');expect(a.title).not.toBe(b.title);});
 it('canonicalizes filters to their collection, not the homepage',()=>{published();expect(pageMetadata('/models?compare=abc').alternates?.canonical).toBe('https://stats.example.org/models');});
 it('does not index personal or unconfigured feature pages',()=>{published();for(const path of ['/watchlist','/account','/account/usage','/intelligence'])expect(pageMetadata(path).robots).toMatchObject({index:false,follow:true});});
 it('has no duplicate or placeholder sitemap routes',()=>{expect(new Set(publicPaths).size).toBe(publicPaths.length);expect(publicPaths).not.toContain('/watchlist');expect(publicPaths).not.toContain('/brokers');expect(publicPaths).toContain('/providers/openbroker');});
 it('uses the same canonical URL in structured data',()=>{published();const graph=pageGraph('/providers/openbroker');expect(JSON.stringify(graph)).toContain('https://stats.example.org/providers/openbroker');expect(JSON.stringify(graph)).toContain('BreadcrumbList');});
 it('escapes script delimiters without changing JSON values',()=>{const value={name:'</script><script>alert(1)</script>'};const text=serializeJsonLd(value);expect(text).not.toContain('<');expect(JSON.parse(text)).toEqual(value);});
 it('produces a public sitemap without invented modification times',()=>{published();expect(sitemap().length).toBe(publicPaths.length);expect(sitemap().every(item=>item.url.startsWith('https://stats.example.org/')&&!item.lastModified)).toBe(true);expect(robots().sitemap).toBe('https://stats.example.org/sitemap.xml');});
 it('does not advertise snapshot fixture URLs for indexing',()=>{published();vi.stubEnv('DATA_MODE','snapshot');expect(sitemap()).toEqual([]);expect(robots().sitemap).toBeUndefined();});
});
''')
write('tests/qa-server.test.ts',r'''
import {createServer} from 'node:http';
import {it,expect} from 'vitest';
import {startServer} from '../scripts/qa-server.mjs';
it('refuses an occupied QA port without stopping or testing its existing owner',async()=>{
 const existing=createServer((_,res)=>{res.setHeader('Content-Type','application/json');res.end('{"openapi":"foreign"}');});await new Promise<void>(resolve=>existing.listen(0,'127.0.0.1',resolve));const address=existing.address();if(!address||typeof address==='string')throw new Error('No port');let launched:Awaited<ReturnType<typeof startServer>>|undefined;
 try{await expect((async()=>{launched=await startServer(address.port);})()).rejects.toThrow(/in use|occupied/);expect((await fetch('http://127.0.0.1:'+address.port)).status).toBe(200);}finally{if(launched)await launched.stop();existing.closeAllConnections();await new Promise<void>(resolve=>existing.close(()=>resolve()));}
},10000);
''')
write('scripts/qa-fixture.mjs',r'''
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
const source=JSON.parse(await readFile(new URL('../tests/fixtures/public-observation.json',import.meta.url),'utf8')));
if(source.version!==1||!Array.isArray(source.sources)||!source.generatedAt)throw new Error('Invalid retained QA observation');
source.mode='snapshot';await mkdir('data',{recursive:true});await writeFile('data/qa-snapshot.tmp',JSON.stringify(source));await rename('data/qa-snapshot.tmp','data/snapshot.json');
console.log('QA only: using retained public observation from '+source.generatedAt+'. No upstream requests were made.');
''')
write('scripts/seo-qa.mjs',r'''
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {startServer} from './qa-server.mjs';
process.env.SITE_URL='https://stats.example.org';
const server=await startServer(3105);let browser;
const report={startedAt:new Date().toISOString(),checks:[],accessibility:[],runtimeErrors:[],failures:[]};
try{
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});page.on('pageerror',error=>report.runtimeErrors.push(error.message));
 for(const route of ['/','/models?sort=price','/protocol','/providers/openbroker','/learn','/watchlist','/account/usage','/developers']){
  await page.goto(server.base+route,{waitUntil:'networkidle'});assert.equal(await page.locator('link[rel=canonical]').count(),1,route+' one canonical');assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://stats.example.org'+route.split('?')[0]);assert.match(await page.locator('meta[name=robots]').getAttribute('content'),/noindex/,'Snapshots must stay noindex');assert.ok((await page.locator('meta[name=description]').getAttribute('content')).length>35);report.checks.push('Canonical, description and snapshot noindex: '+route);
 }
 for(const path of ['/robots.txt','/sitemap.xml']){const response=await fetch(server.base+path);assert.equal(response.status,200);assert.ok(!response.headers.get('content-type')?.includes('text/html'),'No soft-404 HTML for '+path);report.checks.push('Real discovery document: '+path);}
 assert.equal((await fetch(server.base+'/api/v1/models')).headers.get('x-robots-tag'),'noindex');report.checks.push('API responses excluded from search indexing');
 await page.goto(server.base+'/protocol',{waitUntil:'networkidle'});const schemas=await page.locator('script[type="application/ld+json"]').allTextContents();assert.ok(schemas.map(text=>JSON.parse(text)).some(s=>s['@graph']?.some(n=>n['@type']==='BreadcrumbList')));report.checks.push('Valid page and breadcrumb JSON-LD');
 for(const alias of ['/brokers','/proxy','/media','/status','/token']){const response=await fetch(server.base+alias,{redirect:'manual'});assert.equal(response.status,308,alias+' permanent redirect');}report.checks.push('Permanent legacy aliases');
 await mkdir('artifacts/screenshots',{recursive:true});
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1000});await page.goto(server.base+'/',{waitUntil:'networkidle'});
  for(const i of [0,5]){const note=page.locator('.kpi-tile .source-note').nth(i);await note.locator('summary').click();await note.locator('a').scrollIntoViewIfNeeded();const bounds=await note.evaluate(el=>{const panel=el.querySelector('div').getBoundingClientRect(),link=el.querySelector('a'),r=link.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {right:panel.right,left:panel.left,hit:!!hit&&(link===hit||link.contains(hit))};});assert.ok(bounds.right<=width+1&&bounds.left>=0,'Source panel stays in viewport '+JSON.stringify(bounds));assert.ok(bounds.hit,'Source link is reachable');await note.locator('summary').click();}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:'artifacts/screenshots/seo-overview-'+width+'.png',fullPage:true});report.checks.push('Source disclosures within viewport and clickable at '+width);
 }
 await page.setViewportSize({width:390,height:1000});
 for(const theme of ['dark','light']){await page.goto(server.base+'/');if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:'Toggle color theme'}).click();const note=page.locator('.kpi-tile .source-note').nth(5);await note.locator('summary').click();await note.scrollIntoViewIfNeeded();const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({theme,width:390,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});await page.screenshot({path:'artifacts/screenshots/seo-source-'+theme+'-390.png',fullPage:false});}
 assert.equal(report.runtimeErrors.length,0);assert.equal(report.accessibility.flatMap(s=>s.violations).length,0);report.result='passed';
}catch(error){report.result='failed';report.error=error.stack??String(error);process.exitCode=1;console.error(error);}
finally{report.finishedAt=new Date().toISOString();await mkdir('artifacts',{recursive:true});await writeFile('artifacts/seo-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser?.close();await server.stop();}
''')
write('.github/workflows/verify.yml','''name: Verify GonkaStats
on:
  push:
    branches: [main]
    paths-ignore: ['docs/**', '**/*.md', 'LICENSE']
  pull_request:
    paths-ignore: ['docs/**', '**/*.md', 'LICENSE']
  workflow_dispatch:
    inputs:
      live_sources:
        description: 'Refresh public API observations instead of the retained QA fixture'
        type: boolean
        default: false
permissions:
  contents: read
concurrency:
  group: gonkastats-${{ github.ref }}
  cancel-in-progress: true
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 18
    env:
      NEXT_TELEMETRY_DISABLED: '1'
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262
      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020
        with:
          node-version: '22'
          cache: npm
      - run: npm ci --no-audit --no-fund
      - run: npm test
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run build
      - name: Load retained public QA observations (offline)
        if: ${{ !inputs.live_sources }}
        run: npm run qa:fixture
      - name: Refresh bounded public observations (manual opt-in only)
        if: ${{ inputs.live_sources }}
        run: npm run snapshot
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - name: Upload verification evidence
        if: always()
        uses: actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02
        with:
          name: gonkastats-verification
          path: artifacts/
          retention-days: 3
          if-no-files-found: warn
''')
p=root/'package.json';pkg=json.loads(p.read_text());pkg['dependencies']['next']='16.3.8';pkg['devDependencies']['eslint-config-next']='16.3.8';pkg['scripts']['qa:fixture']='node scripts/qa-fixture.mjs';pkg['scripts']['test:e2e']+=' && node scripts/seo-qa.mjs';p.write_text(json.dumps(pkg,indent=2)+'\n')
print('Applied source fixes. Resolve locked dependencies and complete verification before committing.')
