import {getSnapshot} from '@/core/service';
import {Learn} from '@/features/learn';
export const dynamic = 'force-dynamic';
export const metadata = {title: 'Gonka field guide', description: 'Understand Gonka epochs, model capabilities, compute, provider pricing and settlement in plain language.'};
export default async function LearnPage() {return <Learn s={await getSnapshot()}/>;}
