// Internal class & type imports
import type { ConsoleCommandArrayParameter } from "./ConsoleCommandArrayParameter";
import type { ConsoleCommandBooleanParameter } from "./ConsoleCommandBooleanParameter";
import type { ConsoleCommandNumberParameter } from "./ConsoleCommandNumberParameter";
import type { ConsoleCommandStringParameter } from "./ConsoleCommandStringParameter";

/**
 * Union type representing all possible parameter types for console commands. Console command parameters define the
 * structure and validation rules for arguments passed to commands executed from the terminal. Each parameter type
 * provides specific validation and parsing behavior.
 * @see {@linkcode ConsoleCommandArrayParameter}
 * @see {@linkcode ConsoleCommandBooleanParameter}
 * @see {@linkcode ConsoleCommandNumberParameter}
 * @see {@linkcode ConsoleCommandStringParameter}
 */
export type ConsoleCommandParameter =
	| ConsoleCommandArrayParameter
	| ConsoleCommandBooleanParameter
	| ConsoleCommandNumberParameter
	| ConsoleCommandStringParameter;
