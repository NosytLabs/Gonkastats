import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium,expect} from '@playwright/test';
import {startServer} from './qa-server.mjs';
const report={startedAt:new Date().toISOString(),checks:[],runtimeErrors:[]};
let server,fixture,browser;
try{
 await mkdir('artifacts/screenshots',{recursive:true});server=await startServer(3108);
 // A second locally owned origin tests real browser CORS, not mocked API responses.
 fixture=createServer((_request,response)=>{response.setHeader('Content-Type','text/html');response.end('<!doctype html><title>Read-only API client test</title>');});
 await new Promise((resolve,reject)=>{fixture.once('error',reject);fixture.listen(0,'127.0.0.1',resolve);});
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});page.on('pageerror',e=>report.runtimeErrors.push(e.message));
 await page.goto('http://127.0.0.1:'+fixture.address().port);
 const observed=await page.evaluate(async base=>{
  const request=(path,headers={})=>fetch(base+path,{headers,cache:'no-store',signal:AbortSignal.timeout(10000)});
  const first=await request('/api/v1/metrics'),etag=first.headers.get('ETag');
  const cached=await request('/api/v1/metrics',{'If-None-Match':etag??''});
  const failures=[];
  for(const [path,expected] of [['/api/v1/epoch-diff?from=1&to=2',503],['/api/v1/epoch-diff?from=5&to=4',400],['/api/v1/simulate-cost?attempts=99',400],['/api/v1/simulate-cost?model=missing-model',404]]){
   const r=await request(path);failures.push({path,expected,status:r.status,cache:r.headers.get('Cache-Control'),error:(await r.json()).error});
  }
  const dependencies=(await (await request('/api/v1/source-health')).json()).data;
  return {status:first.status,etag,cached:cached.status,body:await cached.text(),failures,dependencies};
 },server.base);
 assert.equal(observed.status,200);assert.ok(observed.etag);assert.equal(observed.cached,304);assert.equal(observed.body,'');
 report.checks.push('Cross-origin browser reads ETag and completes conditional GET/preflight with an empty 304 response');
 for(const f of observed.failures){assert.equal(f.status,f.expected,f.path);assert.equal(f.cache,'no-store');assert.equal(typeof f.error,'string');}
 report.checks.push('Actual cross-origin epoch and cost errors preserve non-success status, no-store and readable error bodies');
 assert.ok(Array.isArray(observed.dependencies),'source-health data must be an array');
 for(const [id,path] of [['hardware','/hardware'],['pricing','/cost-lab']]){const source=observed.dependencies.find(s=>s.id===id);assert.ok(source,'source-health omitted '+id);assert.ok(Array.isArray(source.usedBy),'source-health usedBy must be an array for '+id);assert.ok(source.usedBy.includes(path),id+' must include '+path);}
 report.checks.push('Source-health API includes the actual hardware and cost-lab consumers');
 await page.goto(server.base+'/developers',{waitUntil:'networkidle'});await expect(page.getByRole('heading',{name:'Handle failures without inventing observations'})).toBeVisible();
 const example=page.getByTestId('api-example-epoch-diff');await example.locator('summary').click();await example.getByLabel('epoch-diff from',{exact:true}).fill('1');await example.getByLabel('epoch-diff to',{exact:true}).fill('2');await example.getByRole('button',{name:'Try it',exact:true}).click();await expect(example.getByText('HTTP 503',{exact:true})).toBeVisible();await expect(example.locator('.raw-record')).toContainText('snapshot mode');
 report.checks.push('Developer Try-it reports the actual disabled-integration error rather than a success');
 await page.screenshot({path:'artifacts/screenshots/developers-errors-1440.png',fullPage:true});
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});await page.goto(server.base+'/sources',{waitUntil:'networkidle'});await page.getByRole('textbox',{name:'Search sources'}).fill('Proxy pricing');
  await expect(page.locator('tbody').getByRole('link',{name:'/cost-lab',exact:true})).toBeVisible();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.screenshot({path:`artifacts/screenshots/source-consumers-${width}.png`,fullPage:true});
 }
 report.checks.push('Source consumer links remain readable without whole-page overflow at desktop/mobile widths');
 assert.equal(report.runtimeErrors.length,0);report.result='passed';
}catch(error){report.result='failed';report.error=error.stack??String(error);process.exitCode=1;}
finally{
 try{await browser?.close();}finally{
  try{if(fixture)await new Promise(resolve=>fixture.close(resolve));}finally{
   try{await server?.stop();}finally{report.finishedAt=new Date().toISOString();await mkdir('artifacts',{recursive:true});await writeFile('artifacts/api-client-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
  }
 }
}
