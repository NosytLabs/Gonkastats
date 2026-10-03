import {pageMetadata} from '@/core/seo';
import {getSnapshot} from '@/core/service';
import {CostLabPage} from '@/features/cost-lab';
export const dynamic='force-dynamic';
export const metadata=pageMetadata('/cost-lab');
export default async function Page(){return <CostLabPage s={await getSnapshot()}/>;}
