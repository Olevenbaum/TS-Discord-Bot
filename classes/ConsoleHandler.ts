// Class & type imports
import type { ConsoleCommand, ConsoleCommandParameterData } from "../types/consoleCommands";
import type { NestedArray } from "../types";
import { VerticalSplitBoxRenderable } from "../extensions/VerticalSplitBox";
import { LogRenderable } from "../extensions/LogRenderable";

// Data imports
import { client } from "#application";
import { configuration } from "#variables";

// External libraries imports
import {
	BoxRenderable,
	CliRenderer,
	InputRenderable,
	InputRenderableEvents,
	RGBA,
	type SelectOption,
	SelectRenderable,
	SelectRenderableEvents,
} from "@opentui/core";
import { color, type ColorInput } from "bun";
import { Colors } from "discord.js";

// Module imports
import readFiles from "../modules/fileReader";

/**
 * Handles console commands via a CLI interface
 */
export class ConsoleHandler {
	/**
	 * Color of focused children
	 * @see {@linkcode ColorInput}
	 */
	protected _focusColor: ColorInput | "auto";

	/**
	 * The default color focused children have if no other color was chosen
	 * @see {@linkcode ColorInput}
	 */
	protected defaultFocusColor: ColorInput = Colors.LuminousVividPink;

	/**
	 * A select renderable to suggest commands and parameters based on the input
	 * @see {@linkcode SelectRenderable}
	 */
	protected autocompleteInput?: SelectRenderable;

	/**
	 * The command input
	 * @see {@linkcode InputRenderable}
	 */
	protected commandInput?: InputRenderable;

	/**
	 * Commands loaded from local files that can be started via the command input
	 * @see {@linkcode ConsoleCommand}
	 */
	protected commands: ConsoleCommand[];

	/** Whether each log messages timestamp includes the current date */
	protected includeDate: boolean;

	/**
	 * Area for all log messages to be displayed
	 * @see {@linkcode LogRenderable}
	 */
	protected logs?: LogRenderable;

	/**
	 * CLI Renderer
	 * @see {@linkcode CliRenderer}
	 */
	protected renderer?: CliRenderer;

	/**
	 * The top level box splitted into command and log sections
	 * @see {@linkcode VerticalSplitBoxRenderable}
	 */
	protected splitBox?: VerticalSplitBoxRenderable;

	/**
	 * Creates a new console handler
	 * @param focusColor - A color for the borders of focused elements. "auto" selects the accent color of the Discord
	 * bot
	 * @param includeDate - Whether to print the current date in front of every log message
	 * @see {@link ColorInput}
	 */
	constructor(focusColor: ColorInput | "auto" = "auto", includeDate: boolean = false) {
		this._focusColor = color(focusColor, "HEX") ?? "auto";
		this.includeDate = includeDate;

		this.commands = [];
		this.updateCommands();
	}

	/**
	 * The color the border of both the command and log boxes switch to on focus
	 * @see {@linkcode ColorInput}
	 */
	get focusColor(): ColorInput {
		return this._focusColor;
	}

	/**
	 * The color the border of both the command and log boxes switch to on focus
	 * @see {@linkcode ColorInput}
	 */
	set focusColor(focusColor: ColorInput | "auto") {
		this._focusColor = color(focusColor, "HEX") ?? "auto";

		if (this._focusColor === "auto") {
			if (client.isReady()) {
				client.user.fetch();
				this._focusColor = client.user.accentColor
					? color(client.user.accentColor, "HEX")!
					: this.defaultFocusColor;
			} else {
				this._focusColor = this.defaultFocusColor;
			}
		}

		this.splitBox!.focusColor = focusColor;
	}

	/** Prints a debug message to the log box */
	public debug(...messages: any[]): void {
		this.logs?.debug(...messages);
	}

	/** Destroys the CLI renderer and closes the console handler */
	public destroy(): void {
		this.renderer?.destroy();
	}

	/** Prints an error message to the log box */
	public error(...messages: any[]): void {
		this.logs?.error(...messages);
	}

