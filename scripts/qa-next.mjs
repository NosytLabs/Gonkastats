import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);

/** Fail early if a Next upgrade changes the pinned production-start contract. */
export function productionStart(){
  try{
    const entry=require('next/dist/cli/next-start');
    if(typeof entry.nextStart!=='function')throw new Error('nextStart export is not a function');
    return entry.nextStart;
  }catch(cause){throw new Error('QA worker requires next/dist/cli/next-start to export nextStart. Check the pinned Next.js version: '+(cause instanceof Error?cause.message:String(cause)),{cause});}
}
