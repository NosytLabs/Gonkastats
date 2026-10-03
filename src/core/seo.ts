import type {Metadata} from 'next';
import type {Model} from './types';
import {idFromSlug} from './metrics';

type PageInfo = {title:string;description:string;index?:boolean};
const pages:Record<string,PageInfo>={
  '/':{title:'The Gonka Observatory',description:'Explore source-qualified Gonka network activity, registered compute, model metadata and community tools from an independent observatory.'},
  '/network':{title:'Network',description:'Inspect Gonka epoch membership, declared weights and current protocol model sets with source scopes and collection times.'},
  '/protocol':{title:'Protocol radar',description:'Read current Gonka parameters, governance model registrations, PoC model sets and reported software versions with their sources.'},
  '/participants':{title:'Participants',description:'Explore declared Gonka epoch participants, weights, model support and marked exclusions without confusing them with current consensus power.'},
  '/epochs':{title:'Epochs',description:'Inspect the latest observed Gonka epoch and documented stage boundaries, with explicit limits on retained historical observations.'},
  '/inference':{title:'Inference',description:'Inspect available source-reported Gonka inference statistics and their coverage. Blockchain transactions are not substituted for inference requests.'},
  '/models':{title:'Model explorer',description:'Filter and compare Gonka provider model catalogs, reported context and output limits, tool support and advertised pricing.'},
  '/providers':{title:'Provider layers',description:'Compare Gonka provider roles, public model metadata and billing boundaries while keeping managed providers and self-hosted analytics distinct.'},
  '/providers/openbroker':{title:'OpenBroker provider',description:'Explore OpenBroker public model discovery and documented GNK billing, estimated usage and settlement boundaries. Private account analytics are not connected.'},
  '/providers/proxy':{title:'Proxy by gonka.gg provider',description:'Inspect Proxy model capability and pricing metadata with separate source timestamps, context limits and clear provider-only scope.'},
  '/providers/feather':{title:'Feather analytics infrastructure',description:'Understand self-hosted Feather chain RPC and analytics, its separate API namespace and the infrastructure that is not provisioned by GonkaStats.'},
  '/addresses':{title:'Public address lookup',description:'Inspect a public Gonka account through validated read-only lookups. No wallet connection, ownership attribution or private account access is implied.',index:false},
  '/markets':{title:'Markets',description:'Inspect source-qualified wrapped GNK market observations separately from native supply, settled costs and provider conversion references.'},
  '/tokenomics':{title:'Tokenomics',description:'Read observed Gonka issued native supply and module counters with exact units and explicit circulating-supply limitations.'},
  '/rewards':{title:'Rewards',description:'Explore documented Gonka reward accounting and source-reported counters without treating them as independently verified revenue.'},
  '/treasury':{title:'Treasury',description:'Inspect the observed Gonka distribution community pool separately from other ecosystem funds and private treasury balances.'},
  '/vesting':{title:'Vesting',description:'Read Gonka vesting data boundaries and available public evidence without inventing an unconnected vesting schedule.'},
  '/devshards':{title:'DevShards',description:'Explore documented Gonka DevShard versions and available source evidence without claiming unobserved developer payouts.'},
  '/bridge':{title:'Bridge',description:'Understand native GNK and wrapped representations with clear source boundaries. GonkaStats does not execute bridge transactions.'},
  '/governance':{title:'Governance',description:'Inspect the returned Gonka governance proposal window and statuses with transparent coverage instead of assumed full-history counts.'},
  '/blocks':{title:'Blocks',description:'Explore recently retained indexed Gonka block records, exact gas values and explicit gaps in the observed sample.'},
  '/transactions':{title:'Transactions',description:'Look up public Gonka transaction evidence through curated read operations. This observatory cannot sign or broadcast transactions.'},
  '/pulse':{title:'Pulse reading room',description:'Browse attributed Gonka ecosystem reading material and source links without fabricated sentiment or licensed feed ingestion.'},
  '/agents':{title:'Agent Workbench',description:'Explore imported Gonka RPC definitions with source attribution. Write and broadcast definitions remain documentation-only.'},
  '/cost-lab':{title:'Cost Lab',description:'Plan advertised USD and GNK cost scenarios with exact decimal arithmetic, explicit retry assumptions and excluded fees.'},
  '/epoch-diff':{title:'Epoch Diff',description:'Compare declared membership and weights from two Gonka epoch responses with exact differences and explicit live-lookup limitations.'},
  '/signals':{title:'Signal Desk',description:'Inspect deterministic Gonka observations with supporting evidence and source freshness rather than generated market predictions.'},
  '/sources':{title:'Sources',description:'Review GonkaStats public source coverage, observation times, staleness, errors and the application surfaces that depend on each source.'},
  '/developers':{title:'Developers & API Reference',description:'Explore GonkaStats read-only REST definitions, bounded parameters, provenance, working examples and the shared OpenAPI reference.'},
  '/methodology':{title:'Methodology',description:'Understand GonkaStats measurement scopes, exact numeric units, data gaps and the distinctions between chain, provider and indexer observations.'},
  '/changelog':{title:'Changelog',description:'Read the GonkaStats application change history and implementation boundaries. A source release does not establish a public deployment.'},
  '/intelligence':{title:'Intelligence',index:false,description:'Review available Gonka evidence and analytics boundaries without claiming hosted AI analysis or unconfigured private integrations.'},
  '/account':{title:'Account integrations',description:'Review unconfigured private account integration boundaries. GonkaStats public analytics do not connect a wallet or expose provider account data.',index:false},
  '/account/usage':{title:'Account usage — not configured',description:'Private provider account usage is not connected. Public GonkaStats observations are kept separate from account analytics.',index:false},
  '/activity':{title:'Activity Lab',description:'Understand Gonka indexed block activity with exact sample totals, transparent gaps and downloadable records.'},
  '/workload':{title:'Context budget planner',description:'Compare an assumed prompt and output reserve with reported model context and output limits. This is metadata planning, not tokenization.'},
  '/learn':{title:'Gonka field guide',description:'Understand Gonka epochs, model capabilities, compute, provider pricing and settlement in plain language.'},
  '/hardware':{title:'Hardware',description:'Inspect epoch-matched GPU registrations and their declared scope. Registered hardware is not an independent physical inventory audit.'},
  '/ecosystem':{title:'Ecosystem',description:'Explore Gonka community projects and documented integrations with clear attribution and operational-status limitations.'},
  '/watchlist':{title:'Watchlist',description:'Keep a browser-local watchlist of public Gonka addresses. Saved addresses remain in your browser and no wallet connection is required.',index:false},
  '/about':{title:'About',description:'Learn about the independent GonkaStats community observatory by Nosyt Labs, its sources and its operating boundaries.'},
  '/privacy':{title:'Privacy',description:'Review how GonkaStats handles public observations, browser-local preferences and optional server-side history without private wallet access.'},
};

