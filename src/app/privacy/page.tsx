import {pageMetadata} from '@/core/seo';
import {getSnapshot} from '@/core/service';
import {Community} from '@/features/community';
export const dynamic='force-dynamic';
export const metadata=pageMetadata('/privacy');
export default async function Page(){return <Community s={await getSnapshot()} section="privacy"/>;}
