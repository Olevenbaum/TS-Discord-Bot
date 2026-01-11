// Internal class & type imports
import type { ConsoleCommandBaseParameter } from "./ConsoleCommandBaseParameter";

/**
 * Defines a numeric parameter for console commands. Number parameters accept numeric values and can optionally enforce
 * a value range. Values are parsed from strings and validated to ensure they fall within acceptable bounds.
 * @see {@linkcode ConsoleCommandBaseParameter}
 */
export interface ConsoleCommandNumberParameter extends ConsoleCommandBaseParameter {
	/**
	 * Optional range constraint for the numeric value. If provided, the parameter value must be `>= range[0]` and `<=
	 * range[1]`. Useful for parameters that require values within specific bounds.
	 */
	range?: [number, number];

	/** The data type of the parameter, fixed to `"number"`. Indicates that this parameter expects a numeric value. */
	type: "number";
}
