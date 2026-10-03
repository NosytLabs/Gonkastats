import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {expect,it} from 'vitest';
const run=promisify(execFile);
it('an unconfigured one-shot collector fails immediately instead of reporting success',async()=>{
 const result=await run(process.execPath,['--import','tsx','scripts/collect.ts','--once'],{env:{...process.env,DATABASE_URL:''},timeout:4000}).then(value=>({code:0,...value}),error=>({code:error.code,stderr:String(error.stderr)}));
 expect(result.code).toBe(1);expect(result.stderr).toContain('DATABASE_URL');
});
