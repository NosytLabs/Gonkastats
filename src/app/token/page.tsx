import {redirect} from 'next/navigation';
import {canonicalSection} from '@/core/community-rules';
export default function Page(){redirect('/'+canonicalSection('token'));}
