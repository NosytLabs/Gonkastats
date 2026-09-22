import Decimal from 'decimal.js';
import {parse} from 'lossless-json';
Decimal.set({precision:50});
export const ngnk=(value:string):string=>new Decimal(value).div(1e9).toFixed();
export function ratio(a:string,b:string):string|null {const d=new Decimal(b);return d.isZero()?null:new Decimal(a).div(d).toFixed();}
export function exponentDecimal(v:{value:string;exponent:number}):string {if(!Number.isSafeInteger(v.exponent)||Math.abs(v.exponent)>100)throw new Error('Invalid exponent');return new Decimal(v.value).mul(new Decimal(10).pow(v.exponent)).toFixed();}
export function midpoint(bid:string,ask:string):string|null {const b=new Decimal(bid),a=new Decimal(ask);return b.lte(0)||a.lt(b)?null:b.plus(a).div(2).toFixed();}
export const parseExact=(text:string):unknown=>parse(text,undefined,(value:string)=>value);
export function slugFor(id:string):string {return Array.from(new TextEncoder().encode(id),x=>x.toString(16).padStart(2,'0')).join('');}
export function idFromSlug(slug:string):string {if(!/^(?:[0-9a-f]{2}){1,250}$/.test(slug))throw new Error('Invalid model ID');return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(slug.match(/../g)!,s=>parseInt(s,16)));}
export function csvCell(value:unknown):string {let s=value==null?'':String(value);if(/^\s*[=+@-]/.test(s)||/^[\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
export function csv(rows:Record<string,unknown>[]):string {if(!rows.length)return '';const keys=[...new Set(rows.flatMap(Object.keys))];return [keys.map(csvCell).join(','),...rows.map(r=>keys.map(k=>csvCell(r[k])).join(','))].join('\r\n');}
export const sum=(values:string[]):string=>values.reduce((a,b)=>a.plus(b),new Decimal(0)).toFixed();
export function number(value:unknown):number|null {if(value===null||value===undefined||value==='')return null;const n=Number(value);return Number.isFinite(n)&&Math.abs(n)<=Number.MAX_SAFE_INTEGER?n:null;}
export function format(value:unknown,kind:'compact'|'number'|'usd'|'percent'='compact'):string {if(value===null||value===undefined||value==='')return '—';const n=number(value);if(n===null)return String(value);if(kind==='usd')return n>0&&n<0.01?'$'+new Decimal(String(value)).toPrecision(5):new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:n<1?4:2}).format(n);if(kind==='percent')return n.toFixed(2)+'%';return new Intl.NumberFormat('en-US',{notation:kind==='compact'?'compact':'standard',maximumFractionDigits:kind==='compact'?2:4}).format(n);}
export const shorten=(s:string,n=6)=>s.length>n*2+4?s.slice(0,n+2)+'…'+s.slice(-n):s;
export const modelName=(s:string)=>s.split('/').at(-1)??s;
export function sourceAge(sourceTime:string|null,fetchedAt:string,now=Date.now()):number {const t=Date.parse(sourceTime??fetchedAt);return Number.isFinite(t)?Math.max(0,now-t):Infinity;}
export function bech32Address(value:string):boolean {if(!/^gonka1[023456789acdefghjklmnpqrstuvwxyz]{38}$/.test(value))return false;const chars='qpzry9x8gf2tvdw0s3jn54khce6mua7l',hrp='gonka';const words=[...hrp].map(c=>c.charCodeAt(0)>>5).concat([0],[...hrp].map(c=>c.charCodeAt(0)&31),[...value.slice(6)].map(c=>chars.indexOf(c)));let chk=1;const g=[0x3b6a57b2,0x26508e6d,0x1ea119fa,0x3d4233dd,0x2a1462b3];for(const v of words){const top=chk>>>25;chk=((chk&0x1ffffff)<<5)^v;for(let i=0;i<5;i++)if((top>>>i)&1)chk^=g[i];}return chk===1;}
export function elapsedPerBlock(blocks:{height:number;time:string}[]):number|null {if(blocks.length<2)return null;const a=blocks[0],b=blocks[blocks.length-1],heights=a.height-b.height;const seconds=(Date.parse(a.time)-Date.parse(b.time))/1000;return heights>0&&seconds>0?seconds/heights:null;}
