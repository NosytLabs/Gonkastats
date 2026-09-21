import {redirect,notFound} from 'next/navigation';
import {bech32Address} from '@/core/metrics';
import {canonicalSection} from '@/core/community-rules';
export default async function Page({params}:{params:Promise<{address:string}>}){const {address}=await params;if(!bech32Address(address))notFound();redirect('/'+canonicalSection('address')+'/'+address);}
