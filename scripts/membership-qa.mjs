import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {startServer} from './qa-server.mjs';
const original=await readFile('data/snapshot.json','utf8');
const snapshot=JSON.parse(original);
// Only a public address is needed to test local stars; no live lookup is made.
const address=snapshot.participants[0]?.address??snapshot.participantStats[0]?.address??'gonka1scskt6wpnjnumsah6kjphmdu87vjgvcxmn4rxv';
const report={startedAt:new Date().toISOString(),mode:'Retained public snapshot plus explicitly injected missing/empty membership scenarios',checks:[],failures:[],skipped:[],accessibility:[],runtimeErrors:[]};
let browser;
const SKIP=Symbol('skip');
async function check(name,run){try{if(await run()!==SKIP)report.checks.push(name);}catch(e){report.failures.push({name,error:e.stack??String(e)});}}
async function scenario(name,value,run){
 await writeFile('data/snapshot.json',JSON.stringify(value));let server,context;
 try{
  server=await startServer(3107);context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();context.on('page',p=>p.on('pageerror',e=>report.runtimeErrors.push(name+': '+e.message)));page.on('pageerror',e=>report.runtimeErrors.push(name+': '+e.message));
  await run(page,context,server.base);
 }finally{try{await context?.close();await server?.stop();}finally{await writeFile('data/snapshot.json',original);}}
}
try{
 await mkdir('artifacts/screenshots',{recursive:true});browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
 await scenario('observed',snapshot,async(page,context,base)=>{
  await check('Stars synchronize across tabs, same-tab events, and local watchlist removal',async()=>{
   const second=await context.newPage(),url=base+'/participants/'+address;
   await page.goto(url,{waitUntil:'networkidle'});await second.goto(url,{waitUntil:'networkidle'});
   await page.getByRole('button',{name:'Add to watchlist',exact:true}).click();await expect(second.getByRole('button',{name:'Remove from watchlist',exact:true})).toBeVisible();
   await second.getByRole('button',{name:'Remove from watchlist',exact:true}).click();await expect(page.getByRole('button',{name:'Add to watchlist',exact:true})).toBeVisible();
   await page.evaluate(address=>{localStorage.setItem('gonkastats-watchlist',JSON.stringify([address]));window.dispatchEvent(new Event('gonkastats-watchlist'));},address);
   await expect(page.getByRole('button',{name:'Remove from watchlist',exact:true})).toBeVisible();
   await second.goto(base+'/watchlist',{waitUntil:'networkidle'});await second.getByRole('button',{name:'Remove from watchlist',exact:true}).click();await expect(page.getByRole('button',{name:'Add to watchlist',exact:true})).toBeVisible();await second.close();
  });
  await check('Participant search disables empty exports and reset restores observed rows',async()=>{
   await page.goto(base+'/participants',{waitUntil:'networkidle'});
   if(!snapshot.sources.some(s=>s.id==='participants'&&s.status!=='unavailable')){await expect(page.getByRole('heading',{name:'Membership data unavailable',exact:true})).toBeVisible();report.skipped.push('Participant search/export/reset: public membership source unavailable');return SKIP;}
   await page.getByRole('textbox',{name:'Search participants'}).fill('no-such-address-cleanup');await expect(page.getByRole('button',{name:'Export CSV',exact:true})).toBeDisabled();
   await page.getByRole('button',{name:'Reset table',exact:true}).click();await expect(page.getByRole('textbox',{name:'Search participants'})).toHaveValue('');
   if(snapshot.participants.length)await expect(page.getByRole('button',{name:'Export CSV',exact:true})).toBeEnabled();
  });
  await check('Network reuses source-qualified chart panels with exact data controls',async()=>{
   await page.goto(base+'/network',{waitUntil:'networkidle'});await expect(page.getByRole('heading',{name:'Which models do members report?',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'What hardware is registered?',exact:true})).toBeVisible();
   await page.getByRole('button',{name:'View model participation data',exact:true}).click();await expect(page.locator('caption').filter({hasText:'Model participation exact values'})).toHaveCount(1);
  });
  await check('Network model and membership context use compact stacked cards',async()=>{
   await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/network',{waitUntil:'networkidle'});
   const cards=page.locator('.network-compute-stack > .panel');await expect(cards).toHaveCount(2);
   const first=await cards.nth(0).boundingBox(),second=await cards.nth(1).boundingBox();assert.ok(first&&second);
   const gap=second.y-(first.y+first.height);assert.ok(Math.abs(gap-18)<=4,'Related cards retain the designed 18px separation');
   assert.equal(await page.locator('.network-compute-grid').evaluate(el=>getComputedStyle(el).alignItems),'start');
  });
  for(const theme of ['dark','light'])for(const width of [1440,390])await check('Observed network layout '+theme+' '+width,async()=>{
   await page.setViewportSize({width,height:1000});await page.goto(base+'/network',{waitUntil:'networkidle'});if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:'Toggle color theme'}).click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await expect(page.locator('main h1')).toHaveCount(1);
   const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({scenario:'observed',theme,width,violations:a.violations.map(v=>v.id)});assert.equal(a.violations.length,0);
   await page.screenshot({path:`artifacts/screenshots/network-membership-${theme}-${width}.png`,fullPage:true});
  });
 });
 const gap=structuredClone(snapshot);gap.participants=[];gap.hardware=[];gap.validators=null;
 gap.sources=gap.sources.map(s=>['participants','hardware'].includes(s.id)?{...s,status:'unavailable',error:'TEST FIXTURE: membership observation unavailable'}:s);
 await scenario('injected-unavailable',gap,async(page,context,base)=>{
  await check('Unavailable membership has recovery guidance, not an empty-filter claim',async()=>{await page.goto(base+'/participants',{waitUntil:'networkidle'});await expect(page.getByRole('heading',{name:'Membership data unavailable',exact:true})).toBeVisible();await expect(page.locator('main').getByRole('link',{name:'Inspect source status',exact:true})).toBeVisible();await expect(page.getByRole('textbox',{name:'Search participants'})).toHaveCount(0);});
  await check('Profiles do not infer absence from unavailable membership',async()=>{await page.goto(base+'/participants/'+address,{waitUntil:'networkidle'});await expect(page.getByRole('heading',{name:'Membership data unavailable',exact:true})).toBeVisible();await expect(page.getByText('This address is not in the current membership response.',{exact:false})).toHaveCount(0);});
  await check('Saved addresses retain an unknown membership status during upstream gaps',async()=>{await page.evaluate(address=>localStorage.setItem('gonkastats-watchlist',JSON.stringify([address])),address);await page.goto(base+'/watchlist',{waitUntil:'networkidle'});await expect(page.getByRole('cell',{name:'Membership unavailable',exact:true})).toBeVisible();await expect(page.locator('tbody tr')).toHaveCount(1);});
  await check('Unavailable mobile membership is readable and accessible',async()=>{await page.setViewportSize({width:390,height:900});await page.goto(base+'/participants',{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({scenario:'injected-unavailable',width:390,violations:a.violations.map(v=>v.id)});assert.equal(a.violations.length,0);});
 });
 const empty=structuredClone(gap);empty.sources=empty.sources.map(s=>s.id==='participants'?{...s,status:'recent',error:null}:s);
 await scenario('injected-observed-empty',empty,async(page,context,base)=>{
  await check('Observed zero members stays distinct from unavailable membership',async()=>{await page.goto(base+'/participants',{waitUntil:'networkidle'});await expect(page.getByText('No members were returned for this epoch.',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Export CSV',exact:true})).toBeDisabled();await page.getByRole('textbox',{name:'Search participants'}).fill('anything');await expect(page.getByText('No members were returned for this epoch.',{exact:true})).toBeVisible();await page.goto(base+'/participants/'+address,{waitUntil:'networkidle'});await expect(page.getByRole('heading',{name:'Not in the retained epoch membership',exact:true})).toBeVisible();});
 });
 assert.equal(report.failures.length,0,'Named checks failed');assert.equal(report.runtimeErrors.length,0,'Browser runtime failures');report.result=report.skipped.length?'passed_with_skips':'passed';
}catch(e){report.result='failed';report.error=e.stack??String(e);process.exitCode=1;}
finally{await writeFile('data/snapshot.json',original);await browser?.close();report.finishedAt=new Date().toISOString();await mkdir('artifacts',{recursive:true});await writeFile('artifacts/membership-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
