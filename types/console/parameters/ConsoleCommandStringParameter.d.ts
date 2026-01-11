// Internal class & type imports
import type { ConsoleCommandBaseParameter } from "./ConsoleCommandBaseParameter";

/**
 * Defines a string parameter for console commands. String parameters accept text values and can optionally restrict
 * values to a predefined set or require them to match a regular expression pattern.
 * @see {@linkcode ConsoleCommandBaseParameter}
 */
export interface ConsoleCommandStringParameter extends ConsoleCommandBaseParameter {
	/**
	 * Optional list of acceptable values for the parameter. If provided, the parameter value must be one of these
	 * options. Can be a static array or a function that returns the options dynamically. Useful for parameters with a
	 * fixed set of choices.
	 */
	options?: string[] | (() => string[]);

	/**
	 * Optional regular expression pattern that the parameter value must match. If provided, the value is validated
	 * against this pattern during command execution. Useful for parameters requiring specific formats.
	 * @see {@linkcode RegExp}
	 */
	pattern?: RegExp;

	/** The data type of the parameter, fixed to `"string"`. Indicates that this parameter expects a string value. */
	type: "string";
}
