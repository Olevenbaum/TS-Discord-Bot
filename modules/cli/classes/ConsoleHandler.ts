// Class & type imports
import type { ConsoleCommand, ConsoleCommandParameter, If, NestedArray } from "#types";

// Data imports
import { configuration } from "#variables";

// External libraries imports
import {
	blue,
	BoxRenderable,
	brightRed,
	CliRenderer,
	createCliRenderer,
	green,
	red,
	SelectRenderable,
	StyledText,
	white,
	yellow,
} from "@opentui/core";
import { Collection } from "discord.js";
import { appendFile, existsSync, mkdirSync } from "fs";
import type { Path } from "typescript";

// Internal module imports
import { ButtonGroupRenderable } from "./ButtonGroupRenderable";
import { ButtonRenderable } from "./ButtonRenderable";
import { CLIView } from "./CLIView";
import type { BlankWindow, Window } from "../types";

// Module imports
import { readFiles, relativePath } from "#modules/fileReader";
import { LogType } from "#modules/notification";
import getTime from "#modules/time";

/**
 * A lightweight CLI handler with a ready-state contract similar to Discord.js. Once every internal UI property is
 * initialized, the handler becomes ready and TypeScript knows the public properties are no longer optional.
 */
export class ConsoleHandler<Ready extends boolean = boolean> {
	/**
	 * Whether the CLI is ready for use
	 * @see {@linkcode Ready}
	 */
	private ready: Ready;

	/**
	 * Commands to use in the CLI. Can be used to interact with the bot.
	 * @see {@linkcode ConsoleCommand}
	 */
	protected _commands: ConsoleCommand[] = [];

	/**
	 * The logs of the last day.
	 * @see {@linkcode LogEntry}
	 */
	protected _logs: StyledText[] = [];

	/**
	 * The CLI renderer responsible for drawing the interface and handling user input.
	 * @see {@linkcode CliRenderer}
	 */
	protected _renderer?: CliRenderer;

	/**
	 * The main area for visualization of content.
	 * @see {@linkcode BoxRenderable}
	 */
	protected content?: BoxRenderable;

	/**
	 * A menu showing options based on the current window.
	 * @see {@linkcode SelectRenderable}
	 */
	protected contextMenu?: BoxRenderable;

	/**
	 * Date of the last time the logs were saved.
	 * @see {@linkcode Date}
	 */
	protected lastSaveDate?: Date;

	/**
	 * ID of the current window displayed in the main content area of the CLI.
	 * @see {@linkcode CLIView}
	 */
	protected view: CLIView = CLIView.OVERVIEW;

	/**
	 * Windows that can be selected to be shown in the main area of the CLI.
	 * @see {@linkcode CLIView}
	 * @see {@linkcode Window}
	 */
	protected windows: Collection<CLIView, Window>;

	/**
	 * Menu to select the content of the main area of the CLI.
	 * @see {@linkcode ButtonGroupRenderable}
	 */
	protected windowSelection?: ButtonGroupRenderable;

	/**
	 * Listeners that get notified when a new log is added.
	 * @see {@linkcode StyledText}
	 */
	protected logListeners: ((log?: StyledText) => void)[] = [];

