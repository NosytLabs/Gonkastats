import Decimal from 'decimal.js';
const Exact=Decimal.clone({precision:70});
export interface CostInput {prompt:string;completion:string;requests:string;attempts:string;}
export interface CostRates {tokenPrice:string|null;providerPrice:string|null;fx:string|null;}
export interface CostResult {tokens:string;advertisedUsd:string|null;singleAttemptGnk:string|null;retryScenarioGnk:string|null;retryScenarioUsd:string|null;assumptions:CostInput;}
function whole(value:string,name:string){if(!/^\d{1,16}$/.test(value))throw new Error(name+' must be a nonnegative whole number');const n=new Exact(value);if(n.gt('1000000000000000'))throw new Error(name+' exceeds 10^15');return n;}
function rate(value:string|null){if(value===null)return null;const n=new Exact(value);if(!n.isFinite()||n.lt(0)||n.gt('1000000000000000000'))throw new Error('Invalid source rate');return n;}
export function simulateCost(input:CostInput,rates:CostRates):CostResult{
 const prompt=whole(input.prompt,'Prompt tokens'),completion=whole(input.completion,'Completion tokens'),requests=whole(input.requests,'Requests');
 if(!/^\d+(\.\d{1,6})?$/.test(input.attempts))throw new Error('Attempts must be a decimal between 1 and 3');const attempts=new Exact(input.attempts);if(attempts.lt(1)||attempts.gt(3))throw new Error('Attempts must be between 1 and 3');
 const tokens=prompt.plus(completion).mul(requests),tokenPrice=rate(rates.tokenPrice),providerPrice=rate(rates.providerPrice),fx=rate(rates.fx);
 const single=tokenPrice===null?null:tokens.mul(tokenPrice).div(1e9),retry=single?.mul(attempts)??null;
 return {tokens:tokens.toFixed(),advertisedUsd:providerPrice===null?null:tokens.div(1e6).mul(providerPrice).toFixed(),singleAttemptGnk:single?.toFixed()??null,retryScenarioGnk:retry?.toFixed()??null,retryScenarioUsd:retry===null||fx===null?null:retry.mul(fx).toFixed(),assumptions:{...input}};
}
