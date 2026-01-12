// Class & type imports
import type { ConsoleCommand, ConsoleCommandParameter, NestedArray } from "../../types";

// Data imports
import { configuration } from "#variables";

// External libraries imports
import {
	type BoxOptions,
	BoxRenderable,
	InputRenderable,
	InputRenderableEvents,
	KeyEvent,
	type RenderContext,
	type SelectOption,
	SelectRenderable,
	SelectRenderableEvents,
} from "@opentui/core";

// Internal class & tpe imports
import { ConsoleHandler } from "./ConsoleHandler";

// Module imports
import readFiles from "../../modules/fileReader";

/**
 * A renderable component that provides an interactive command-line interface for executing console commands. It
 * combines an input field for command entry with an autocomplete dropdown for command suggestions. This class handles
 * command parsing, parameter validation, and execution, integrating with the bot's console system.
 * @see {@linkcode BoxRenderable}
 */
export class CommandInputRenderable extends BoxRenderable {
	/**
	 * Collection of available console commands loaded from the file system. These commands can be executed through the
	 * command input interface.
	 * @see {@linkcode ConsoleCommand}
	 */
	protected _commands: ConsoleCommand[] = [];

	/**
	 * The input field where users enter console commands. Handles text input and command submission via Enter key.
	 * @see {@linkcode InputRenderable}
	 */
	protected commandInput: InputRenderable;

	/**
	 * The autocomplete dropdown that displays command suggestions based on user input. Shows matching commands and
	 * aliases as the user types.
	 * @see {@linkcode SelectRenderable}
	 */
	protected autocompleteInput: SelectRenderable;

	/**
	 * Creates a new command input renderable with the specified rendering context and options. Initializes the input
	 * field and autocomplete dropdown, sets up event handlers for command execution and autocomplete suggestions.
	 * @param ctx - The rendering context for the component.
	 * @param options - Optional configuration options for the box container.
	 * @see {@linkcode BoxOptions}
	 * @see {@linkcode RenderContext}
	 */
	constructor(ctx: RenderContext, options: BoxOptions = {}) {
		super(ctx, options);

		this.commandInput = new InputRenderable(ctx, {
			placeholder: "Enter command...",
			width: "60%",
		})
			.on(InputRenderableEvents.ENTER, (input: string) => {
				try {
					this.handleCommand(input);
					this.commandInput!.value = "";
				} catch (error) {
					if (this.parent instanceof ConsoleHandler) {
						this.parent.error(error);
					}
				}
			})
			.on(InputRenderableEvents.INPUT, (input: string) => {
				/** Options the user might choose from */
				const options: SelectOption[] = [];

				if (input.includes(" ")) {
					const transformedInput = this.handleInput(input);

					if (Array.isArray(transformedInput)) {
						const [command] = transformedInput;
						if (command.parameters) {
						}
					}
				} else {
					this._commands.forEach((command) => {
						if (command.name.startsWith(input.toUpperCase())) {
							options.push({
								name: command.name,
								description: command.description,
							});
						}

						if (command.aliases) {
							command.aliases.forEach((alias) => {
								if (alias.startsWith(input.toUpperCase())) {
									options.push({
										name: alias,
										description: command.description,
									});
								}
							});
						}
					});
				}

				this.autocompleteInput.options = options;
			});

		this.autocompleteInput = new SelectRenderable(ctx, {
			keyBindings: [
				{ name: "up", action: "move-up" },
				{ name: "down", action: "move-down" },
			],
			minWidth: 40,
			width: "40%",
		}).on(SelectRenderableEvents.ITEM_SELECTED, (selection) => {
			this.commandInput!.insertText(selection);
		});

		this.autocompleteInput.options = this._commands
			.map((command) => {
				/** Options of the autocomplete input based on every console command */
				const options: SelectOption[] = [];

				options.push({
					name: command.name,
					description: command.description,
				});

				if (command.aliases) {
					command.aliases.forEach((alias) => {
						options.push({
							name: alias,
							description: command.description,
						});
					});
				}

				return options;
			})
			.flat();

		this.add(this.commandInput);
		this.add(this.autocompleteInput);

		this.updateCommands();

		this.onKeyDown = (key: KeyEvent) => {
			if (key.name === "up") {
				this.autocompleteInput.selectedIndex += 1;
			} else if (key.name === "down") {
				this.autocompleteInput.selectedIndex -= 1;
			}
		};
	}