export function siteOrigin():string {
  const url=new URL(process.env.SITE_URL||'http://localhost:3000');
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw new Error('SITE_URL must be an HTTP(S) origin without credentials, a path or query');
  return url.origin;
}

export interface MetadataContext {model?:Pick<Model,'id'|'name'|'slug'>|null}

/** Accept a local route, never a host-controlled canonical URL. */
export function canonicalPath(path:string):string {
  if(!path.startsWith('/')||path.startsWith('//')||/[\\\u0000-\u001f]/.test(path))throw new Error('Metadata requires a local route path');
  const url=new URL(path,siteOrigin());
  if(url.origin!==siteOrigin())throw new Error('Metadata route must stay on SITE_URL');
  return url.pathname==='/'?'/':url.pathname.replace(/\/+$/,'');
}

export function pageMetadata(path:string,context:MetadataContext={}):Metadata {
  const canonical=canonicalPath(path),segments=canonical.split('/').filter(Boolean);
  const section=segments.length?'/'+segments[0]:'/',base=pages[canonical]??pages[section];
  if(!base)return {robots:{index:false,follow:true}};
  const detail=segments.length>1&&!pages[canonical];
  let title=base.title,description=base.description,index=base.index!==false&&!detail;
  if(detail&&section==='/models'){
    let id:string|null=null;try{id=idFromSlug(segments[1]);}catch{}
    const model=context.model;
    if(segments.length===2&&model&&model.id===id&&model.slug===segments[1]){
      title=model.name+' — model details';
      description='Explore '+model.id+' with separately sourced provider availability, reported limits and advertised pricing. Metadata is not a quality or performance benchmark.';
      index=true;
    }else{
      title='Model unavailable';
      description='This model is not confirmed in the current provider observation. Return to the model explorer for the available catalog and source coverage.';
    }
  }else if(detail){
    title=base.title+' — '+segments.slice(1).join('/');
    description=base.description+' Public lookup: '+segments.slice(1).join('/')+'.';
  }
  const url=new URL(canonical,siteOrigin()).href,socialTitle=title+' | GonkaStats';
  return {title,description,alternates:{canonical:url},robots:{index,follow:true},
    openGraph:{type:'website',siteName:'GonkaStats',title:socialTitle,description,url},
    twitter:{card:'summary',title:socialTitle,description}};
}

export function sitemapUrls():string[] {
  return Object.entries(pages).filter(([,info])=>info.index!==false).map(([path])=>new URL(path,siteOrigin()).href);
}

/** Native script payload: never let a value terminate the JSON-LD element. */
export function serializeJsonLd(value:unknown):string {
  return JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
}

export function siteStructuredData(){
  const origin=siteOrigin();
  return {'@context':'https://schema.org','@graph':[
    {'@type':'Organization','@id':origin+'/#publisher',name:'Nosyt Labs',url:'https://github.com/NosytLabs'},
    {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'GonkaStats',inLanguage:'en',description:'Independent, source-qualified Gonka community analytics by Nosyt Labs.',publisher:{'@id':origin+'/#publisher'}},
  ]};
}
