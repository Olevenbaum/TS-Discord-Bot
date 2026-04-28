// Class & type imports
import { DebuggingState } from "../DebuggingState";
import type { ConsoleCommand } from "../../types";

// External library imports
import {
	BoxRenderable,
	CliRenderer,
	createCliRenderer,
	SelectOption,
	SelectRenderable,
	SelectRenderableEvents,
} from "@opentui/core";
import { clearLine, createInterface, cursorTo, Interface } from "readline";
import type { Path } from "typescript";

// Internal class & type imports
import { CLIState } from "./CLIState";
import { CLIView } from "./CLIView";
import { CommandHandler } from "./CommandHandler";
import { CommandInputRenderable } from "./CommandInputRenderable";
import { LogRenderable } from "./LogRenderable";

// Module imports
import getTime from "../../modules/time";

/**
 * Manages the console-based user interface for the Discord bot, providing a terminal-like experience for executing
 * commands and viewing logs. It creates a split-screen layout with command input at the top and log output below,
 * handling user interactions and system feedback.
 */
export class ConsoleHandler {
	/**
	 * Whether the whole application is running in debugging mode. In that case, the CLI is disabled.
	 */
	protected _debuggingMode: DebuggingState = DebuggingState.NONE;

	/**
	 * @see {@linkcode BoxRenderable}
	 */
	protected _cliLayout?: BoxRenderable;

	/**
	 * The command handler that handles user command entry and execution.
	 * @see {@linkcode CommandHandler}
	 * @see {@linkcode CommandInputRenderable}
	 */
	protected _commandHandler?: CommandHandler | CommandInputRenderable;

	/**
	 * @see {@linkcode Console}
	 */
	protected _consoleMethods?: Pick<Console, "debug" | "error" | "info" | "log" | "warn">;

	/**
	 * @see {@linkcode BoxRenderable}
	 */
	protected _contentArea?: BoxRenderable;

	/**
	 * @see {@linkcode SelectRenderable}
	 */
	protected _contextMenu?: SelectRenderable;

	/**
	 * Readline interface handling console input in debugging mode
	 * @see {@linkcode Interface}
	 */
	protected _interface?: Interface;

	/**
	 * The log display area where system messages and command output is shown.
	 * @see {@linkcode LogRenderable}
	 */
	protected _logs?: LogRenderable;

	/**
	 * @see {@linkcode SelectRenderable}
	 */
	protected _menu?: SelectRenderable;

	/**
	 * The CLI renderer responsible for drawing the interface and handling user input.
	 * @see {@linkcode CliRenderer}
	 */
	protected _renderer?: CliRenderer;

	/**
	 * @see {@linkcode CLIState}
	 */
	protected _state: CLIState = CLIState.UNINITIALIZED;

	/**
	 * @see {@linkcode CLIView}
	 */
	protected _view?: CLIView;

	/**
	 * @see {@linkcode CLIView}
	 * @see {@linkcode SelectOption}
	 */
	private contextMenuOptions: Partial<Record<CLIView, SelectOption[]>> = {
		2: [{ description: "Saves all displayed log messages in a matching file", name: "Save", value: "save" }],
	};

	/** Whether log messages should include the current date in their timestamps. */
	protected includeDate: boolean = false;

	/**
	 * Creates a new console handler. If wanted, common console methods like {@linkcode console.debug},
	 * {@linkcode console.error}, {@linkcode console.info} and {@linkcode console.warn} can be replaced by matching
	 * intern console handler methods {@linkcode debug}, {@linkcode error}, {@linkcode info} and {@linkcode warn}.
	 *
	 * **Note:** {@linkcode initialize} has to be called first befor use.
	 *
	 * @param overwriteConsole - Whether to replace the logging methods with the matching intern console handler.
	 * Defaults to `true`.
	 * @param includeDate - Whether to include dates in log timestamps. Defaults to `false`.
	 */
	constructor(overwriteConsole: boolean = true, includeDate: boolean = false) {
		this.includeDate = includeDate;

		if (overwriteConsole) {
			this._consoleMethods = {
				debug: console.debug,
				error: console.error,
				info: console.info,
				log: console.log,
				warn: console.warn,
			};

			console.error = this.error.bind(this);
			console.debug = this.debug.bind(this);
			console.info = this.info.bind(this);
			console.warn = this.warn.bind(this);
		}

		this.updateCommands();
	}

	/**
	 * Console commands of the command handler
	 * @see {@linkcode ConsoleCommand}
	 */
	public get commands(): ConsoleCommand[] | undefined {
		return this._commandHandler?.commands;
	}

	/**
	 * Whether the CLI runs in debugging mode
	 * @see {@linkcode DebuggingState}
	 */
	public get debuggingMode(): DebuggingState {
		return this._debuggingMode;
	}

