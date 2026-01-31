// Class & type imports
import { ConsoleCommand } from "../../types";

// Data imports
import { client } from "#application";

// External libraries imports
import { BoxRenderable, CliRenderer, RGBA } from "@opentui/core";
import { color, type ColorInput } from "bun";
import { Colors } from "discord.js";
import { clearLine, createInterface, cursorTo, Interface } from "readline";
import type { Path } from "typescript";

// Internal class & type imports
import { CommandHandler } from "./CommandHandler";
import { CommandInputRenderable } from "./CommandInputRenderable";
import { LogRenderable } from "./LogRenderable";
import { VerticalSplitBoxRenderable } from "./VerticalSplitBoxRenderable";

// Module imports
import getTime from "../../modules/time";

/**
 * Manages the console-based user interface for the Discord bot, providing a terminal-like experience for executing
 * commands and viewing logs. It creates a split-screen layout with command input at the top and log output below,
 * handling user interactions and system feedback.
 */
export class ConsoleHandler {
	/**
	 * The color used for borders of focused UI elements. Can be a specific color or `"auto"` to use the bot's accent
	 * color.
	 * @see {@linkcode ColorInput}
	 */
	protected _focusColor: ColorInput | "auto" = "auto";

	/**
	 * The command handler that handles user command entry and execution.
	 * @see {@linkcode CommandHandler}
	 * @see {@linkcode CommandInputRenderable}
	 */
	protected commandHandler?: CommandHandler | CommandInputRenderable;

	/**
	 * @see {@linkcode Console}
	 */
	protected consoleMethods?: Pick<Console, "debug" | "error" | "info" | "log" | "warn">;

	/**
	 * Whether the whole application is running in debugging mode. In that case, the CLI is disabled.
	 */
	protected _debuggingMode: boolean = false;

	/**
	 * The default focus color used when "auto" is selected but the bot's accent color is unavailable.
	 * @see {@linkcode ColorInput}
	 */
	protected defaultFocusColor: ColorInput = Colors.LuminousVividPink;

	/** Whether log messages should include the current date in their timestamps. */
	protected includeDate: boolean = false;

	/**
	 * Readline interface handling console input in debugging mode
	 * @see {@linkcode Interface}
	 */
	protected interface?: Interface;

	/**
	 * The log display area where system messages and command outputs are shown.
	 * @see {@linkcode LogRenderable}
	 */
	protected logs?: LogRenderable;

	/**
	 * The CLI renderer responsible for drawing the interface and handling user input.
	 * @see {@linkcode CliRenderer}
	 */
	protected renderer?: CliRenderer;

	/**
	 * The main container that splits the interface into command input and log sections.
	 * @see {@linkcode VerticalSplitBoxRenderable}
	 */
	protected splitBox?: VerticalSplitBoxRenderable;

	/**
	 * Creates a new console handler instance. The handler must be initialized with a renderer before use.
	 * @param focusColor - The color for focused UI elements, or "auto" to use the bot's accent color.
	 * @param includeDate - Whether to include dates in log timestamps.
	 * @see {@linkcode ColorInput}
	 */
	constructor(focusColor: ColorInput | "auto" = "auto", includeDate: boolean = false) {
		this._focusColor = focusColor;
		this.includeDate = includeDate;
	}

	/**
	 * Console commands of the command handler
	 * @see {@linkcode ConsoleCommand}
	 */
	public get commands(): ConsoleCommand[] {
		return this.commandHandler!.commands;
	}

	/** Whether the CLI runs in debugging mode */
	public get debuggingMode(): boolean {
		return this._debuggingMode;
	}

	/**
	 * Current focus color used for UI element borders.
	 * @see {@linkcode ColorInput}
	 */
	public get focusColor(): ColorInput {
		return this._focusColor;
	}

	/**
	 * Current focus color used for UI element borders.
	 * @see {@linkcode ColorInput}
	 */
	public set focusColor(focusColor: ColorInput | "auto") {
		this._focusColor = color(focusColor, "HEX") ?? "auto";

		if (this._focusColor === "auto") {
			if (client.isReady()) {
				this.autoFocusColor();
			} else {
				this._focusColor = this.defaultFocusColor;
			}
		}

		if (!client.isReady() && this.splitBox) {
			this.splitBox.focusColor = this._focusColor;
		}
	}

	/**
	 * Automatically sets the focus color to the bot's accent color from Discord. Falls back to the default color if
	 * the accent color is unavailable.
	 */
	private async autoFocusColor(): Promise<void> {
		await client.user!.fetch();

		this._focusColor = client.user!.hexAccentColor ?? this.defaultFocusColor;

		if (this.splitBox) {
			this.splitBox.focusColor = this._focusColor;
		}
	}

