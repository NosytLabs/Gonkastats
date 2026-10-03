import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {startServer} from './qa-server.mjs';
const original=await readFile('data/snapshot.json','utf8'),snapshot=JSON.parse(original);
const report={startedAt:new Date().toISOString(),mode:'Retained public catalog plus explicitly injected unavailable/empty scenarios',checks:[],skipped:[],failures:[],accessibility:[],runtimeErrors:[]};
let browser;
async function check(name,run){try{await run();report.checks.push(name);}catch(e){report.failures.push({name,error:e.stack??String(e)});}}
async function scenario(name,value,run){let server,context;try{
 await writeFile('data/snapshot.json',JSON.stringify(value));server=await startServer(3111);
 context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();page.on('pageerror',e=>report.runtimeErrors.push(name+': '+e.message));
 await run(page,server.base);
}finally{try{await context?.close();}finally{try{await server?.stop();}finally{await writeFile('data/snapshot.json',original);}}}}
try{
 await mkdir('artifacts/screenshots',{recursive:true});browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
 await scenario('observed',snapshot,async(page,base)=>{
  if(snapshot.models.length&&snapshot.sources.some(s=>s.id==='models'&&s.status!=='unavailable')){
   const model=snapshot.models[0];
   await check('Reset filters preserves the separately selected model comparison',async()=>{
    await page.goto(base+'/models?compare='+model.slug+'&q=no-such-model',{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Reset filters',exact:true}).click();
    await expect(page.getByRole('textbox',{name:'Search model catalog'})).toHaveValue('');
    await expect(page.locator('.model-comparison-table')).toContainText(model.name);
    assert.deepEqual(new URL(page.url()).searchParams.getAll('compare'),[model.slug]);
   });
   await check('Filtered catalog exports are disabled when no real rows match',async()=>{
    await page.goto(base+'/models?q=no-such-model',{waitUntil:'networkidle'});await expect(page.getByRole('heading',{name:'No models match this view',exact:true})).toBeVisible();
    await expect(page.getByRole('button',{name:'Export filtered',exact:true})).toBeDisabled();
    await page.getByRole('button',{name:'Reset filters',exact:true}).click();await expect(page.getByRole('button',{name:'Export filtered',exact:true})).toBeEnabled();
   });
   for(const [width,theme] of [[1440,'dark'],[390,'light']])await check('Model tables have keyboard scrolling and readable layout '+width,async()=>{
    await page.setViewportSize({width,height:1000});await page.goto(base+'/models?view=table&compare='+model.slug,{waitUntil:'networkidle'});
    if(await page.locator('html').getAttribute('data-theme')!==theme)await page.getByRole('button',{name:'Toggle color theme'}).click();
    for(const name of ['Model catalog table','Selected model comparison table'])await expect(page.getByRole('region',{name,exact:true})).toHaveAttribute('tabindex','0');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({width,theme,violations:result.violations.map(v=>v.id)});assert.equal(result.violations.length,0);
    await page.screenshot({path:`artifacts/screenshots/catalog-polish-${width}.png`,fullPage:true});
   });
  }else report.skipped.push('Observed catalog comparison/export/layout checks: no usable catalog rows');
 });
 for(const [name,status,title] of [['unavailable','unavailable','Model catalog unavailable'],['empty','recent','No models in this observation']]){
  const fixture=structuredClone(snapshot);fixture.models=[];fixture.sources=fixture.sources.map(s=>s.id==='models'?{...s,status,error:status==='unavailable'?'TEST FIXTURE: catalog unavailable':null}:s);
  await scenario(name,fixture,async(page,base)=>{await check(name+' catalog explains its source state without blaming filters',async()=>{
   await page.setViewportSize({width:390,height:1000});await page.goto(base+'/models?q=anything',{waitUntil:'networkidle'});
   await expect(page.getByRole('heading',{name:title,exact:true}).first()).toBeVisible();await expect(page.getByRole('heading',{name:'No models match this view',exact:true})).toHaveCount(0);
   await expect(page.getByRole('button',{name:'Export filtered',exact:true})).toBeDisabled();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
   await page.screenshot({path:`artifacts/screenshots/catalog-${name}-390.png`,fullPage:true});
  });});
 }
 assert.equal(report.failures.length,0,'Catalog checks failed');assert.equal(report.runtimeErrors.length,0);report.result=report.skipped.length?'passed_with_skips':'passed';
}catch(e){report.result='failed';report.error=e.stack??String(e);process.exitCode=1;}
finally{try{await browser?.close();}finally{await writeFile('data/snapshot.json',original);report.finishedAt=new Date().toISOString();await writeFile('artifacts/catalog-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}}
