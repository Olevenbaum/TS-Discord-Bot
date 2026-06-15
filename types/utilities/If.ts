/**
 * A conditional type helper. When `Ready` is `true`, the public property type becomes the fully initialized variant.
 */
export type If<Condition extends boolean, TrueResult, FalseResult = undefined> = Condition extends true
	? TrueResult
	: FalseResult;