	/**
	 * Prints a debug message to the log display area.
	 * @param messages - The messages to log.
	 */
	public debug(...messages: any[]): void {
		if (this._debuggingMode) {
			/** Current timestamp to lead message */
			const timestamp = getTime(!this.includeDate);

			messages = messages.map((message, index) =>
				typeof message === "string" && index < messages.length - 1
					? message.replaceAll("\n", `\n\x1b[30m${timestamp}\x1b[0m`.padEnd(timestamp.length + 4, " "))
					: message,
			);

			clearLine(process.stdout, 0);
			cursorTo(process.stdout, 0);

			if (this.consoleMethods) {
				this.consoleMethods.debug(`[${timestamp}]`, ...messages);
			} else {
				console.debug(`[${timestamp}]`, ...messages);
			}
		} else {
			this.logs?.debug(...messages);
		}
	}

	/**
	 * Destroys the CLI renderer and cleans up the console interface.
	 */
	public destroy(): void {
		this.interface?.close();
		this.renderer?.destroy();
	}

	/**
	 * Prints an error message to the log display area.
	 * @param messages - The error messages to log.
	 */
	public error(...messages: any[]): void {
		if (this._debuggingMode) {
			/** Current timestamp to lead message */
			const timestamp = getTime(!this.includeDate);

			messages = messages.map((message, index) =>
				typeof message === "string" && index < messages.length - 1
					? message.replaceAll("\n", `\n\x1b[30m${timestamp}\x1b[0m`.padEnd(timestamp.length + 4, " "))
					: message,
			);

			clearLine(process.stdout, 0);
			cursorTo(process.stdout, 0);

			if (this.consoleMethods) {
				this.consoleMethods.error(`[${timestamp}]\x1b[31m`, ...messages, "\x1b[0m");
			} else {
				console.error(`[${timestamp}]\x1b[31m`, ...messages, "\x1b[0m");
			}
		} else {
			this.logs?.error(...messages);
		}
	}

	/**
	 * Prints an informational message to the log display area.
	 * @param messages - The informational messages to log.
	 */
	public info(...messages: any[]): void {
		if (this._debuggingMode) {
			/** Current timestamp to lead message */
			const timestamp = getTime(!this.includeDate);

			messages = messages.map((message, index) =>
				typeof message === "string" && index < messages.length - 1
					? message.replaceAll("\n", `\n\x1b[30m${timestamp}\x1b[0m`.padEnd(timestamp.length + 4, " "))
					: message,
			);

			clearLine(process.stdout, 0);
			cursorTo(process.stdout, 0);

			if (this.consoleMethods) {
				this.consoleMethods.info(`[${timestamp}]\x1b[34m`, ...messages, "\x1b[0m");
			} else {
				console.info(`[${timestamp}]\x1b[34m`, ...messages, "\x1b[0m");
			}
		} else {
			this.logs?.info(...messages);
		}
	}

	/**
	 * Initializes the console handler with a CLI renderer. Creates and arranges all UI components including command
	 * input, log display, and the split layout. If wanted, common console methods like {@linkcode console.debug},
	 * {@linkcode console.error}, {@linkcode console.info} and {@linkcode console.warn} can be replaced by matching
	 * intern console handler methods {@linkcode debug}, {@linkcode error}, {@linkcode info} and {@linkcode warn}.
	 * @param ctx - The CLI renderer instance to use for the interface.
	 * @param overwriteConsole - Whether to replace the logging methods with the matching intern console handler.
	 * Defaults to `true`.
	 */
	public initialize(ctx: CliRenderer, overwriteConsole?: boolean): void;

	/**
	 * Initializes the console handler with a basic command handler in the console for debugging purposes. If wanted,
	 * common console methods like {@linkcode console.debug}, {@linkcode console.error}, {@linkcode console.info} and
	 * {@linkcode console.warn} can be replaced by matching intern console handler methods {@linkcode debug},
	 * {@linkcode error}, {@linkcode info} and {@linkcode warn}.
	 * @param debugging - Whether the application runs in debugging mode.
	 * @param overwriteConsole - Whether to replace the logging methods with the matching intern console handler.
	 * Defaults to `true`.
	 */
	public initialize(debugging: true, overwriteConsole?: boolean): void;

