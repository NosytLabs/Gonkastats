import {apiDefinitions} from './api-definitions';
import {READ_FAILURE_STATUS} from './read-errors';
const stringHeader=(description:string,value?:string)=>({description,schema:{type:'string',...(value?{const:value}:{})}});
const publicHeaders={
 'Access-Control-Allow-Origin':stringHeader('Public reads without credentials','*'),
 'Access-Control-Expose-Headers':stringHeader('Headers visible to cross-origin clients','ETag, Retry-After'),
};
const errorDescriptions={400:'Invalid or unsupported parameter',404:'Resource or model not found',429:'Read budget reached; respect Retry-After',502:'Required upstream read or schema failed',503:'Source or optional integration unavailable'};
export function openapi(){
 const errorResponses=Object.fromEntries(Object.entries(errorDescriptions).map(([status,description])=>[status,{
  description,headers:{...publicHeaders,'Cache-Control':stringHeader('Errors are not cached','no-store'),...(status==='429'?{'Retry-After':stringHeader('Seconds before retry','60')}:{})},
  content:{'application/json':{schema:{$ref:'#/components/schemas/Error'}}},
 }]));
 return {openapi:'3.1.0',info:{title:'GonkaStats read-only API',version:'0.1.0',description:'Independent Gonka observations. Numeric ledger quantities use decimal strings. No signing, payments, private accounts or arbitrary upstream proxy.'},servers:[{url:'/api/v1'}],tags:[...new Set(apiDefinitions.map(d=>d.group))].map(name=>({name})),paths:Object.fromEntries(apiDefinitions.map(d=>{
  const conditional=d.id!=='openapi';
  const parameters=d.parameters.map(p=>({name:p.name,in:'query',required:p.required??false,description:p.description,schema:{type:p.type??'string',...(p.enum?{enum:p.enum}:{}),...(p.min!==undefined?{minimum:p.min}:{}),...(p.max!==undefined?{maximum:p.max}:{}),...(p.default!==undefined?{default:p.type==='integer'?Number(p.default):p.default}:{})}}));
  return ['/'+d.id,{
   get:{operationId:d.id.replaceAll('-','_'),tags:[d.group],summary:d.title,description:d.description+' '+d.cache,parameters:[...parameters,...(conditional?[{name:'If-None-Match',in:'header',required:false,description:'ETag from a previous successful response',schema:{type:'string'}}]:[])],responses:{
    200:{description:conditional?'Observed data and source provenance; partial coverage is explicit.':'This OpenAPI document.',headers:{...publicHeaders,...(conditional?{ETag:stringHeader('Validator for conditional reads')}:{})},content:{'application/json':{schema:conditional?{$ref:'#/components/schemas/Observation'}:{type:'object'}}}},
    ...(conditional?{304:{description:'Successful observation unchanged. No response body.',headers:{...publicHeaders,ETag:stringHeader('Validator for the unchanged observation')}}}:{}),...errorResponses,
   }},
   options:{operationId:'preflight_'+d.id.replaceAll('-','_'),tags:[d.group],summary:'Read-only CORS preflight',description:'No source reads or credentials. This is transport discovery, not an additional data endpoint.',responses:{204:{description:'Allowed public read methods and conditional-request header; no response body.',headers:{...publicHeaders,'Access-Control-Allow-Methods':stringHeader('Read-only methods','GET, HEAD, OPTIONS'),'Access-Control-Allow-Headers':stringHeader('Permitted browser request header','If-None-Match'),'Access-Control-Max-Age':stringHeader('Preflight lifetime in seconds','600'),'Cache-Control':stringHeader('No intermediary caching','no-store')}}}},
  }];
 })),components:{schemas:{
  Observation:{type:'object',properties:{data:{description:'Endpoint-specific payload. Null or empty values require inspection of source coverage.'},error:{type:'string',description:'Human-readable failure message; absent on success.'},meta:{$ref:'#/components/schemas/Metadata'}}},
  Error:{type:'object',required:['error'],properties:{error:{type:'string',description:'Human-readable message, not a status-code parser.'},data:{description:'Optional failure detail or health result with original provenance. Detail and epoch-comparison errors include errorCode.',type:'object',properties:{errorCode:{$ref:'#/components/schemas/ReadErrorCode'}}},meta:{$ref:'#/components/schemas/Metadata'}}},
  ReadErrorCode:{type:'string',enum:Object.keys(READ_FAILURE_STATUS)},
  Metadata:{type:'object',properties:{schemaVersion:{type:'string'},generatedAt:{type:'string',format:'date-time'},mode:{enum:['live','snapshot']},sources:{type:'array',items:{$ref:'#/components/schemas/Source'}},pagination:{type:'object',properties:{offset:{type:'integer'},limit:{type:'integer'},returned:{type:'integer'},retainedMatches:{type:'integer'}}}}},
  Source:{type:'object',required:['id','url','status','fetchedAt','scope','coverage'],properties:{id:{type:'string'},url:{type:'string',format:'uri'},status:{enum:['recent','stale','snapshot','unavailable']},fetchedAt:{type:'string',format:'date-time'},sourceTime:{type:['string','null']},scope:{enum:['chain','indexer','provider','estimate']},coverage:{type:'string'},error:{type:['string','null']}}},
 }}};
}
