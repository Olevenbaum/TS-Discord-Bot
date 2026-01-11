// Class & type imports
import { ConsoleCommand, ConsoleCommandParameter, NestedArray } from "../../types";

// Data imports
import { configuration } from "#variables";

// External libraries imports
import {
	BoxOptions,
	BoxRenderable,
	InputRenderable,
	InputRenderableEvents,
	RenderContext,
	SelectOption,
	SelectRenderable,
	SelectRenderableEvents,
} from "@opentui/core";

// Internal class & tpe imports
import { ConsoleHandler } from "./ConsoleHandler";

// Module imports
import readFiles from "../../modules/fileReader";

/**
 * @see {@linkcode BoxRenderable}
 */
export class CommandInputRenderable extends BoxRenderable {
	/**
	 * @see {@linkcode ConsoleCommand}
	 */
	protected _commands: ConsoleCommand[] = [];

	/**
	 * The command input to enter console commands into
	 * @see {@linkcode InputRenderable}
	 */
	protected commandInput: InputRenderable;

	/**
	 * The autocomplete display to suggest console commands
	 * @see {@linkcode SelectRenderable}
	 */
	protected autocompleteInput: SelectRenderable;

	/**
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
			minWidth: 40,
			width: "40%",
		}).on(SelectRenderableEvents.ITEM_SELECTED, (selection) => {
			this.commandInput!.insertText(selection);
		});

		this.add(this.commandInput);
		this.add(this.autocompleteInput);

		this.updateCommands();
	}

	/**
	 * @see {@linkcode ConsoleCommand}
	 */
	public get commands(): ConsoleCommand[] {
		return this._commands;
	}

	/**
	 * Handles the command execution.
	 * @param input Raw string entered by the user
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
	 * Handles the input from the command line
	 * @param input Raw string entered by the user
	 * @returns The command and parameters extracted from the input, if any
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
	 * Transforms raw input into command name and parameters
	 * @param input Raw string entered by the user
	 * @returns The command name and parameters extracted from the input
	 * @see {@linkcode NestedArray}
	 */
	protected transformInput(input: string): [string, NestedArray<string | number | boolean>?] {
		input = input.trim();

		/** Command name without whitespace or parameters */
		const commandName = input.slice(0, input.includes(" ") ? input.indexOf(" ") : undefined).toUpperCase();

		return [commandName];
	}

	/**
	 * Tests whether a single parameter is valid according to provided parameter data
	 * @param parameter A single parameter entered by the user
	 * @param parameterData The data to compare the parameter against
	 * @returns Whether the parameter is valid
	 * @see {@linkcode ConsoleCommandParameter} | {@linkcode NestedArray}
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
	 * Tests whether given parameters are valid according to provided parameter data
	 * @param parameters The already transformed parameters entered by the user
	 * @param parameterData The data to compare the parameters against
	 * @returns Whether the parameters are valid
	 * @see {@linkcode ConsoleCommandParameter} | {@linkcode NestedArray}
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
	 * Transforms a string of parameters into a nested array of values
	 * @param parameters The string of parameters to transform
	 * @param parameterData The data of the parameters the console command takes to validate against
	 * @returns A nested array of values
	 * @see {@linkcode ConsoleCommandParameter} | {@linkcode NestedArray}
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

	/** Updates the loaded console commands from local files */
	public async updateCommands(): Promise<void> {
		this._commands = await readFiles<ConsoleCommand>(configuration.paths.consoleCommandsPath);
	}
}
