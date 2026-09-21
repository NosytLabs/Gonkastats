import {getSnapshot} from '@/core/service';
import {ApiReference} from '@/features/api-reference';
export const dynamic='force-dynamic';
export const metadata={title:'Developers & API Reference'};
export default async function Page(){return <ApiReference s={await getSnapshot()}/>;}
