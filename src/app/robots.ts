import type {MetadataRoute} from 'next';
import {siteOrigin} from '@/core/seo';
export const dynamic='force-dynamic';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/api/']},sitemap:siteOrigin()+'/sitemap.xml'};}
