'use client';
import {useState} from 'react';
import Link from 'next/link';
import {BookOpen, ArrowUpRight, Download} from 'lucide-react';
import {contextPlan, type ContextPlan} from '@/core/workload';
import {hasObservation} from '@/core/insights';
import {format, csv} from '@/core/metrics';
import type {Snapshot} from '@/core/types';
import {Panel, Proof, Badge, Empty, CopyButton, download} from '@/components/ui';
import {PageHeading, ObservationBar} from './shared';
const labels = {'within-reported-limits': 'Within reported limits', 'exceeds-reported-limit': 'Exceeds a reported limit', 'limits-incomplete': 'Limits incomplete'};
export function ContextPlanner({s, initialPrompt = '8000', initialCompletion = '2000'}: {s: Snapshot; initialPrompt?: string; initialCompletion?: string}) {
  const [prompt, setPrompt] = useState(initialPrompt), [completion, setCompletion] = useState(initialCompletion);
  let plans: ContextPlan[] = [], error = '';
  try {plans = contextPlan(s.models, prompt, completion);} catch (e) {error = e instanceof Error ? e.message : 'Invalid token counts';}
  const comparisonPath = '/workload?' + new URLSearchParams({prompt, completion}).toString();
  return <div className="observatory-v2"><PageHeading eyebrow="GONKASTATS / WORKLOAD PLANNER" title="Will your request fit?" description="Budget the input and the answer together. Compare against reported model limits before you spend anything." snapshot={s}/><ObservationBar s={s}/>
    <Panel title="Build a context budget" description="This is a metadata comparison, not a tokenizer or a paid inference test." footer={<Proof snapshot={s} ids={['models', 'capabilities']}/>}>
      <div className="workload-presets" aria-label="Context scenarios">{[['Chat', '4000', '1000'], ['Document review', '32000', '4000'], ['Large document set', '150000', '8000']].map(([name, input, output]) => <button key={name} className="button compact" onClick={() => {setPrompt(input); setCompletion(output);}}>{name}</button>)}</div>
      <div className="form-grid"><label>Prompt tokens, including overhead<input inputMode="numeric" value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={10}/></label><label>Output tokens to reserve<input inputMode="numeric" value={completion} onChange={e => setCompletion(e.target.value)} maxLength={10}/></label></div>
      <p className="chart-explainer">Include the system prompt, message history, tool schemas, retrieved text and other prompt overhead in your input estimate. There is no universal words-to-tokens conversion. Check the provider’s rules for reasoning tokens and model-specific counting.</p>
      {error ? <p role="alert" className="warning-text">{error}</p> : <div className="context-budget-summary"><span data-testid="context-total"><strong>{format(plans[0]?.total ?? (BigInt(prompt) + BigInt(completion)).toString(), 'number')}</strong> assumed tokens in one request</span><CopyButton text={comparisonPath} label="Copy workload path"/></div>}
    </Panel>
    {!hasObservation(s, 'models') ? <Empty title="The catalog is unavailable">A working catalog is needed to compare model limits.</Empty> : !error && <section className="planner-grid" aria-label="Context budget comparisons">{plans.map(plan => {
      const promptWidth = plan.contextLimit === null ? 0 : Math.min(100, Number(plan.prompt) / plan.contextLimit * 100);
      const outputWidth = plan.contextLimit === null ? 0 : Math.min(100 - promptWidth, Number(plan.completion) / plan.contextLimit * 100);
      return <article className="planner-card" key={plan.id} data-testid="context-card"><header><Link href={'/models/' + plan.slug}>{plan.name}<ArrowUpRight size={14}/></Link><Badge tone={plan.status === 'within-reported-limits' ? 'green' : plan.status === 'exceeds-reported-limit' ? 'amber' : 'muted'}>{labels[plan.status]}</Badge></header>
        <figure aria-label={plan.name + ' context budget'}><div className="budget-value"><strong>{plan.usedPercent === null ? '—' : plan.usedPercent.toLocaleString('en-US', {maximumFractionDigits:2}) + '%'}</strong><span>of the reported context window</span></div>
          <svg viewBox="0 0 400 20" preserveAspectRatio="none" width="100%" height="20" aria-hidden="true"><rect width="400" height="20" rx="4" fill="var(--border)"/><rect width={promptWidth * 4} height="20" fill="var(--accent)"/><rect x={promptWidth * 4} width={outputWidth * 4} height="20" fill="var(--blue)"/></svg>
          <figcaption>Input {format(plan.prompt)} · Output reserve {format(plan.completion)} · Bar capped at 100%</figcaption>
        </figure>
        <dl className="model-specs"><div><dt>Reported context limit</dt><dd>{format(plan.contextLimit, 'number')}</dd></div><div><dt>Reported output cap</dt><dd>{plan.outputLimit === null ? 'Unknown' : format(plan.outputLimit, 'number')}</dd></div><div><dt>{plan.remaining !== null && BigInt(plan.remaining) < 0n ? 'Over context by' : 'Remaining context'}</dt><dd>{plan.remaining === null ? 'Unknown' : format(BigInt(plan.remaining) < 0n ? (-BigInt(plan.remaining)).toString() : plan.remaining, 'number')}</dd></div></dl>
        <p className="chart-explainer">{plan.outputExceeded ? 'Your requested output exceeds the separately reported output cap. ' : ''}{plan.contextExceeded ? 'The combined input and output reserve exceed reported context. ' : ''}{plan.status === 'limits-incomplete' ? 'At least one limit is unknown; this is not a confirmed fit.' : plan.status === 'within-reported-limits' ? 'Fits these reported limits. Provider acceptance, model availability and answer quality are not guaranteed.' : 'Reduce the workload or review another model’s reported limits.'}</p>
      </article>;
    })}</section>}
    {!error && plans.length > 0 && <div className="planner-actions"><button className="button" onClick={() => download('gonka-context-plan.csv', csv(plans.map(plan => ({...plan, unit:'tokens', catalog:s.sources.find(source => source.id === 'models')?.url, limits_source:s.sources.find(source => source.id === 'capabilities')?.url, limits_as_of:s.sources.find(source => source.id === 'capabilities')?.sourceTime, limits_fetched_at:s.sources.find(source => source.id === 'capabilities')?.fetchedAt}))), 'text/csv')}><Download size={14}/> Export context comparison</button><Link className="button primary" href="/cost-lab">Then estimate the cost <ArrowUpRight size={14}/></Link></div>}
    <div className="reader-note"><BookOpen size={18}/><div><strong>Catalog and specifications come from different providers.</strong> OpenBroker supplies availability; Proxy supplies limits. This comparison does not claim OpenBroker enforces identical limits.</div><Link href="/learn#models">Read the guide <ArrowUpRight size={14}/></Link></div>
  </div>;
}
