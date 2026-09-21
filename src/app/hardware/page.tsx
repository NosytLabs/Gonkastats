import {getSnapshot} from '@/core/service';
import {Community} from '@/features/community';
export const dynamic='force-dynamic';
export const metadata={title:'Hardware'};
export default async function Page(){return <Community s={await getSnapshot()} section="hardware"/>;}
