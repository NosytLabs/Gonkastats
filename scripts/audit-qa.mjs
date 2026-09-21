import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base='http://127.0.0.1:3102';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3102'],{env:{...process.env,DATA_MODE:'snapshot',NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
const report={startedAt:new Date().toISOString(),checks:[],accessibility:[],runtimeErrors:[],skipped:[]};let browser;
try{
 await mkdir('artifacts/screenshots',{recursive:true});let ready=false;
 for(let i=0;i<60;i++){try{if((await fetch(base+'/api/v1/openapi')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,1000));}assert.ok(ready);
 const snapshot=(await(await fetch(base+'/api/v1/overview')).json()).data;
 const r=await fetch(base+'/api/v1/activity?limit=15');assert.equal(r.status,200);const a=(await r.json()).data;
 const blockSource=snapshot.sources.find(s=>s.id==='blocks');
 if(blockSource?.status!=='unavailable'){
  const selected=[...snapshot.blocks].sort((a,b)=>b.height-a.height).slice(0,15);
  assert.equal(a.transactions,selected.reduce((n,b)=>n+BigInt(b.transactions),0n).toString());
  assert.equal(a.gas,selected.reduce((n,b)=>n+BigInt(b.gas),0n).toString());
  assert.equal(a.rows.length,selected.length);report.checks.push('Activity API agrees exactly with selected observed records');
 }else{assert.equal(a.transactions,null);report.checks.push('Unavailable activity is null, not zero');}
 assert.equal((await fetch(base+'/api/v1/activity?limit=61')).status,400);
 assert.equal((await fetch(base+'/api/v1/activity?limit=15&limit=30')).status,400);
 report.checks.push('Activity bounds and duplicate query validation');
 browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'});page.on('pageerror',e=>report.runtimeErrors.push(e.message));
 await page.goto(base+'/activity',{waitUntil:'networkidle'});await expect(page.locator('main h1')).toHaveCount(1);
 await page.getByRole('button',{name:'Latest 15',exact:true}).click();await expect(page).toHaveURL(/records=15/);
 await page.reload({waitUntil:'networkidle'});await expect(page.getByRole('button',{name:'Latest 15',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Per block',exact:true}).click();if(a.rows.length)await expect(page.getByRole('figure',{name:'Transactions per returned block'})).toBeVisible();
 if(a.rows.length){const event=page.waitForEvent('download');await page.getByRole('button',{name:'Export activity',exact:true}).click();assert.equal((await event).suggestedFilename(),'gonka-activity.csv');}else report.skipped.push('Activity CSV interaction: source has no records');
 report.checks.push('Shareable sample, reload state, measure switch and bounded export');
 await page.goto(base+'/participants');await page.getByRole('textbox',{name:'Search participants'}).fill('no-such-member');await page.getByRole('button',{name:'Reset table',exact:true}).click();await expect(page.getByRole('textbox',{name:'Search participants'})).toHaveValue('');report.checks.push('Unified table reset clears filters');
 await page.goto(base+'/learn');await expect(page.getByRole('heading',{name:'Read an OpenBroker bill correctly'})).toBeVisible();report.checks.push('Public versus private billing guide is reachable');
 for(const theme of ['dark','light']){
  await page.goto(base+'/activity');if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:'Toggle color theme'}).click();
  for(const width of [1440,768,390]){
   await page.setViewportSize({width,height:1050});
   for(const path of ['/activity','/learn']){await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,path+' overflow');
    if(width!==768){const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({path,theme,width,violations:result.violations.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target)}))});}
    if(path==='/activity')await page.screenshot({path:`artifacts/screenshots/activity-${theme}-${width}.png`,fullPage:true});
   }
  }
 }
 assert.equal(report.runtimeErrors.length,0);assert.equal(report.accessibility.flatMap(r=>r.violations).length,0);report.result='passed';
}catch(e){report.result='failed';report.error=e.stack??String(e);console.error(e);process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();await writeFile('artifacts/audit-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
