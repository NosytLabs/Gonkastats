/** Machine semantics are independent of human-readable error text. */
export const READ_FAILURE_STATUS={
 'invalid-request':400,'rate-limited':429,'not-found':404,'unavailable':503,'upstream-failed':502,
} as const;
export type ReadErrorCode=keyof typeof READ_FAILURE_STATUS;
export class SourceReadError extends Error{
 constructor(public readonly code:ReadErrorCode,message:string){super(message);this.name='SourceReadError';}
}
export const readErrorCode=(error:unknown):ReadErrorCode=>error instanceof SourceReadError?error.code:'upstream-failed';
export const readFailureStatus=(code:ReadErrorCode|undefined):number=>READ_FAILURE_STATUS[code??'upstream-failed'];
