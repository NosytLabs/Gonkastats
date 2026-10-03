import {pageMetadata} from '@/core/seo';
import {getSnapshot} from '@/core/service';
import {Learn} from '@/features/learn';
export const dynamic = 'force-dynamic';
export const metadata=pageMetadata('/learn');
export default async function LearnPage() {return <Learn s={await getSnapshot()}/>;}
