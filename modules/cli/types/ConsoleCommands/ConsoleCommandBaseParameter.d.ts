/**
 * Base interface for all console command parameters. This provides the common properties shared by all parameter types,
 * including metadata and type information used for validation and help text. All specific parameter types extend this
 * interface.
 */
export interface ConsoleCommandBaseParameter {
	/** A human-readable description of what this parameter represents. Used in help text and command documentation. */
	description: string;

	/** The display name of the parameter. Used for identification in error messages and help text. */
	name: string;

	/**
	 * Whether this parameter must be provided when executing the command. If true, the command will fail validation if
	 * this parameter is missing. Defaults to `false` (optional).
	 */
	required?: boolean;

	/**
	 * The data type of the parameter value. Determines how the parameter is parsed and validated during command
	 * execution.
	 */
	type: "boolean" | "number" | "string" | "object";
}
