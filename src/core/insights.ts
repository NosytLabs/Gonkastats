import type {Snapshot, Participant, Source, Model} from './types';

// These helpers use already-observed sources. They do not perform network I/O.
export function hasObservation(s: Snapshot, id: string): boolean {
  return s.sources.some(source => source.id === id && source.status !== 'unavailable');
}
export function compareAmounts(a: string, b: string): number {
  if (!/^\d{1,80}(\.\d{1,40})?$/.test(a) || !/^\d{1,80}(\.\d{1,40})?$/.test(b)) throw new Error('Invalid nonnegative decimal');
  const [ai, af = ''] = a.split('.'), [bi, bf = ''] = b.split('.');
  const scale = Math.max(af.length, bf.length);
  const x = BigInt(ai + af.padEnd(scale, '0')), y = BigInt(bi + bf.padEnd(scale, '0'));
  return x < y ? -1 : x > y ? 1 : 0;
}
export function percentage(part: string, whole: string): string | null {
  const p = BigInt(part), total = BigInt(whole);
  if (p < 0n || total <= 0n) return null;
  const hundredths = (p * 10000n + total / 2n) / total;
  return `${hundredths / 100n}.${String(hundredths % 100n).padStart(2, '0')}`;
}
export function isSourceFresh(source: Source, now = Date.now()): boolean {
  if (source.error !== null || source.status === 'unavailable' || source.status === 'stale') return false;
  const observed = Date.parse(source.sourceTime ?? source.fetchedAt), fetched = Date.parse(source.fetchedAt);
  return [observed, fetched, now, source.ttl].every(Number.isFinite) && source.ttl >= 0 &&
    observed <= now + 60000 && fetched <= now + 60000 && now - observed <= source.ttl * 1000 && now - fetched <= source.ttl * 1000;
}
export function concentration(members: Participant[]) {
  const ordered = [...members].sort((a, b) => compareAmounts(b.weight, a.weight));
  const total = ordered.reduce((v, member) => v + BigInt(member.weight), 0n);
  let cumulative = 0n;
  return ordered.map((member, index) => {
    cumulative += BigInt(member.weight);
    return {rank: index + 1, address: member.address, weight: member.weight,
      share: percentage(member.weight, total.toString()), cumulativeShare: percentage(cumulative.toString(), total.toString())};
  });
}
export function overviewFacts(s: Snapshot) {
  const members = hasObservation(s, 'participants'), models = hasObservation(s, 'models'), hardware = hasObservation(s, 'hardware');
  const allNodesKnown = s.participants.every(p => p.nodes !== null);
  const weights = members ? concentration(s.participants) : [];
  return {
    members: members ? s.participants.length : null,
    notExcluded: members ? s.participants.filter(p => !p.excluded).length : null,
    excluded: members ? s.participants.filter(p => p.excluded).length : null,
    weight: members ? s.participants.reduce((v, p) => v + BigInt(p.weight), 0n).toString() : null,
    nodes: members && allNodesKnown ? s.participants.reduce((v, p) => v + (p.nodes ?? 0), 0) : null,
    gpus: hardware ? s.hardware.reduce((v, h) => v + BigInt(h.count), 0n).toString() : null,
    models: models ? s.models.length : null,
    topFiveShare: weights.length ? weights[Math.min(4, weights.length - 1)].cumulativeShare : null,
    tools: models && hasObservation(s, 'capabilities') ? s.models.filter(m => m.tools === true).length : null,
    usableSources: s.sources.filter(source => source.status !== 'unavailable').length,
  };
}
export function modelFootprint(s: Snapshot, excludeFlagged = false) {
  const members = hasObservation(s, 'participants') ? s.participants.filter(p => !excludeFlagged || !p.excluded) : null;
  return s.models.map(model => ({model: model.id, name: model.name, slug: model.slug,
    count: members === null ? null : members.filter(member => member.models.includes(model.id)).length,
    denominator: members?.length ?? null}));
}
export type ModelFilters = {q: string; capability: string; sort: string; view: string; compare: string[]};
export function readModelFilters(params: URLSearchParams, catalog?: readonly Pick<Model, 'slug'>[]): ModelFilters {
  const known = catalog ? new Set(catalog.map(model => model.slug)) : null;
  return {q: (params.get('q') ?? '').slice(0, 120),
    capability: ['tools', 'reasoning', 'long-context'].includes(params.get('capability') ?? '') ? params.get('capability')! : 'all',
    sort: ['context', 'price'].includes(params.get('sort') ?? '') ? params.get('sort')! : 'name',
    view: params.get('view') === 'table' ? 'table' : 'cards',
    compare: [...new Set(params.getAll('compare'))].filter(value => /^(?:[0-9a-f]{2}){1,250}$/.test(value) && (known === null || known.has(value))).slice(0, 3)};
}
export function filterModels(models: Model[], filters: ModelFilters) {
  return models.filter(m => `${m.id} ${m.name}`.toLowerCase().includes(filters.q.trim().toLowerCase()))
    .filter(m => filters.capability === 'all' || filters.capability === 'tools' && m.tools === true ||
      filters.capability === 'reasoning' && m.reasoning === true || filters.capability === 'long-context' && m.context !== null && m.context >= 128000)
    .sort((a, b) => {
      if (filters.sort === 'context') return (b.context ?? -1) - (a.context ?? -1) || a.name.localeCompare(b.name);
      if (filters.sort === 'price') {if (a.price === null) return b.price === null ? 0 : 1; if (b.price === null) return -1; return compareAmounts(a.price, b.price);}
      return a.name.localeCompare(b.name);
    });
}

export function compareCells(a: string | number | null, b: string | number | null, descending = false): number {
  // Keep absent values last in both directions. Decimal strings stay exact.
  if (a === null) return b === null ? 0 : 1;
  if (b === null) return -1;
  const x = String(a), y = String(b);
  const numeric = /^-?\d{1,80}(\.\d{1,40})?$/;
  let comparison: number;
  if (numeric.test(x) && numeric.test(y)) {
    const an = x.startsWith('-'), bn = y.startsWith('-');
    comparison = an !== bn ? an ? -1 : 1 : compareAmounts(an ? x.slice(1) : x, bn ? y.slice(1) : y) * (an ? -1 : 1);
  } else comparison = x.localeCompare(y, undefined, {numeric: true});
  return comparison * (descending ? -1 : 1);
}