	/**
	 * Gets the current list of loaded console commands.
	 * @returns An array of available console commands.
	 * @see {@linkcode ConsoleCommand}
	 */
	public get commands(): ConsoleCommand[] {
		return this._commands;
	}

	/**
	 * Processes and executes a console command entered by the user. Parses the input, validates parameters, and ´
	 * invokes the appropriate command handler.
	 * @param input - The raw command string entered by the user.
	 */
	protected handleCommand(input: string): void {
		const transformedInput = this.handleInput(input) || [];

		if (Array.isArray(transformedInput)) {
			const [command, parameters] = transformedInput;
			command!.execute(parameters ? parameters : []);
		} else {
			const command = transformedInput;
			command.execute();
		}
	}

	/**
	 * Parses the user input to identify the command and extract parameters. Searches for matching commands by name or
	 * alias and returns the command with its parameters if found.
	 * @param input - The raw command string entered by the user.
	 * @returns The matched command, or a tuple of command and parameters, or undefined if no match.
	 * @see {@linkcode ConsoleCommand}
	 * @see {@linkcode NestedArray}
	 */
	protected handleInput(
		input: string,
	): ConsoleCommand | [ConsoleCommand, NestedArray<string | number | boolean>?] | void {
		const [commandName, parameters] = this.transformInput(input);

		/** Command that was called */
		const command = this._commands.find(
			(consoleCommand) =>
				consoleCommand.name === commandName ||
				(consoleCommand.aliases && consoleCommand.aliases.some((alias) => alias === commandName)),
		);

		if (command) {
			if (parameters) {
				return [command, parameters];
			}

			return command;
		}
	}

	/**
	 * Parses the raw input string to extract the command name and prepare for parameter processing. Converts the
	 * command name to uppercase for case-insensitive matching.
	 * @param input - The raw command string entered by the user.
	 * @returns A tuple containing the uppercase command name and optionally parsed parameters.
	 * @see {@linkcode NestedArray}
	 */
	protected transformInput(input: string): [string, NestedArray<string | number | boolean>?] {
		input = input.trim();

		/** Command name without whitespace or parameters */
		const commandName = input.slice(0, input.includes(" ") ? input.indexOf(" ") : undefined).toUpperCase();

		return [commandName];
	}

	/**
	 * Validates a single parameter against its expected type and constraints. Checks type compatibility, range limits
	 * for numbers, and pattern matching for strings and arrays.
	 * @param parameter - The parameter value to validate.
	 * @param parameterData - The parameter definition containing validation rules.
	 * @returns `true` if the parameter is valid according to the definition, `false` otherwise.
	 * @see {@linkcode ConsoleCommandParameter}
	 * @see {@linkcode NestedArray}
	 */
	protected testParameter(
		parameter: boolean | number | string | NestedArray<boolean | number | string>,
		parameterData: ConsoleCommandParameter,
	): boolean {
		if (parameterData.type !== "object" && typeof parameter !== parameterData.type) {
			return false;
		}

		switch (parameterData.type) {
			case "boolean":
				break;

			case "number":
				if (
					parameterData.range &&
					((parameter as number) < parameterData.range[0] || (parameter as number) > parameterData.range[1])
				) {
					return false;
				}

				break;

			case "object":
				if (!Array.isArray(parameter)) {
					parameter = [parameter];
				}

				if (parameterData.options && typeof parameterData.options === "function") {
					parameterData.options = parameterData.options();
				}

				if (
					(parameterData.options &&
						parameterData.options.length > 0 &&
						!(parameter as string[]).every((item) => (parameterData.options as string[]).includes(item))) ||
					(parameterData.pattern &&
						!(parameter as string[]).every((item) => parameterData.pattern!.test(item)))
				) {
					return false;
				}

				break;

			case "string":
				if (parameterData.options && typeof parameterData.options === "function") {
					parameterData.options = parameterData.options();
				}

				if (
					(parameterData.options &&
						parameterData.options.length > 0 &&
						!parameterData.options.includes(parameter as string)) ||
					(parameterData.pattern && !(parameter as string).match(parameterData.pattern))
				) {
					return false;
				}

				break;

			default:
				return false;
		}

		return true;
	}

