/** Canonical route aliases retained for links from community integrations. */
export function canonicalSection(section:string):string {
  return ({address:'addresses',token:'tokenomics'} as Record<string,string>)[section] ?? section;
}
/** Copyable shell command: ampersands must not become shell operators. */
export function curlCommand(origin:string,path:string):string {
  const base=new URL(origin);
  if(!['https:','http:'].includes(base.protocol)||base.username||base.password||base.origin!==origin||!path.startsWith('/api/v1/'))throw new Error('Expected a site origin and local API path');
  const url=new URL(path,base);
  if(url.origin!==base.origin)throw new Error('Cross-origin example is not allowed');
  return "curl --fail-with-body --silent --show-error '"+url.href.replace(/'/g,"'\\''")+"'";
}
export function observationLabel(at:string):string {
  const time=Date.parse(at);
  return Number.isFinite(time)?new Date(time).toISOString().slice(0,19).replace('T',' ')+' UTC':'Unknown observation time';
}
