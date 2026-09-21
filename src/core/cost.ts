export interface CostInput {prompt:string;completion:string;requests:string;attempts:string;}
export interface CostRates {tokenPrice:string|null;providerPrice:string|null;fx:string|null;}
export interface CostResult {tokens:string;advertisedUsd:string|null;singleAttemptGnk:string|null;retryScenarioGnk:string|null;retryScenarioUsd:string|null;assumptions:CostInput;}
export function simulateCost(_input:CostInput,_rates:CostRates):CostResult {throw new Error('Not implemented');}
