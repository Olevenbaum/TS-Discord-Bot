// Class & type imports
import { LengthTuple } from "./LengthTuple";

/**
 * Numeric decrement helper for literal number types.
 * @see {@linkcode LengthTuple}
 */
export type Decrement<Number extends number> =
	LengthTuple<Number> extends [unknown, ...infer Rest] ? Rest["length"] : never;
