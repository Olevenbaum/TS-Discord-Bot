/** Builds a tuple of the given length filled with `unknown` type. */
export type LengthTuple<Length extends number, Tuple extends unknown[] = []> = Tuple["length"] extends Length
	? Tuple
	: LengthTuple<Length, [...Tuple, unknown]>;
