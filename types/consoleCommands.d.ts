// Internal type imports
import { NestedArray } from "./";

// Type imports
import { Client } from "discord.js";

/** Commands for usage in the console */
interface ConsoleCommand {
	/** List of aliases for the command */
	aliases?: string[];

	/** The description of the command */
	description: string;

	/** The name of the command */
	name: string;

	/**
	 * Parameter data for the command
	 * @see {@linkcode ConsoleCommandParameterData}
	 */
	parameters?: ConsoleCommandParameterData | ConsoleCommandParameterData[] | ConsoleCommandParameterData[][];

	/**
	 * The function that should be called on the commands call
	 * @param parameters The parameters that were passed to the command
	 * @see {@linkcode Client} | {@linkcode NestedArray}
	 */
	execute(...parameters: NestedArray<boolean | number | string>): void;
}

/** Array parameter data of a console command */
interface ConsoleCommandArrayParameter extends ConsoleCommandBaseParameter {
	/**
	 * Given (possible) options for the parameter.
	 * If changing options depending on the situation might be provided, a function returning the options can be used.
	 */
	options?: string[] | (() => string[]);

	/** A pattern all elements of the parameter must match */
	pattern?: RegExp;

	/** Type of the parameter */
	type: "object";
}

interface ConsoleCommandBaseParameter {
	/** Description of the parameter */
	description: string;

	/** Name of the parameter */
	name: string;

	/** Whether the parameter is required */
	required?: boolean;

	/** Type of the parameter */
	type: "boolean" | "number" | "string" | "object";
}

/** Boolean parameter data of a console command */
interface ConsoleCommandBooleanParameter extends ConsoleCommandBaseParameter {
	/** Type of the parameter */
	type: "boolean";
}

/** Number parameter data of a console command */
interface ConsoleCommandNumberParameter extends ConsoleCommandBaseParameter {
	/** Possible range of the number parameter */
	range?: [number, number];

	/** Type of the parameter */
	type: "number";
}

/**
 * Parameter data of a console command
 * @see {@linkcode ConsoleCommandArrayParameter} | {@linkcode ConsoleCommandBooleanParameter} |
 * {@linkcode ConsoleCommandNumberParameter} | {@linkcode ConsoleCommandStringParameter}
 */
type ConsoleCommandParameterData =
	| ConsoleCommandArrayParameter
	| ConsoleCommandBooleanParameter
	| ConsoleCommandNumberParameter
	| ConsoleCommandStringParameter;

/** String parameter data of a console command */
interface ConsoleCommandStringParameter extends ConsoleCommandBaseParameter {
	/**
	 * Given (possible) options for the parameter.
	 * If changing options depending on the situation might be provided, a function returning the options can be used.
	 */
	options?: string[] | (() => string[]);

	/** A pattern the parameter must match */
	pattern?: RegExp;

	/** Type of the parameter */
	type: "string";
}
