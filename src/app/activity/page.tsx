import {getSnapshot} from '@/core/service';
import {ActivityLab} from '@/features/activity';
export const dynamic='force-dynamic';
export const metadata={title:'Activity Lab',description:'Understand Gonka indexed block activity with exact sample totals, transparent gaps and downloadable records.'};
export default async function Page(){return <ActivityLab s={await getSnapshot()}/>;}