	/**
	 * @see {@linkcode Interface}
	 */
	public get interface(): Interface | undefined {
		return this._interface;
	}

	/**
	 * @see {@linkcode CLIState}
	 */
	public get state(): CLIState {
		return this._state;
	}

	/**
	 * @see {@linkcode CLIView}
	 */
	public get view(): CLIView | undefined {
		return this._view;
	}

	/**
	 * Prints a debugging message to the log display area.
	 * @param messages - The messages to log.
	 */
	public debug(...messages: any[]): void {
		if (this._debuggingMode === DebuggingState.TERMINAL) {
			/** Current timestamp to lead message */
			const timestamp = getTime(!this.includeDate);

			messages = messages.map((message) =>
				typeof message === "string" ? message.replaceAll("\n", `\n\x1b[30m[${timestamp}] \x1b[0m`) : message,
			);

			clearLine(process.stdout, 0);
			cursorTo(process.stdout, 0);

			if (this._consoleMethods) {
				this._consoleMethods.debug(`[${timestamp}]`, ...messages);
			} else {
				console.debug(`[${timestamp}]`, ...messages);
			}
		} else {
			this._logs?.debug(...messages);
		}
	}

	/**
	 * Destroys the CLI renderer and cleans up the console interface.
	 */
	public destroy(): void {
		this.interface?.close();
		this._renderer?.destroy();
	}

	/**
	 * Prints an error message to the log display area.
	 * @param messages - The error messages to log.
	 */
	public error(...messages: any[]): void {
		if (this._debuggingMode === DebuggingState.TERMINAL) {
			/** Current timestamp to lead message */
			const timestamp = getTime(!this.includeDate);

			messages = messages.map((message, index) =>
				typeof message === "string"
					? message.replaceAll(
							"\n",
							`\n\x1b[30m[${timestamp}] \x1b[${index < messages.length - 1 ? "0" : "31"}m`,
						)
					: message,
			);

			clearLine(process.stdout, 0);
			cursorTo(process.stdout, 0);

			if (this._consoleMethods) {
				this._consoleMethods.error(`[${timestamp}]\x1b[31m`, ...messages, "\x1b[0m");
			} else {
				console.error(`[${timestamp}]\x1b[31m`, ...messages, "\x1b[0m");
			}
		} else {
			this._logs?.error(...messages);
		}
	}

	/**
	 * Prints an informational message to the log display area.
	 * @param messages - The informational messages to log.
	 */
	public info(...messages: any[]): void {
		if (this._debuggingMode === DebuggingState.TERMINAL) {
			/** Current timestamp to lead message */
			const timestamp = getTime(!this.includeDate);

			messages = messages.map((message, index) =>
				typeof message === "string"
					? message.replaceAll(
							"\n",
							`\n\x1b[30m[${timestamp}] \x1b[${index < messages.length - 1 ? "0" : "34"}m`,
						)
					: message,
			);

			clearLine(process.stdout, 0);
			cursorTo(process.stdout, 0);

			if (this._consoleMethods) {
				this._consoleMethods.info(`[${timestamp}]\x1b[34m`, ...messages, "\x1b[0m");
			} else {
				console.info(`[${timestamp}]\x1b[34m`, ...messages, "\x1b[0m");
			}
		} else {
			this._logs?.info(...messages);
		}
	}

	/**
	 * Initializes the console handler with a CLI renderer or basic command handler in the console based on the desired
	 * debugging mode. If wanted, common console methods like {@linkcode console.debug}, {@linkcode console.error},
	 * {@linkcode console.info} and {@linkcode console.warn} can be replaced by matching intern console handler methods
	 * {@linkcode debug}, {@linkcode error}, {@linkcode info} and {@linkcode warn}.
	 * @param debugging - The debugging mode the bot runs in. Defaults to {@linkcode DebuggingState.NONE}.
	 * @see {@linkcode CliRenderer}
	 * @see {@linkcode DebuggingState}
	 */
	public async initialize(debugging?: DebuggingState): Promise<void>;

