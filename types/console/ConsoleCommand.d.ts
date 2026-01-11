// Class & type imports
import type { NestedArray } from "../others";

// Internal class & type imports
import type { ConsoleCommandParameter } from "./parameters";

/**
 * Represents a console command that can be executed from the terminal interface. Console commands are loaded from files
 * and provide a way to interact with the bot through a command-line interface, with built-in parameter validation.
 */
export interface ConsoleCommand {
	/**
	 * Optional list of alternative names (aliases) for the command. These can be used interchangeably with the primary
	 * {@linkcode name}.
	 */
	aliases?: string[];

	/** A human-readable description of what the command does. This is displayed in command help and suggestions. */
	description: string;

	/**
	 * The primary name of the command, used to invoke it from the terminal. Command names are case-insensitive and
	 * should be unique.
	 */
	name: string;

	/**
	 * Defines the parameters this command accepts. Parameters are validated upon execution, and the command will fail
	 * if invalid parameters are provided. Can be a single parameter, an array of parameters (for ordered arguments),
	 * or a nested array (for complex parameter structures).
	 * @see {@linkcode ConsoleCommandParameter}
	 */
	parameters?: ConsoleCommandParameter | ConsoleCommandParameter[] | ConsoleCommandParameter[][];

	/**
	 * The execution function for the command. This method is called when the command is invoked from the terminal,
	 * after parameter validation has passed.
	 * @param parameters - The validated and transformed parameters passed to the command. Parameters are provided as a
	 * nested array structure matching the command's parameter definition.
	 * @see {@linkcode NestedArray}
	 */
	execute(...parameters: NestedArray<boolean | number | string>): void;
}