	/**
	 * Creates a new console handler. If wanted, common console methods like {@linkcode console.debug},
	 * {@linkcode console.error}, {@linkcode console.info} and {@linkcode console.warn} can be replaced by matching
	 * intern console handler methods {@linkcode debug}, {@linkcode error}, {@linkcode info} and {@linkcode warn}.
	 * @param overwriteConsole Whether to replace the logging methods with the matching intern console handler
	 * functions. Defaults to `true`.
	 */
	public constructor(overwriteConsole: boolean = true) {
		this.ready = false as Ready;

		this.windows = new Collection();

		createCliRenderer().then(async (renderer) => {
			this._renderer = renderer;

			await readFiles<BlankWindow>(configuration.paths.windows).then((blankWindows) => {
				blankWindows.forEach((blankWindow) => {
					this.windows.set(blankWindow.id, { ...blankWindow, content: blankWindow.create(this) });
				});

				this.windows.sort((_, __, firstWindow, secondWindow) => firstWindow - secondWindow);
			});

			/**
			 * The base or "root" every other {@linkcode Renderable} is added to.
			 * @see {@linkcode BoxRenderable}
			 */
			const base = new BoxRenderable(this._renderer, {
				flexDirection: "row-reverse",
				flexGrow: 1,
			});

			const contentArea = new BoxRenderable(this._renderer, {
				flexDirection: "column-reverse",
				flexGrow: 1,
			});

			this.content = new BoxRenderable(this._renderer, {
				border: true,
				borderStyle: "rounded",
				flexGrow: 1,
			});
			this.content.add(this.windows.get(this.view)?.content);

			this.contextMenu = new ButtonGroupRenderable(this._renderer, {
				border: true,
				borderStyle: "rounded",
				flexDirection: "row",
				height: 5,
			});

			contentArea.add(this.contextMenu);
			contentArea.add(this.content);

			this.windowSelection = new ButtonGroupRenderable(this._renderer, {
				border: true,
				borderStyle: "rounded",
				flexDirection: "column",
				width: 15,
			});

			this.windows.forEach((window) => {
				this.windowSelection!.add(
					new ButtonRenderable(this._renderer!, {
						description: window.description,
						borderStyle: this.windowSelection?.borderStyle!,
						name: window.title,
						onMouseDown: () => {
							this.switchWindow(window.id);
						},
					}),
				);
			});

			base.add(this.windowSelection);
			base.add(contentArea);

			this._renderer.root.add(base);

			this.windows.get(this.view);

			this.changeReadyState();
		});

		this.updateCommands();

		if (overwriteConsole) {
			console.debug = this.debug;
			console.error = this.error;
			console.info = this.info;
			console.warn = this.warn;
		}
	}

	/**
	 * A collection of console commands that can be used in the CLI.
	 * @see {@linkcode ConsoleCommand}
	 */
	public get commands(): If<Ready, ConsoleCommand[]> {
		return this._commands as If<Ready, ConsoleCommand[]>;
	}

	public get logs(): typeof this._logs {
		return this._logs;
	}

	/**
	 * The base renderer for the CLI.
	 * @see {@linkcode CliRenderer}
	 */
	public get renderer(): If<Ready, CliRenderer> {
		return this._renderer as If<Ready, CliRenderer>;
	}

	/** Changes the {@linkcode _state | state} of the console handler. */
	protected changeReadyState(): void {
		this.ready = (this._renderer !== undefined) as Ready;
	}

	/**
	 * Prints a log message to the log in the matching log type color. Messages are timstampted and automatically
	 * trigger a potential log save based on date changes.
	 * @param type - Type of the message fragments.
	 * @param messages Message fragments to add to the log box.
	 * @see {@linkcode LogType}
	 */
	protected log(type: LogType, ...messages: any[]): void {
		if (configuration.bot.saveLogs !== false) {
			this.triggerSave();
		}

		/** Timestamp of the current time */
		const timestamp = `[${getTime(true)}]: `;

		/** Styled log message ready for display */
		const log = new StyledText([
			white(timestamp),
			...messages
				.map((message) => {
					/** Messages split at every new line */
					const splitMessages = String(message).split("\n");

					switch (type) {
						case LogType.DEBUG:
							return splitMessages.map((splitMessage) => white(splitMessage));

						case LogType.ERROR:
							return message instanceof Error
								? splitMessages.map((splitMessage) => brightRed(splitMessage))
								: splitMessages.map((splitMessage) => red(splitMessage));

						case LogType.INFORMATION:
							return splitMessages.map((splitMessage) => blue(splitMessage));

						case LogType.SUCCESS:
							return splitMessages.map((splitMessage) => green(splitMessage));

						case LogType.WARNING:
							return splitMessages.map((splitMessage) => yellow(splitMessage));
					}
				})
				.flat()
				.map((message, index, splitMessages) =>
					index < splitMessages.length - 1
						? [message, white("\n".padEnd(timestamp.length + "\n".length, " "))]
						: [message, white("\n")],
				)
				.flat(),
		]);

		this.logListeners.forEach((listener) => {
			listener(log);
		});

		this.logs.push(log);
	}

