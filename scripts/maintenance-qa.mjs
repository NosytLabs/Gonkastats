import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {startServer} from './qa-server.mjs';
const report={startedAt:new Date().toISOString(),checks:[],skipped:[],accessibility:[],runtimeErrors:[]};
let browser,server;
try{
 await mkdir('artifacts/screenshots',{recursive:true});
 const snapshot=JSON.parse(await readFile('data/snapshot.json','utf8'));
 server=await startServer(3110);const base=server.base;
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',error=>report.runtimeErrors.push(error.message));
 await page.goto(base+'/agents',{waitUntil:'networkidle'});
 const read=snapshot.endpoints.find(endpoint=>endpoint.readOnly);
 if(read){
  await page.getByRole('button',{name:'All definitions',exact:true}).click();
  const table=page.getByRole('region',{name:'RPC endpoints table',exact:true});
  await page.getByRole('textbox',{name:'Search RPC endpoints',exact:true}).fill(read.path);
  await expect(table.getByText(read.path,{exact:true}).first()).toBeVisible();
  await page.getByRole('button',{name:'Write docs',exact:true}).click();
  await expect(table.getByText(read.path,{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'All definitions',exact:true}).click();
  await page.getByRole('button',{name:'Reset table',exact:true}).click();
  report.checks.push('All definitions includes GET definitions; Write docs excludes them; table reset works');
 }else report.skipped.push('Agent GET filter: source returned no read definitions');
 const example=page.locator('.panel').filter({has:page.getByRole('heading',{name:'Try the GonkaStats API',exact:true})});
 await expect(example.locator('pre')).toContainText(base+'/api/v1/protocol');
 await page.getByRole('button',{name:'Run GET',exact:true}).click();await expect(example.getByText('HTTP 200',{exact:true})).toBeVisible();
 report.checks.push('Workbench uses this origin and reports the actual HTTP response');
 await page.goto(base+'/cost-lab',{waitUntil:'networkidle'});
 if(snapshot.models.length&&snapshot.sources.some(s=>s.id==='models'&&s.status!=='unavailable')){
  const selected=snapshot.models.at(-1);await page.getByRole('combobox',{name:'Model',exact:true}).selectOption(selected.id);
  await page.getByLabel('Number of requests',{exact:true}).fill('2');
  const link=page.getByRole('link',{name:'Open scenario JSON',exact:true});const href=await link.getAttribute('href');
  assert.equal(new URL(href,base).searchParams.get('model'),selected.id);
  const response=await page.request.get(base+href);assert.equal(response.status(),200);const body=await response.json();assert.equal(body.data.model,selected.id);assert.equal(body.data.tokens,'2500');
  await expect(page.getByRole('button',{name:'Copy scenario API',exact:true})).toBeVisible();
  report.checks.push('Cost scenario link includes selected model and produces matching real API totals');
 }else report.skipped.push('Model-specific scenario link: provider catalog unavailable or empty');
 await page.goto(base+'/changelog',{waitUntil:'networkidle'});await expect(page.getByRole('link',{name:'Inspect PR #17',exact:true})).toHaveAttribute('href','https://github.com/NosytLabs/Gonkastats/pull/17');
 report.checks.push('Changelog links to actual merged releases');
 for(const path of ['/api/v1/live?since=2026-02-30T00:00:00Z','/api/v1/lookup?kind=blocks&id=bad']){
  const response=await page.request.get(base+path);assert.equal(response.status(),400);assert.equal(response.headers()['cache-control'],'no-store');assert.equal(typeof(await response.json()).error,'string');
 }
 report.checks.push('Invalid dates and lookup identifiers produce non-cacheable HTTP 400 errors');
 for(const width of [1440,390])for(const path of ['/agents','/cost-lab','/signals','/changelog']){
  await page.setViewportSize({width,height:1000});await page.goto(base+path,{waitUntil:'networkidle'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,path+' overflow');await expect(page.locator('main h1')).toHaveCount(1);
  const theme=width===390?'light':'dark';if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:'Toggle color theme'}).click();
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({path,width,theme,violations:scan.violations.map(v=>v.id)});assert.equal(scan.violations.length,0,path+' accessibility');
  await page.screenshot({path:`artifacts/screenshots/maintenance-${path.slice(1)}-${width}.png`,fullPage:true});
 }
 report.checks.push('Agent, cost, signal and changelog pages have bounded desktop/mobile layouts');
 assert.equal(report.runtimeErrors.length,0);report.result=report.skipped.length?'passed_with_skips':'passed';
}catch(error){report.result='failed';report.error=error.stack??String(error);process.exitCode=1;}
finally{await browser?.close();await server?.stop();report.finishedAt=new Date().toISOString();await mkdir('artifacts',{recursive:true});await writeFile('artifacts/maintenance-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
