import type {Metadata,Viewport} from 'next';
import type {ReactNode} from 'react';
import {Shell} from '@/components/shell';
import './globals.css';
export const metadata:Metadata={title:{default:'GonkaStats — The Gonka Observatory',template:'%s | GonkaStats'},description:'Independent Gonka community analytics by Nosyt Labs. Explore compute, epochs, models, pricing, and source-aware read-only APIs.',icons:{icon:'/brand/favicon.svg'},robots:{index:true,follow:true}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#0b1118'};
const themeScript="try{const t=localStorage.getItem('gonkastats-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch{}";
export default function Layout({children}:{children:ReactNode}){return <html lang="en" data-theme="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeScript}}/></head><body><Shell models={[]}>{children}</Shell></body></html>;}
