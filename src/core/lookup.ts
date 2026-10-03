import {bech32Address} from './metrics';
export const MAX_EPOCH_ID=1_000_000;
/** Relative, curated source paths only. No input can select an origin. */
export function lookupPath(kind:string,id:string):string|null{
 if(kind==='blocks'&&/^\d{1,10}$/.test(id))return '/chain-rpc/block?height='+id;
 if(kind==='transactions'&&/^[a-fA-F0-9]{64}$/.test(id))return '/api/ch/tx/'+id;
 if(kind==='addresses'&&bech32Address(id))return '/chain-api/cosmos/bank/v1beta1/balances/'+id+'?pagination.limit=100';
 if(kind==='vesting'&&bech32Address(id))return '/chain-api/productscience/inference/streamvesting/vesting_schedule/'+id;
 if(kind==='history'&&bech32Address(id))return '/api/ch/address/'+id+'?limit=50';
 if(kind==='governance'&&/^\d{1,8}$/.test(id))return '/chain-api/cosmos/gov/v1/proposals/'+id;
 if(kind==='epochs'&&/^\d{1,7}$/.test(id)&&Number(id)>=1&&Number(id)<=MAX_EPOCH_ID)return '/v1/epochs/'+Number(id)+'/participants';
 return null;
}
