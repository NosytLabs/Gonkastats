import {pageMetadata} from '@/core/seo';
import {getSnapshot} from '@/core/service';
import {ActivityLab} from '@/features/activity';
export const dynamic='force-dynamic';
export const metadata=pageMetadata('/activity');
export default async function Page(){return <ActivityLab s={await getSnapshot()}/>;}
