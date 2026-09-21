import {getSnapshot} from '@/core/service';
import {ContextPlanner} from '@/features/context-planner';
export const dynamic='force-dynamic';
export const metadata={title:'Context budget planner'};
export default async function Page({searchParams}: {searchParams: Promise<Record<string,string|string[]|undefined>>}) {
  const query=await searchParams;
  const input=(value:string|string[]|undefined,fallback:string)=>typeof value==='string'&&/^\d{1,10}$/.test(value)&&BigInt(value)<=1000000000n?value:fallback;
  return <ContextPlanner s={await getSnapshot()} initialPrompt={input(query.prompt,'8000')} initialCompletion={input(query.completion,'2000')}/>;
}
