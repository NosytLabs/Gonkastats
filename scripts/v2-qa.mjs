import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const base='http://127.0.0.1:3104';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3104'],{env:{...process.env,DATA_MODE:'snapshot',NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore'});
const report={startedAt:new Date().toISOString(),checks:[],accessibility:[],runtimeErrors:[]};let browser;
try{
 await mkdir('artifacts/screenshots',{recursive:true});let ready=false;
 for(let i=0;i<60;i++){try{if((await fetch(base+'/api/v1/openapi')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,1000));}
 assert.ok(ready,'production server ready');
 for(const resource of ['protocol','providers','source-health']){const r=await fetch(base+'/api/v1/'+resource);assert.equal(r.status,200,resource+' API');report.checks.push(resource+' API');}
 browser=await chromium.launch();const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>report.runtimeErrors.push(e.message));
 for(const [path,name] of [['/protocol','Protocol radar'],['/providers','Provider layers'],['/providers/openbroker','OpenBroker']]){
   const response=await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(response?.status(),200,path+' status');await expect(page.getByRole('heading',{name:new RegExp(name,'i')})).toBeVisible();report.checks.push(path);
 }
 for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});for(const path of ['/protocol','/providers','/providers/openbroker','/sources','/agents']){await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,path+' overflow '+width);}}
 await page.setViewportSize({width:390,height:1000});for(const path of ['/protocol','/providers/openbroker']){await page.goto(base+path,{waitUntil:'networkidle'});const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({path,violations:a.violations.map(v=>v.id)});await page.screenshot({path:'artifacts/screenshots/v2-'+path.replaceAll('/','-').replace(/^-+/,'')+'-390.png',fullPage:true});}
 assert.equal(report.accessibility.flatMap(x=>x.violations).length,0);assert.equal(report.runtimeErrors.length,0);report.result='passed';
}catch(e){report.result='failed';report.error=e.stack??String(e);console.error(e);process.exitCode=1;}finally{report.finishedAt=new Date().toISOString();await writeFile('artifacts/v2-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser?.close();server.kill('SIGTERM');}