	/**
	 * Changes the current window to the window with provided ID.
	 * @param window The window to show. Defaults to {@linkcode CLIView.OVERVIEW}.
	 * @see {@linkcode CLIView}
	 */
	protected switchWindow(window: CLIView = CLIView.OVERVIEW): void {
		if (this.windows.has(window) && window !== this.view) {
			/**
			 * The renderable content of the window to switch to
			 * @see {@linkcode Renderable}
			 */
			const nextWindow = this.windows.get(window)!;

			this.content!.remove(this.windows.get(this.view)!.content.id);
			this.content!.add(nextWindow.content);

			this.view = window;

			nextWindow.content.getChildren().forEach((child) => {
				if (child instanceof SelectRenderable) {
					child.focus();
				}
			});

			this.contextMenu!.getChildren().forEach((button) => {
				this.contextMenu!.remove(button.id);
			});
			nextWindow.menuOptions.forEach((button) => {
				this.contextMenu!.add(button);
			});
		}
	}

	/**
	 * Parses the raw input string to extract the command name and prepare for parameter processing. Converts the
	 * command name to uppercase for case-insensitive matching.
	 * @param input The raw command string entered by the user.
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
	 * @param parameter The parameter value to validate.
	 * @param parameterData The parameter definition containing validation rules.
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
	 * @param parameters The raw parameter string to parse.
	 * @param parameterData Optional parameter definitions for validation during parsing.
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

		/**
		 * Transformed parameters with correct types and validation
		 * @see {@linkcode NestedArray}
		 */
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

	/** Clears the {@linkcode logs} of the console handler. */
	public clearLogs(): void {
		this.logListeners.forEach((listener) => {
			listener();
		});

		this._logs = [];
	}

	/**
	 * Prints a debugging message to the log in white color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param messages Message fragments to add to the log box.
	 */
	public debug(...messages: any[]): void {
		this.log(LogType.DEBUG, ...messages);
	}

	/** Destroys the CLI and the {@linkcode _renderer | renderer}. */
	public destroy(): void {
		this._renderer?.destroy();
	}

	/**
	 * Prints an error message to the log. Error objects are highlighted in bright red, while text messages are printed
	 * in red. Messages are timestamped and automatically trigger a potential log save based on date changes.
	 * @param messages Message fragments to add to the log box.
	 */
	public error(...messages: any[]): void {
		this.log(LogType.ERROR, ...messages);
	}

	/**
	 * Processes and executes a console command entered by the user. Parses the input, validates parameters, and
	 * invokes the appropriate command handler.
	 * @param input The raw command string entered by the user.
	 */
	public handleCommand(input: string): void {
		/**
		 * Input split into console command and parameters, if entered. Parameters already passed typecheck.
		 * @see {@linkcode ConsoleCommand}
		 * @see {@linkcode NestedArray}
		 */
		const transformedInput = this.handleInput(input) || [];

		if (Array.isArray(transformedInput)) {
			const [command, parameters] = transformedInput;
			command?.execute(parameters);
		} else {
			/**
			 * Command that was interacted with
			 * @see {@linkcode ConsoleCommand}
			 */
			const command = transformedInput;
			command.execute();
		}
	}

