import {pageMetadata} from '@/core/seo';
import {getSnapshot} from '@/core/service';
import {Documentation} from '@/features/platform';
export const dynamic='force-dynamic';
export const metadata=pageMetadata('/account/usage');
export default async function Page(){return <Documentation s={await getSnapshot()} section="account"/>;}