	/**
	 * Handles the command execution
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
	 * @see {@linkcode ConsoleCommand} | @see {@linkcode NestedArray}
	 */
	protected handleInput(
		input: string,
	): ConsoleCommand | [ConsoleCommand, NestedArray<string | number | boolean>?] | void {
		const [commandName, parameters] = this.transformInput(input);

		/** Command that was called */
		const command = this.commands.find(
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

	/** Prints an informational message to the log box */
	public info(...messages: any[]): void {
		this.logs?.info(...messages);
	}

	/**
	 * Initializes the console handler. Child components / boxes are created.
	 * @param renderer The CLI renderer from {@link https://github.com/sst/opentui | opentui}
	 */
	public initialize(ctx: CliRenderer): void {
		this.renderer = ctx;

		/** Container for the command input area */
		const commandBox = new BoxRenderable(this.renderer, {
			flexDirection: "row",
			height: "20%",
			minHeight: 4,
			title: "Commands",
		});

		/** Container for the log output area */
		const logBox = new BoxRenderable(this.renderer, {
			flexGrow: 1,
			title: "Logs",
		});

		this.commandInput = new InputRenderable(this.renderer, {
			flexGrow: 1,
			placeholder: "Enter command...",
		})
			.on(InputRenderableEvents.ENTER, (input: string) => {
				try {
					this.handleCommand(input);
					this.commandInput!.value = "";
				} catch (error) {}
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
					this.commands.forEach((command) => {
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

				this.autocompleteInput!.options = options;
			});

		this.autocompleteInput = new SelectRenderable(this.renderer, {
			flexGrow: 0,
			minWidth: 40,
		}).on(SelectRenderableEvents.ITEM_SELECTED, (selection) => {
			this.commandInput!.insertText(selection);
		});

		this.logs = new LogRenderable(this.renderer, this.includeDate, {});

		commandBox.add(this.commandInput);
		commandBox.add(this.autocompleteInput);
		logBox.add(this.logs);

		this.splitBox = new VerticalSplitBoxRenderable(this.renderer, undefined, [commandBox, logBox], {
			border: true,
			borderStyle: "rounded",
			focusedBorderColor: RGBA.fromHex(
				this._focusColor === "auto" ? color(this.defaultFocusColor, "HEX")! : (this._focusColor as string),
			),
			onMouseOut() {
				this.borderColor = this._defaultOptions.borderColor;
				this.getChildren()[0]!.blur();
			},
			onMouseOver() {
				this.borderColor = this.focusedBorderColor;
				this.getChildren()[0]!.focus();
			},
		});

		this.renderer.root.add(this.splitBox);
	}

	/** Prints a message of success to the log box */
	public success(...messages: any[]): void {
		this.logs?.success(...messages);
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
	 * @see {@linkcode ConsoleCommandParameterData} | {@linkcode NestedArray}
	 */
	protected testParameter(
		parameter: boolean | number | string | NestedArray<boolean | number | string>,
		parameterData: ConsoleCommandParameterData,
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
	 * @see {@linkcode ConsoleCommandParameterData} | {@linkcode NestedArray}
	 */
	protected testParameters(
		parameters: NestedArray<boolean | number | string>,
		parameterData: ConsoleCommandParameterData | NestedArray<ConsoleCommandParameterData>,
	): boolean {
		if (Array.isArray(parameterData)) {
			return parameters.slice(undefined, parameterData.length - 1).every((parameter, index) => {
				if (Array.isArray(parameterData[index])) {
					return parameterData[index].some((singleParameterData) =>
						this.testParameter(parameter, singleParameterData as ConsoleCommandParameterData),
					);
				}

				return this.testParameter(parameter, parameterData[index] as ConsoleCommandParameterData);
			}) && Array.isArray(parameterData[parameterData.length - 1])
				? (parameterData[parameterData.length - 1] as NestedArray<ConsoleCommandParameterData>).some(
						(singleparameterData) =>
							this.testParameter(
								parameters.slice(parameterData.length - 1),
								singleparameterData as ConsoleCommandParameterData,
							),
				  )
				: this.testParameter(
						parameters.slice(parameterData.length - 1),
						parameterData[parameterData.length - 1] as ConsoleCommandParameterData,
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
	 * @see {@linkcode ConsoleCommandParameterData} | {@linkcode NestedArray}
	 */
	protected transformParameters(
		parameters: string,
		parameterData?: ConsoleCommandParameterData | NestedArray<ConsoleCommandParameterData>,
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
	async updateCommands(): Promise<void> {
		this.commands = await readFiles<ConsoleCommand>(configuration.paths.consoleCommandsPath);
	}

	/** Prints awarning to the log box */
	public warn(...messages: any[]): void {
		this.logs?.warn(...messages);
	}
}
