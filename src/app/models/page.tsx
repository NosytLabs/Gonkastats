import {pageMetadata} from '@/core/seo';
import {Suspense} from 'react';
import {getSnapshot} from '@/core/service';
import {ModelExplorer} from '@/features/model-explorer';
export const dynamic = 'force-dynamic';
export const metadata=pageMetadata('/models');
export default async function ModelsPage() {
  const snapshot = await getSnapshot();
  return <Suspense fallback={<p role="status">Preparing the model explorer…</p>}><ModelExplorer s={snapshot}/></Suspense>;
}
