// Internal class & type imports
import type { ConsoleCommandBaseParameter } from "./ConsoleCommandBaseParameter";

/**
 * Defines an array parameter for console commands. Array parameters accept multiple values as an array and can
 * optionally restrict the values to a predefined set or require them to match a regular expression pattern. Arrays are
 * parsed from bracketed syntax like `"[item1, item2, item3]"`.
 * @see {@linkcode ConsoleCommandBaseParameter}
 */
export interface ConsoleCommandArrayParameter extends ConsoleCommandBaseParameter {
	/**
	 * Optional list of acceptable values for array elements. If provided, each element in the array must be one of
	 * these options. Can be a static array or a function that returns the options dynamically. Useful for parameters
	 * requiring multiple choices from a fixed set.
	 */
	options?: string[] | (() => string[]);

	/**
	 * Optional regular expression pattern that each array element must match. If provided, all elements are validated
	 * against this pattern during command execution. Useful for arrays requiring specific element formats.
	 * @see {@linkcode RegExp}
	 */
	pattern?: RegExp;

	/**
	 * The data type of the parameter, fixed to `"object"`. Indicates that this parameter expects an array (object)
	 * value.
	 */
	type: "object";
}
