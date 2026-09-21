import {getSnapshot} from '@/core/service';
import {Documentation} from '@/features/platform';
export const dynamic='force-dynamic';
export const metadata={title:'Account usage — not configured'};
export default async function Page(){return <Documentation s={await getSnapshot()} section="account"/>;}
