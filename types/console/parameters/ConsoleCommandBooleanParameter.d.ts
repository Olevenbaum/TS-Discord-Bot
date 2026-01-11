// Internal class & type imports
import type { ConsoleCommandBaseParameter } from "./ConsoleCommandBaseParameter";

/**
 * Defines a boolean parameter for console commands. Boolean parameters accept `true` / `false` values and are parsed
 * from strings like `"true"`, `"false"`, `"1"`, `"0"`, etc. This parameter type has no additional validation beyond
 * type checking.
 * @see {@linkcode ConsoleCommandBaseParameter}
 */
export interface ConsoleCommandBooleanParameter extends ConsoleCommandBaseParameter {
	/** The data type of the parameter, fixed to `"boolean"`. Indicates that this parameter expects a boolean value. */
	type: "boolean";
}
