import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {startServer} from './qa-server.mjs';
await mkdir('artifacts/screenshots',{recursive:true});
process.env.SITE_URL='http://127.0.0.1:3106';
const server=await startServer(3106);let browser;
const report={checks:[],failures:[],accessibility:[],runtimeErrors:[],skipped:[],startedAt:new Date().toISOString()};
const check=async(name,fn)=>{try{await fn();report.checks.push(name);}catch(e){report.failures.push({name,error:String(e)});}};
try{
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined});
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>report.runtimeErrors.push(e.message));
 for(const width of [1440,390])await check('Aligned card footers and unclipped, focus-contained source details at '+width,async()=>{
  await page.setViewportSize({width,height:1000});await page.goto(server.base+'/',{waitUntil:'networkidle'});
  const cards=await page.locator('.kpi-tile').evaluateAll(tiles=>tiles.map(tile=>({row:Math.round(tile.getBoundingClientRect().top),footer:tile.querySelector('.source-note').getBoundingClientRect().top})));
  for(const row of new Set(cards.map(c=>c.row))){const positions=cards.filter(c=>c.row===row).map(c=>c.footer);assert.ok(Math.max(...positions)-Math.min(...positions)<=1,'KPI footers in a row must align');}
  const trigger=page.locator('.kpi-tile .source-note').first().getByRole('button');await trigger.click();
  const dialog=page.getByRole('dialog',{name:/Source details/});await expect(dialog).toBeVisible({timeout:2000});
  const box=await dialog.boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=width&&box.y>=0&&box.y+box.height<=1000);
  await expect(dialog.getByRole('link',{name:'Inspect upstream source'})).toBeVisible();
  for(let i=0;i<4;i++){await page.keyboard.press('Tab');assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)),'Keyboard focus stays inside the dialog');}
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
 });
 await check('Enter closes global search even when choosing the current route',async()=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto(server.base+'/models',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Search anything',exact:true}).click();await page.getByRole('textbox',{name:'Search pages and chain data'}).fill('Models');await page.keyboard.press('Enter');await expect(page.getByRole('dialog')).toHaveCount(0,{timeout:2000});
 });
 await check('Selecting the current page closes mobile navigation',async()=>{
  await page.setViewportSize({width:390,height:1000});await page.goto(server.base+'/',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Open navigation',exact:true}).click();await page.getByRole('dialog').getByRole('link',{name:'Overview',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page).toHaveURL(server.base+'/');
 });
 await check('Website structured data is server rendered and independently attributed',async()=>{
  const html=await(await fetch(server.base+'/',{headers:{'user-agent':'Twitterbot'}})).text();
  const scripts=[...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const nodes=scripts.flatMap(s=>s['@graph']??[s]);assert.ok(nodes.some(n=>n['@type']==='WebSite'&&n.name==='GonkaStats'));assert.ok(nodes.some(n=>n['@type']==='Organization'&&n.name==='Nosyt Labs'));
 });
 await check('Unconfirmed model details are noindex, not indexable soft-404 pages',async()=>{
  await page.goto(server.base+'/models/61',{waitUntil:'networkidle'});const robots=await page.locator('meta[name="robots"]').evaluateAll(tags=>tags.map(t=>t.getAttribute('content')));assert.ok(robots.some(value=>value?.includes('noindex')));
 });
 const observed=(await(await fetch(server.base+'/api/v1/overview')).json()).data;
 if(observed.models.length)await check('Visible model identity is used in detail metadata',async()=>{
  const model=observed.models[0];await page.goto(server.base+'/models/'+model.slug,{waitUntil:'networkidle'});assert.ok((await page.title()).includes(model.name));assert.ok(!(await page.title()).includes(model.slug));
 });else report.skipped.push('Live model identity metadata: provider catalog observation unavailable');
 for(const theme of ['dark','light'])for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});await page.goto(server.base+'/',{waitUntil:'networkidle'});if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:'Toggle color theme'}).click();
  await page.screenshot({path:'artifacts/screenshots/cleanup-overview-'+theme+'-'+width+'.png',fullPage:false});
  if(!report.failures.some(f=>f.name.includes('source details'))){await page.locator('.kpi-tile .source-note button').first().click();const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({theme,width,violations:result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))});await page.screenshot({path:'artifacts/screenshots/cleanup-source-'+theme+'-'+width+'.png'});await page.keyboard.press('Escape');}
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 }
 assert.equal(report.failures.length,0,JSON.stringify(report.failures));assert.equal(report.runtimeErrors.length,0);assert.equal(report.accessibility.flatMap(r=>r.violations).length,0);report.result='passed';
}catch(e){report.result='failed';report.error=String(e);process.exitCode=1;}finally{report.finishedAt=new Date().toISOString();await writeFile('artifacts/cleanup-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser?.close();await server.stop();}
