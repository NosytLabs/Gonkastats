import type {Block, Model, HistoryPoint} from './types';

/** Exact, bounded summaries of returned indexed records. Missing heights are not zero-transaction blocks. */
export function activityData(blocks: Block[], limit = 30) {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 60) throw new Error('Select 1–60 indexed records');
  const seen = new Set<number>();
  for (const b of blocks) {
    if (!Number.isSafeInteger(b.height) || b.height < 1 || seen.has(b.height)) throw new Error('Invalid or duplicate block height');
    if (!Number.isSafeInteger(b.transactions) || b.transactions < 0 || !/^\d{1,80}$/.test(b.gas)) throw new Error('Invalid block count');
    if (!Number.isFinite(Date.parse(b.time))) throw new Error('Invalid block timestamp');
    seen.add(b.height);
  }
  const selected = [...blocks].sort((a, b) => b.height - a.height).slice(0, limit).reverse();
  let transactions = 0n, gas = 0n;
  const rows = selected.map(b => {transactions += BigInt(b.transactions); gas += BigInt(b.gas); return {...b, cumulativeTransactions: transactions.toString()};});
  const first = rows[0]?.time ?? null, last = rows.at(-1)?.time ?? null;
  const buckets = [{label:'0 transactions',min:0,max:0},{label:'1–9 transactions',min:1,max:9},{label:'10–99 transactions',min:10,max:99},{label:'100+ transactions',min:100,max:Infinity}];
  return {rows, transactions:transactions.toString(), gas:gas.toString(), first, last,
    missingHeights:rows.length ? rows.at(-1)!.height - rows[0].height + 1 - rows.length : 0,
    spanSeconds: first && last ? Math.max(0,(Date.parse(last)-Date.parse(first))/1000) : 0,
    histogram:buckets.map(b=>({label:b.label,value:rows.filter(row=>row.transactions>=b.min&&row.transactions<=b.max).length}))};
}

/** Refresh each source's fields independently. A failed catalog read must not relabel old prices as freshly observed. */
export function reconcileModels(previous:Model[],current:Model[],observed:{capabilities:boolean;pricing:boolean}):Model[] {
  const retained = new Map(previous.map(m=>[m.id,m]));
  return current.map(m=>{const old=retained.get(m.id);if(!old)return m;
    return {...m,
      ...(!observed.capabilities?{context:old.context,output:old.output,vram:old.vram,tools:old.tools,reasoning:old.reasoning,hfRepo:old.hfRepo,hfCommit:old.hfCommit}:{}),
      ...(!observed.pricing?{price:old.price,ngonka:old.ngonka}:{})};
  });
}

/** Null gap markers break the line; they never fabricate metric values. Fifteen minutes is the disclosed tolerance. */
export function historyWithGaps(points:HistoryPoint[]):HistoryPoint[] {
  if(points.some(p=>!Number.isFinite(Date.parse(p.at))))throw new Error('Invalid history timestamp');
  const ordered=[...points].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
  const rows:HistoryPoint[]=[];
  for(const point of ordered){const last=rows.at(-1);if(last&&Date.parse(point.at)-Date.parse(last.at)>15*60*1000){rows.push({gap:true,at:new Date(Date.parse(last.at)+1).toISOString(),weight:null,price:null,participants:null});}rows.push(point);}
  return rows;
}