	public async initialize(debugging: DebuggingState = DebuggingState.NONE): Promise<void> {
		this._state = CLIState.INITIALIZING;

		this._debuggingMode = debugging;

		if (this._debuggingMode === DebuggingState.TERMINAL) {
			this._commandHandler = new CommandHandler();

			this._interface = createInterface({
				completer: (input: string) => {
					const options: string[] = [];

					this.commands!.forEach((command) => {
						if (command.name.startsWith(input.toUpperCase())) {
							options.push(command.name);
						}

						if (command.aliases) {
							command.aliases.forEach((alias) => {
								if (alias.startsWith(input.toUpperCase())) {
									options.push(alias);
								}
							});
						}
					});

					return [options, input];
				},
				input: process.stdin,
				output: process.stdout,
				prompt: `[${getTime(!this.includeDate)}] \x1b[35mEnter command: \x1b[0m`,
				removeHistoryDuplicates: true,
				terminal: true,
			});

			this._interface.once("close", () => process.exit());

			this._interface.on("line", (input: string) =>
				(this._commandHandler as CommandHandler).handleCommand(input),
			);

			this._interface.prompt();
		} else {
			this._renderer = await createCliRenderer({
				consoleMode: this._debuggingMode === DebuggingState.NONE ? "disabled" : "console-overlay",
			});
			this._renderer.start();

			this._cliLayout = new BoxRenderable(this._renderer, { flexDirection: "row-reverse", id: "layout" });
			this._renderer.root.add(this._cliLayout);

			this._menu = new SelectRenderable(this._renderer, {
				id: "menu",
				options: [],
				width: 8,
			});
			this._menu.on(SelectRenderableEvents.ITEM_SELECTED, () => {});
			this._cliLayout?.add(this._menu);

			this._contentArea = new BoxRenderable(this._renderer, {
				flexDirection: "column-reverse",
				flexGrow: 1,
				id: "content-area",
			});
			this._cliLayout?.add(this._contentArea);

			this._contextMenu = new SelectRenderable(this._renderer, {
				height: 3,
				id: "context-menu",
				options: this._view ? (this.contextMenuOptions[this._view] ?? []) : [],
				visible: false,
			});
			this._contextMenu.on(SelectRenderableEvents.ITEM_SELECTED, (_, option) => {
				switch (option) {
					case "save":
						this.saveLogs;
						break;
				}
			});
			this._contentArea.add(this._contextMenu);

			this._commandHandler = new CommandInputRenderable(this._renderer, {
				flexDirection: "row",
				height: "20%",
				minHeight: 4,
				title: "COMMANDS",
			});

			this._logs = new LogRenderable(this._renderer, this.includeDate, {
				height: "80%",
				title: "LOGS",
			});

			this._view = CLIView.OVERVIEW;
		}

		this._state = CLIState.READY;
	}

	/**
	 * Saves the current log contents to a file. Uses the specified path or falls back to the configured log directory.
	 * @param path - Optional path where to save the log file.
	 */
	public saveLogs(path?: Path) {
		this._logs?.saveLogs(path);
	}

	/**
	 * Logs a success message to the console and updates the UI accordingly.
	 * @param messages - The success messages to log.
	 */
	public success(...messages: any[]): void {
		if (this._debuggingMode === DebuggingState.TERMINAL) {
			/** Current timestamp to lead message */
			const timestamp = getTime(!this.includeDate);

			messages = messages.map((message, index) =>
				typeof message === "string"
					? message.replaceAll(
							"\n",
							`\n\x1b[30m[${timestamp}] \x1b[${index < messages.length - 1 ? "0" : "32"}m`,
						)
					: message,
			);

			clearLine(process.stdout, 0);
			cursorTo(process.stdout, 0);

			if (this._consoleMethods) {
				this._consoleMethods.info(`[${timestamp}]\x1b[32m`, ...messages, "\x1b[0m");
			} else {
				console.info(`[${timestamp}]\x1b[32m`, ...messages, "\x1b[0m");
			}
		} else {
			this._logs?.success(...messages);
		}
	}

	/**
	 * Updates the loaded console commands from local files. This method refreshes the command input with the latest
	 * available commands from the filesystem.
	 */
	public async updateCommands(): Promise<void> {
		await this._commandHandler?.updateCommands();
	}

	/**
	 * Logs a warning message to the console and updates the UI accordingly.
	 * @param messages - The warning messages to log.
	 */
	public warn(...messages: any[]): void {
		if (this._debuggingMode === DebuggingState.TERMINAL) {
			/** Current timestamp to lead message */
			const timestamp = getTime(!this.includeDate);

			messages = messages.map((message, index) =>
				typeof message === "string"
					? message.replaceAll(
							"\n",
							`\n\x1b[30m[${timestamp}] \x1b[${index < messages.length - 1 ? "0" : "33"}m`,
						)
					: message,
			);

			clearLine(process.stdout, 0);
			cursorTo(process.stdout, 0);

			if (this._consoleMethods) {
				this._consoleMethods.warn(`[${timestamp}]\x1b[33m`, ...messages, "\x1b[0m");
			} else {
				console.warn(`[${timestamp}]\x1b[33m`, ...messages, "\x1b[0m");
			}
		} else {
			this._logs?.warn(...messages);
		}
	}
}
