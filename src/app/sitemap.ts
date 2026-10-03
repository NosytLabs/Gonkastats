import type {MetadataRoute} from 'next';
import {sitemapUrls} from '@/core/seo';
export const dynamic='force-dynamic';
export default function sitemap():MetadataRoute.Sitemap{return sitemapUrls().map(url=>({url}));}