	public initialize(x: CliRenderer | true, overwriteConsole: boolean = true): void {
		this._debuggingMode = x === true;

		/**
		 * Overload ctx parameter
		 * @see {@linkcode CliRenderer}
		 */
		const ctx = x instanceof CliRenderer ? x : null;

		if (!this._debuggingMode && ctx) {
			this.renderer = ctx;

			this.commandHandler = new CommandInputRenderable(this.renderer, {
				flexDirection: "row",
				height: "20%",
				minHeight: 4,
				title: "Commands",
			});

			/**
			 * Container for the log output area
			 * @see {@linkcode BoxRenderable}
			 */
			const logBox = new BoxRenderable(this.renderer, {
				height: "80%",
				title: "Logs",
			});

			this.logs = new LogRenderable(this.renderer, this.includeDate, {});

			logBox.add(this.logs);

			this.splitBox = new VerticalSplitBoxRenderable(this.renderer, undefined, [this.commandHandler, logBox], {
				border: true,
				borderStyle: "rounded",
				focusedBorderColor: RGBA.fromHex(
					this._focusColor === "auto" ? color(this.defaultFocusColor, "HEX")! : (this._focusColor as string),
				),
				onMouseOut() {
					this.borderColor = this._defaultOptions.borderColor;
					this.blur();
				},
				onMouseOver() {
					this.borderColor = this.focusedBorderColor;
					this.focus();
				},
			});

			this.renderer.root.add(this.splitBox);

			this.splitBox.switchFocus();

			this.renderer.start();
		} else {
			this.commandHandler = new CommandHandler();

			this.updateCommands();

			this.interface = createInterface({
				completer: (input: string) => {
					const options: string[] = [];

					this.commands.forEach((command) => {
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

			this.interface.once("close", () => process.exit());

			this.interface.on("line", (input: string) => (this.commandHandler as CommandHandler).handleCommand(input));

			this.interface.prompt();
		}

		if (overwriteConsole) {
			this.consoleMethods = {
				debug: console.debug,
				error: console.error,
				info: console.info,
				log: console.log,
				warn: console.warn,
			};

			console.error = this.error;
			console.debug = this.debug;
			console.info = this.info;
			console.warn = this.warn;
		}

		console.debug(this.consoleMethods);
	}

	/**
	 * Saves the current log contents to a file. Uses the specified path or falls back to the configured log directory.
	 * @param path - Optional path where to save the log file.
	 */
	public saveLogs(path?: Path) {
		this.logs?.saveLogs(path);
	}

	/**
	 * Logs a success message to the console and updates the UI accordingly.
	 * @param messages - The success messages to log.
	 */
	public success(...messages: any[]): void {
		if (this._debuggingMode) {
			/** Current timestamp to lead message */
			const timestamp = getTime(!this.includeDate);

			messages = messages.map((message, index) =>
				typeof message === "string" && index < messages.length - 1
					? message.replaceAll("\n", `\n\x1b[30m${timestamp}\x1b[0m`.padEnd(timestamp.length + 4, " "))
					: message,
			);

			clearLine(process.stdout, 0);
			cursorTo(process.stdout, 0);

			if (this.consoleMethods) {
				this.consoleMethods.log(`[${timestamp}]\x1b[32m`, ...messages, "\x1b[0m");
			} else {
				console.log(`[${timestamp}]\x1b[32m`, ...messages, "\x1b[0m");
			}
		} else {
			this.logs?.success(...messages);
		}
	}

	/**
	 * Updates the loaded console commands from local files. This method refreshes the command input with the latest
	 * available commands from the filesystem.
	 */
	public async updateCommands(): Promise<void> {
		await this.commandHandler?.updateCommands();
	}

	/**
	 * Logs a warning message to the console and updates the UI accordingly.
	 * @param messages - The warning messages to log.
	 */
	public warn(...messages: any[]): void {
		if (this._debuggingMode) {
			/** Current timestamp to lead message */
			const timestamp = getTime(!this.includeDate);

			messages = messages.map((message, index) =>
				typeof message === "string" && index < messages.length - 1
					? message.replaceAll("\n", `\n\x1b[30m${timestamp}\x1b[0m`.padEnd(timestamp.length + 4, " "))
					: message,
			);

			clearLine(process.stdout, 0);
			cursorTo(process.stdout, 0);

			if (this.consoleMethods) {
				this.consoleMethods.warn(`[${timestamp}]\x1b[33m`, ...messages, "\x1b[0m");
			} else {
				console.warn(`[${timestamp}]\x1b[33m`, ...messages, "\x1b[0m");
			}
		} else {
			this.logs?.warn(...messages);
		}
	}
}
