'use client';
import {compositionData} from '@/core/workload';
import type {Snapshot} from '@/core/types';
import {ComparisonBars} from './insight-charts';
import {Panel, Proof, More, Empty} from './ui';

export function MemberStatusChart({s}: {s: Snapshot}) {
  const membership = compositionData(s).membership;
  return <Panel title="Membership is not the same as eligibility" description="Two disjoint groups in the returned epoch membership" action={<More href="/participants">Inspect members</More>} footer={<Proof snapshot={s} ids={['participants']}/>}>
    {membership ? <><ComparisonBars label="Membership status" unit="members" source={s.sources.find(source => source.id === 'participants')}
      rows={[{label: 'Not marked excluded', value: membership.notMarkedExcluded}, {label: 'Marked excluded', value: membership.markedExcluded}]}/>
      <p className="chart-explainer">These add up to <strong>{membership.total} declared members</strong>. “Not marked excluded” does not prove uptime, service availability, independent ownership, or current voting eligibility.</p></> : <Empty>Membership data is unavailable; neither category is assumed to be zero.</Empty>}
  </Panel>;
}
export function GovernanceChart({s}: {s: Snapshot}) {
  const governance = compositionData(s).governance;
  return <Panel title="What happened to recent proposals?" description="Status counts in the returned proposal window—not all-time voting results" action={<More href="/governance">Proposals</More>} footer={<Proof snapshot={s} ids={['governance']}/>}>
    {governance ? <><ComparisonBars label="Proposal statuses" unit="proposals" source={s.sources.find(source => source.id === 'governance')}
      rows={governance.states.map(state => ({label: state.status.replaceAll('_', ' ').toLowerCase(), value: state.count}))} basis={`${governance.returned} returned records; not full history`}/>
      <p className="chart-explainer">Each proposal is counted once by its source-reported status. Passing a proposal is not independent evidence that its requested change has been executed.</p></> : <Empty>Proposal data is unavailable. No governance counts are invented.</Empty>}
  </Panel>;
}