	/**
	 * Parses the user input to identify the command and extract parameters. Searches for matching commands by name or
	 * alias and returns the command with its parameters if found.
	 * @param input The raw command string entered by the user.
	 * @returns The matched command, or a tuple of command and parameters, or undefined if no match.
	 * @see {@linkcode ConsoleCommand}
	 * @see {@linkcode NestedArray}
	 */
	public handleInput(
		input: string,
	): ConsoleCommand | [ConsoleCommand, NestedArray<string | number | boolean>?] | void {
		const [commandName, parameters] = this.transformInput(input);

		/**
		 * Command that was called
		 * @ee {@linkcode ConsoleCommand}
		 */
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
	 * Prints an informational message to the log in blue color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param messages Message fragments to add to the log box.
	 */
	public info(...messages: any[]): void {
		this.log(LogType.INFORMATION, ...messages);
	}

	/**
	 * Checks, whether the {@linkcode ConsoleHandler} is ready.
	 * @returns Whether the {@linkcode ConsoleHandler} is ready.
	 */
	public isReady(): this is ConsoleHandler<true> {
		return this.ready;
	}

	/**
	 * Registers a listener to be notified when a new log is added.
	 * @param handler Function to call with each new log entry. Sending no message is supposed to clear the logs in the
	 * registered windows.
	 */
	public registerLogListener(handler: (message?: StyledText) => void): void {
		this.logListeners.push(handler);
	}

	/**
	 * Saves the current logs to a local file.
	 * @param path The path of the file the logs should be saved in.
	 * @see {@linkcode Path}
	 */
	public saveLogs(path?: Path): void {
		if (!existsSync(relativePath(path ?? configuration.paths.logPath))) {
			mkdirSync(relativePath(path ?? configuration.paths.logPath));
		}

		/** Path to the log file */
		const logPath = relativePath(
			`${path ?? configuration.paths.logPath}/${getTime(undefined, true)
				.replaceAll("/", "-")
				.split("")
				.join("")}.log` as Path,
		);

		appendFile(
			logPath,
			this.logs.map((logEntry) => logEntry.chunks.map((chunk) => chunk.text).join(" ")).join(""),
			(error) => {
				if (error) {
					this.error(error);
				} else {
					this.clearLogs();
					this.success(`Logs saved to '${logPath}'`);
				}
			},
		);

		this.lastSaveDate = new Date();
	}

	/**
	 * Prints a success message to the log in green color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param messages Message fragments to add to the log box.
	 */
	public success(...messages: any[]): void {
		this.log(LogType.SUCCESS, ...messages);
	}

	/**
	 * Triggers a log save operation if the current date differs from the date of the last logged message. This ensures
	 * logs are saved daily. Updates the last message date after checking.
	 */
	public triggerSave(): void {
		/**
		 * Current date and time
		 * @see {@linkcode Date}
		 */
		const now = new Date();

		/**
		 * Current date (year, month and day of month)
		 * @see {@linkcode Date}
		 */
		const currentDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

		/**
		 * Date of the day after the last printed log message
		 * @see {@linkcode Date}
		 */
		const nextDayDate = new Date(this.lastSaveDate ?? currentDate);

		nextDayDate.setDate(nextDayDate.getDate() + 1);

		if (currentDate >= nextDayDate) {
			this.saveLogs();
		}
	}

	/** Updates all console commands that can be used. Every call after the first overwrite any old console commands. */
	public async updateCommands(): Promise<void> {
		this._commands = await readFiles<ConsoleCommand>(configuration.paths.consoleCommandsPath);
	}

	/** Updates all windows. Windows already set in the collection will be overwritten. */
	public async updateWindows(): Promise<void> {
		readFiles<BlankWindow>(configuration.paths.windows).then((windows) => {
			this.content?.remove(this.windows.get(this.view)!.content.id);

			windows.forEach((window) => this.windows.set(window.id, { content: window.create(this), ...window }));
			this.windows.sort((_, __, firstWindow, secondWindow) => firstWindow - secondWindow);

			this.content?.add(this.windows.get(this.view)!.content.id);
		});
	}

	/**
	 * Prints a warning message to the log in yellow color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param messages Message fragments to add to the log box.
	 */
	public warn(...messages: any[]): void {
		this.log(LogType.WARNING, ...messages);
	}
}
