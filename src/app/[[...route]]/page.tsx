import {notFound} from 'next/navigation';
import {getSnapshot,detail} from '@/core/service';
import {history} from '@/db/store';
import {bech32Address} from '@/core/metrics';
import {Overview} from '@/features/overview';
import {NetworkView,ParticipantsView,EpochsView,InferenceView} from '@/features/network';
import {ModelsView,Providers,Markets,Economics,Governance,AccountView} from '@/features/ecosystem';
import {Agents,CostLab,EpochDiffView} from '@/features/tools';
import {ChatConsole} from '@/features/chat';
import {Sources,Signals,Pulse,Documentation} from '@/features/platform';
import {ProtocolRadar} from '@/features/protocol';
import {ProviderDirectory} from '@/features/providers';
import {Explorer} from '@/features/explorer';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const allowed=new Set(['','network','protocol','participants','epochs','inference','models','providers','brokers','proxy','markets','tokenomics','rewards','treasury','vesting','devshards','bridge','governance','blocks','transactions','addresses','pulse','media','agents','chat','cost-lab','epoch-diff','signals','sources','status','developers','methodology','changelog','intelligence','account']);
export async function generateMetadata({params}:{params:Promise<{route?:string[]}>}){const r=(await params).route??[];return {title:r.length?r[0].replaceAll('-',' ').replace(/^./,s=>s.toUpperCase()):'The Gonka Observatory'};}
export default async function Page({params}:{params:Promise<{route?:string[]}>}){const routes=(await params).route??[],section=routes[0]??'',id=routes[1];if(routes.length>2||!allowed.has(section))notFound();if(id){const detailKinds=['models','participants','epochs','providers','brokers','governance','blocks','transactions','addresses'];if(!detailKinds.includes(section))notFound();if(['participants','addresses'].includes(section)&&!bech32Address(id))notFound();if(['epochs','governance','blocks'].includes(section)&&!/^\d{1,10}$/.test(id))notFound();if(section==='transactions'&&!/^[a-fA-F0-9]{64}$/.test(id))notFound();if(section==='models'&&!/^(?:[0-9a-f]{2}){1,250}$/.test(id))notFound();if(['providers','brokers'].includes(section)&&!['openbroker','proxy','feather'].includes(id))notFound();}
const s=await getSnapshot();const getHistory=async()=>{try{return await history();}catch{return [];}};
switch(section){case '':return <Overview s={s}/>;case 'network':return <NetworkView s={s} points={await getHistory()}/>;case 'protocol':return <ProtocolRadar s={s}/>;case 'participants':return <ParticipantsView s={s} address={id}/>;case 'epochs':return <EpochsView s={s} id={id} detail={id&&id!==String(s.epoch?.id)?await detail('epochs',id):null}/>;case 'inference':return <InferenceView s={s}/>;case 'models':return <ModelsView s={s} slug={id}/>;case 'providers':case 'brokers':return <ProviderDirectory s={s} id={id}/>;case 'proxy':return <ProviderDirectory s={s} id="proxy"/>;case 'markets':return <Markets s={s} points={await getHistory()}/>;case 'tokenomics':case 'rewards':case 'treasury':case 'vesting':case 'devshards':case 'bridge':return <Economics s={s} section={section}/>;case 'governance':return <Governance s={s} id={id} detail={id?await detail('governance',id):null}/>;case 'blocks':case 'transactions':return <Explorer s={s} kind={section} id={id} detail={id?await detail(section,id):null}/>;case 'addresses':if(!id)notFound();return <AccountView s={s} id={id} detail={await detail('addresses',id)}/>;case 'pulse':case 'media':return <Pulse s={s}/>;case 'agents':return <Agents s={s}/>;case 'chat':return <ChatConsole s={s}/>;case 'cost-lab':return <CostLab s={s}/>;case 'epoch-diff':return <EpochDiffView s={s}/>;case 'signals':return <Signals s={s}/>;case 'sources':case 'status':return <Sources s={s}/>;default:return <Documentation s={s} section={section}/>;}}
