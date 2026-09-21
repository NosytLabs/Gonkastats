import type {Model, Snapshot} from './types';

export interface ContextPlan {
  id: string; name: string; slug: string;
  prompt: string; completion: string; total: string;
  contextLimit: number | null; outputLimit: number | null;
  remaining: string | null; usedPercent: number | null;
  status: 'within-reported-limits' | 'exceeds-reported-limit' | 'limits-incomplete';
  contextExceeded: boolean; outputExceeded: boolean;
}
const limit = (value: number | null): number | null =>
  value !== null && Number.isSafeInteger(value) && value > 0 ? value : null;
function tokenCount(value: string): bigint {
  if (!/^\d{1,10}$/.test(value) || BigInt(value) > 1000000000n) {
    throw new Error('Use whole-token counts from 0 to 1,000,000,000.');
  }
  return BigInt(value);
}
/** A comparison against reported metadata, not a tokenizer or admission check. */
export function contextPlan(models: Model[], prompt: string, completion: string): ContextPlan[] {
  const input = tokenCount(prompt), output = tokenCount(completion), total = input + output;
  return models.map(model => {
    const contextLimit = limit(model.context), outputLimit = limit(model.output);
    const contextExceeded = contextLimit !== null && total > BigInt(contextLimit);
    const outputExceeded = outputLimit !== null && output > BigInt(outputLimit);
    return {id: model.id, name: model.name, slug: model.slug, prompt: input.toString(),
      completion: output.toString(), total: total.toString(), contextLimit, outputLimit,
      remaining: contextLimit === null ? null : (BigInt(contextLimit) - total).toString(),
      usedPercent: contextLimit === null ? null : Number(total * 10000n / BigInt(contextLimit)) / 100,
      status: contextExceeded || outputExceeded ? 'exceeds-reported-limit' :
        contextLimit === null || outputLimit === null ? 'limits-incomplete' : 'within-reported-limits',
      contextExceeded, outputExceeded};
  });
}

// One reconciliation implementation serves collection and both test suites.
export {reconcileModels} from './audit';

export function compositionData(s: Snapshot) {
  const observed = (id: string) => s.sources.some(source => source.id === id && source.status !== 'unavailable');
  const membersKnown = observed('participants');
  const membership = membersKnown ? {total: s.participants.length,
    notMarkedExcluded: s.participants.filter(member => !member.excluded).length,
    markedExcluded: s.participants.filter(member => member.excluded).length} : null;
  const modelSupport = observed('models') ? s.models.map(model => {
    const members = membersKnown ? s.participants.filter(member => member.models.includes(model.id)) : null;
    return {id: model.id, name: model.name, slug: model.slug, members: members?.length ?? null,
      notMarkedExcluded: members?.filter(member => !member.excluded).length ?? null,
      markedExcluded: members?.filter(member => member.excluded).length ?? null,
      weight: members ? members.reduce((total, member) => total + BigInt(member.weight), 0n).toString() : null};
  }) : [];
  const counts = new Map<string, number>();
  if (observed('governance')) for (const proposal of s.proposals) counts.set(proposal.status, (counts.get(proposal.status) ?? 0) + 1);
  return {epoch: s.epoch?.id ?? null, membership, modelSupport,
    governance: observed('governance') ? {returned: s.proposals.length,
      states: [...counts].map(([status, count]) => ({status, count})).sort((a, b) => b.count - a.count)} : null,
    coverage: 'Returned epoch members and latest returned proposal window only. Model memberships overlap; do not sum across models. Not uptime, votes, revenue, or AI usage.',
    sourceIds: ['participants', 'models', 'governance']};
}