	/**
	 * Validates a set of parameters against their expected structure and types. Handles both simple parameter arrays
	 * and complex nested parameter definitions.
	 * @param parameters - The transformed parameters to validate.
	 * @param parameterData - The parameter definition(s) to validate against.
	 * @returns True if all parameters are valid, false otherwise.
	 * @see {@linkcode ConsoleCommandParameter}
	 * @see {@linkcode NestedArray}
	 */
	protected testParameters(
		parameters: NestedArray<boolean | number | string>,
		parameterData: ConsoleCommandParameter | NestedArray<ConsoleCommandParameter>,
	): boolean {
		if (Array.isArray(parameterData)) {
			return parameters.slice(undefined, parameterData.length - 1).every((parameter, index) => {
				if (Array.isArray(parameterData[index])) {
					return parameterData[index].some((singleParameterData) =>
						this.testParameter(parameter, singleParameterData as ConsoleCommandParameter),
					);
				}

				return this.testParameter(parameter, parameterData[index] as ConsoleCommandParameter);
			}) && Array.isArray(parameterData[parameterData.length - 1])
				? (parameterData[parameterData.length - 1] as NestedArray<ConsoleCommandParameter>).some(
						(singleparameterData) =>
							this.testParameter(
								parameters.slice(parameterData.length - 1),
								singleparameterData as ConsoleCommandParameter,
							),
				  )
				: this.testParameter(
						parameters.slice(parameterData.length - 1),
						parameterData[parameterData.length - 1] as ConsoleCommandParameter,
				  );
		}

		if (parameters.length > 1) {
			return this.testParameter(parameters, parameterData);
		}

		return this.testParameter(parameters[0] as boolean | number | string, parameterData);
	}

	/**
	 * Parses a string of parameters into a properly typed nested array structure. Handles quoted strings, arrays,
	 * booleans, numbers, and validates against parameter definitions if provided.
	 * @param parameters - The raw parameter string to parse.
	 * @param parameterData - Optional parameter definitions for validation during parsing.
	 * @returns A nested array of parsed and validated parameter values.
	 * @throws {TypeError} If parameters are invalid or malformed.
	 * @see {@linkcode ConsoleCommandParameter}
	 * @see {@linkcode NestedArray}
	 */
	protected transformParameters(
		parameters: string,
		parameterData?: ConsoleCommandParameter | NestedArray<ConsoleCommandParameter>,
	): NestedArray<boolean | number | string> {
		parameters = parameters.trim();

		/** Transformed parameters with correct types and validation */
		const transformedParameters: NestedArray<boolean | number | string> = [];

		for (var counter = 0; counter < parameters.length; ) {
			if ([" ", ","].includes(parameters[counter]!)) {
				counter++;

				continue;
			}

			if (['"', "'", "`"].includes(parameters[counter]!)) {
				/** Position of the next quotation mark of the same type */
				const parameterEnd = parameters.indexOf(parameters[counter]!, counter + 1);

				if (parameterEnd < 0) {
					throw TypeError("Invalid parameters");
				}

				transformedParameters.push(parameters.slice(counter + 1, parameterEnd));

				counter = parameterEnd + 1;
			} else {
				/** Position of the next blank space or comma */
				const nextSeperator = parameters.slice(counter).search(/[\s,]/) + counter;

				/** End of the current parameter */
				const parameterEnd = nextSeperator >= counter ? nextSeperator : parameters.length;

				/** Current parameter */
				const parameter = parameters.slice(counter, parameterEnd).trim();

				if (["true", "false"].includes(parameter.toLowerCase())) {
					transformedParameters.push(Boolean(parameter.toLowerCase()));
				} else if (parameter.startsWith("[") && parameter.endsWith("]")) {
					transformedParameters.push(this.transformParameters(parameter));
				} else if (/^-?\d*([\.\,]?\d+)?$/.test(parameter)) {
					transformedParameters.push(Number(parameter));
				} else {
					transformedParameters.push(parameter);
				}

				counter = parameterEnd + 1;
			}
		}

		if (parameterData && !this.testParameters(transformedParameters, parameterData)) {
			throw TypeError("Invalid parameters");
		}

		return transformedParameters;
	}

	/**
	 * Reloads the console commands from the file system. Updates the internal command list with the latest commands
	 * available in the configured console commands directory.
	 * @returns A promise that resolves when commands have been updated.
	 */
	public async updateCommands(): Promise<void> {
		this._commands = await readFiles<ConsoleCommand>(configuration.paths.consoleCommandsPath);
	}
}
