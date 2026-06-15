// Class & type imports
import { Decrement } from "./Decrement";

/**
 * Nested array with either infinite depth or a specified maximum depth.
 * @see {@linkcode Array}
 * @see {@linkcode Decrement}
 */
export type NestedArray<Type, Depth extends number | undefined = undefined> = Depth extends undefined
	? Array<Type | NestedArray<Type>>
	: Depth extends 0
		? Type
		: Array<Type | NestedArray<Type, Decrement<Extract<Depth, number>>>>;
