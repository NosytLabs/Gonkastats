import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
await mkdir('artifacts/screenshots',{recursive:true});
const log=createWriteStream('artifacts/server.log');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3100'],{env:{...process.env,DATA_MODE:'snapshot',NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});server.stdout.pipe(log);server.stderr.pipe(log);
const base='http://127.0.0.1:3100';let browser;const report={startedAt:new Date().toISOString(),mode:'retained public observation; no synthetic production values',routes:[],api:[],interactions:[],accessibility:[],consoleErrors:[],sourceStatus:[]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function checkApi(path,status=200){const r=await fetch(base+path);assert.equal(r.status,status,path);const j=await r.json();report.api.push({path,status:r.status});return j;}
try{
 let ready=false;for(let i=0;i<60;i++){try{const r=await fetch(base+'/api/v1/openapi');if(r.ok){ready=true;break;}}catch{}await sleep(1000);}assert.ok(ready,'Server started within 60 seconds');
 const snapshot=JSON.parse(await readFile('data/snapshot.json','utf8'));report.sourceStatus=snapshot.sources.map(s=>({id:s.id,status:s.status,error:s.error,url:s.url,fetchedAt:s.fetchedAt}));
 const api=await checkApi('/api/v1/overview');assert.equal(api.data.mode,'snapshot');assert.ok(Array.isArray(api.meta.sources));
 for(const path of ['metrics','models?limit=2','participants?limit=5','blocks?limit=5','epochs','inference','sources','endpoints?limit=5','history','charts?metric=weight&hours=24&maxPoints=20','live?limit=5','simulate-cost?prompt=1000000&completion=250000&requests=2&attempts=1.5'])await checkApi('/api/v1/'+path);
 for(const path of ['models?limit=999','models?limit=1&limit=2','models?url=http://169.254.169.254','charts?metric=unknown','lookup?kind=blocks&id=bad','simulate-cost?prompt=-1','epoch-diff?from=10&to=1'])await checkApi('/api/v1/'+path,400);
 await checkApi('/api/v1/not-real',404);
 const schema=await checkApi('/api/v1/openapi');assert.ok(Object.keys(schema.paths).length>=24);for(const path of ['/activity','/protocol','/providers','/source-health','/context-plan','/composition'])assert.ok(schema.paths[path],`OpenAPI path ${path}`);
 const one=await fetch(base+'/api/v1/models');const etag=one.headers.get('etag');assert.ok(etag);const cached=await fetch(base+'/api/v1/models',{headers:{'If-None-Match':etag}});assert.equal(cached.status,304);report.interactions.push('ETag conditional request returns 304');
 browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>report.consoleErrors.push(e.message));
 const routes=['/','/network','/participants','/epochs','/inference','/models','/brokers','/proxy','/markets','/tokenomics','/rewards','/treasury','/vesting','/devshards','/bridge','/governance','/blocks','/transactions','/pulse','/agents','/cost-lab','/epoch-diff','/signals','/sources','/developers','/methodology','/changelog','/intelligence','/account','/hardware','/ecosystem','/watchlist','/about','/privacy','/account/usage'];
 for(const path of routes){const response=await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(response.status(),200,path);assert.equal(await page.locator('main h1').count(),1,path+' heading');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,path+' horizontal overflow');report.routes.push({path,status:200});}
 await page.goto(base+'/');await page.waitForTimeout(600);await page.screenshot({path:'artifacts/screenshots/overview-1440.png',fullPage:true});await page.screenshot({path:'artifacts/screenshots/overview-desktop.png',fullPage:false});
 if(snapshot.blocks.length>=30){const chart=page.getByTestId('activity-chart');await page.getByRole('button',{name:'15 blocks',exact:true}).click();assert.equal(await chart.getAttribute('data-points'),'15');await page.getByLabel('Activity measure').getByRole('button',{name:'Gas used',exact:true}).click();await page.getByRole('button',{name:'View data table',exact:true}).click();assert.equal(await page.locator('caption').filter({hasText:'Indexed activity data'}).count(),1);report.interactions.push('Chart range, measure, and data-table controls');}
 await page.goto(base+'/participants');const input=page.getByRole('textbox',{name:'Search participants'});await input.fill('no-such-member');await page.getByText('No records match this view.').waitFor();await input.fill('');report.interactions.push('Participant text filtering and empty state');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export CSV',exact:true}).click();const download=await downloadPromise;assert.ok(download.suggestedFilename().endsWith('.csv'));report.interactions.push('CSV export produces a file');
 await page.goto(base+'/developers');const example=page.getByTestId('api-example-models');await example.locator('summary').click();await example.getByRole('button',{name:'Try it',exact:true}).click();await example.getByText('HTTP 200',{exact:true}).waitFor();await page.screenshot({path:'artifacts/screenshots/developers-1440.png',fullPage:false});assert.ok((await example.locator('pre.code-sample').textContent()).includes("'"+base+'/api/v1/models?'));report.interactions.push('Interactive REST reference calls the real local API and uses the current site origin in quoted curl');
 await page.goto(base+'/cost-lab');const before=await page.getByTestId('cost-tokens').textContent();await page.getByLabel('Number of requests',{exact:true}).fill('2');assert.notEqual(await page.getByTestId('cost-tokens').textContent(),before);const scenario=await checkApi('/api/v1/simulate-cost?prompt=1000000&completion=250000&requests=2&attempts=1.5');assert.equal(scenario.data.tokens,'2500000');await page.screenshot({path:'artifacts/screenshots/cost-lab-1440.png',fullPage:true});report.interactions.push('Cost inputs recalculate; API returns matching exact workload');
 await page.goto(base+'/agents');await page.screenshot({path:'artifacts/screenshots/agents-1440.png',fullPage:false});
 await page.goto(base+'/hardware');await page.screenshot({path:'artifacts/screenshots/hardware-1440.png',fullPage:false});
 if(snapshot.participants.length){
  const address=snapshot.participants[0].address;
  await page.goto(base+'/participants/'+address);
  await page.getByRole('button',{name:'Add to watchlist',exact:true}).click();
  await page.waitForFunction(address=>JSON.parse(localStorage.getItem('gonkastats-watchlist')??'[]').includes(address),address);
  await page.goto(base+'/watchlist');
  // The watchlist intentionally reads localStorage only after hydration.
  // Wait for its saved-row UI; count() alone does not auto-retry.
  await page.getByRole('button',{name:'Remove from watchlist',exact:true}).waitFor({state:'visible'});
  assert.equal(await page.locator('tbody tr').count(),1);
  await page.getByRole('button',{name:'Remove from watchlist',exact:true}).click();
  await page.getByText('Keep an eye on the compute you care about',{exact:true}).waitFor();
  report.interactions.push('Local watchlist save, display, and remove');
 }
 await page.goto(base+'/token');await page.waitForURL('**/tokenomics');report.interactions.push('Conventional token route alias');
 await page.goto(base+'/');assert.equal(await page.getByRole('button',{name:'Snapshot',exact:true}).isDisabled(),true);assert.ok((await page.locator('.observation-bar').textContent()).includes(snapshot.generatedAt.slice(0,10)));report.interactions.push('Snapshot refresh is disabled and full observation date is visible');
 await page.getByRole('button',{name:'Search anything',exact:true}).click();await page.getByRole('textbox',{name:'Search pages and chain data'}).fill('Epoch diff');await page.getByRole('dialog').getByRole('link',{name:'Epoch diff',exact:true}).click();await page.waitForURL('**/epoch-diff');report.interactions.push('Global command search navigates to an actual route');
 for(const path of ['/','/developers','/cost-lab','/participants','/hardware','/privacy','/watchlist']){await page.goto(base+path);const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({path,violations:results.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>n.target)}))});}
 await page.goto(base+'/');await page.getByRole('button',{name:'Toggle color theme'}).click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');await page.screenshot({path:'artifacts/screenshots/overview-light-1440.png',fullPage:false});report.interactions.push('Theme toggle');await page.getByRole('button',{name:'Toggle color theme'}).click();
 for(const width of [768,390]){await page.setViewportSize({width,height:900});for(const path of ['/','/developers','/agents','/cost-lab','/participants','/hardware','/ecosystem','/watchlist','/privacy']){await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,path+' mobile overflow at '+width);if(path==='/'){await page.waitForTimeout(500);await page.screenshot({path:`artifacts/screenshots/overview-${width}.png`,fullPage:true});}}}
 await page.getByRole('button',{name:'Open navigation',exact:true}).click();await page.getByRole('dialog').getByRole('link',{name:'Participants',exact:true}).click();await page.waitForURL('**/participants');report.interactions.push('Mobile navigation drawer');
 assert.equal(report.consoleErrors.length,0,'No browser runtime or hydration errors');const serious=report.accessibility.flatMap(r=>r.violations.filter(v=>['serious','critical'].includes(v.impact)));assert.equal(serious.length,0,'No serious/critical automated accessibility violations in tested views');report.finishedAt=new Date().toISOString();report.result='passed';
}catch(error){report.result='failed';report.error=error.stack??String(error);console.error(error);process.exitCode=1;}finally{await writeFile('artifacts/qa-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');log.end();}
