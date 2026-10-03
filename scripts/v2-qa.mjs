import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const {startServer}=await import('./qa-server.mjs');
const server=await startServer(3104);
const base=server.base;
const report={startedAt:new Date().toISOString(),checks:[],accessibility:[],runtimeErrors:[]};let browser;
try{
 await mkdir('artifacts/screenshots',{recursive:true});
 for(const resource of ['protocol','providers','source-health']){const r=await fetch(base+'/api/v1/'+resource);assert.equal(r.status,200,resource+' API');report.checks.push(resource+' API');}
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>report.runtimeErrors.push(e.message));
 for(const [path,name] of [['/protocol','Protocol radar'],['/providers','Provider layers'],['/providers/openbroker','OpenBroker'],['/providers/proxy','Proxy by gonka.gg']]){
   const response=await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(response?.status(),200,path+' status');await expect(page.getByRole('heading',{name:new RegExp(name,'i')})).toBeVisible();report.checks.push(path);
 }
 await page.goto(base+'/models',{waitUntil:'networkidle'});await expect(page.getByText('Chain lifecycle',{exact:true}).first()).toBeVisible();report.checks.push('Model explorer exposes chain lifecycle separately from provider metadata');
 await page.goto(base+'/sources',{waitUntil:'networkidle'});await expect(page.getByRole('columnheader',{name:/Used by/i})).toBeVisible();report.checks.push('Source radar shows dependent product surfaces');
 await page.goto(base+'/agents',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Write docs',exact:true}).click();await expect(page.getByText('Documentation only',{exact:true}).first()).toBeVisible();report.checks.push('Write definitions are visibly documentation-only');
 await page.goto(base+'/',{waitUntil:'networkidle'});await expect(page.locator('main a[href="/protocol"]').first()).toBeVisible();report.checks.push('Overview links current protocol context');
 await page.goto(base+'/network',{waitUntil:'networkidle'});await expect(page.getByRole('heading',{name:/Current protocol model set/i})).toBeVisible();report.checks.push('Network separates current protocol model set from provider availability');
 await page.goto(base+'/',{waitUntil:'networkidle'});await page.getByRole('button',{name:'Search anything',exact:true}).click();const search=page.getByRole('textbox',{name:'Search pages and chain data'});await search.pressSequentially('Epoch diff');await expect(page.getByRole('dialog').getByRole('link',{name:'Epoch diff',exact:true})).toBeVisible();report.checks.push('Global search preserves spaces during normal typing');
 await page.goto(base+'/providers/openbroker',{waitUntil:'networkidle'});await expect(page.getByRole('link',{name:'Providers',exact:true})).toHaveAttribute('aria-current','page');report.checks.push('Nested routes expose current navigation state');
 for(const [legacy,canonical] of [['/brokers','/providers'],['/brokers/openbroker','/providers/openbroker'],['/proxy','/providers/proxy'],['/media','/pulse'],['/status','/sources']]){await page.goto(base+legacy,{waitUntil:'networkidle'});await expect(page).toHaveURL(base+canonical);};report.checks.push('Legacy duplicate routes redirect to canonical pages');
 await page.goto(base+'/methodology',{waitUntil:'networkidle'});await expect(page.locator('.breadcrumb')).toContainText('Methodology');await page.getByRole('button',{name:'Search anything',exact:true}).click();const utilitySearch=page.getByRole('textbox',{name:'Search pages and chain data'});await utilitySearch.fill('Privacy');await expect(page.getByRole('dialog').getByRole('link',{name:'Privacy',exact:true})).toBeVisible();report.checks.push('Utility pages have useful breadcrumbs and command-search labels');
 for(const width of [1440,768,390]){await page.setViewportSize({width,height:1000});for(const path of ['/protocol','/providers','/providers/openbroker','/sources','/agents']){await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,path+' overflow '+width);}}
 await page.setViewportSize({width:390,height:1000});for(const path of ['/protocol','/providers/openbroker']){await page.goto(base+path,{waitUntil:'networkidle'});const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({path,violations:a.violations.map(v=>v.id)});await page.screenshot({path:'artifacts/screenshots/v2-'+path.replaceAll('/','-').replace(/^-+/,'')+'-390.png',fullPage:true});}
 assert.equal(report.accessibility.flatMap(x=>x.violations).length,0);assert.equal(report.runtimeErrors.length,0);report.result='passed';
}catch(e){report.result='failed';report.error=e.stack??String(e);console.error(e);process.exitCode=1;}finally{report.finishedAt=new Date().toISOString();await writeFile('artifacts/v2-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));await browser?.close();await server.stop();}
