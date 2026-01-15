// Class & type imports
import { ConsoleCommand } from "../../types";

// Data imports
import { client } from "#application";

// External libraries imports
import { BoxRenderable, CliRenderer, RGBA } from "@opentui/core";
import { color, type ColorInput } from "bun";
import { Colors } from "discord.js";
import type { Path } from "typescript";

// Internal class & type imports
import { CommandInputRenderable } from "./CommandInputRenderable";
import { LogRenderable } from "./LogRenderable";
import { VerticalSplitBoxRenderable } from "./VerticalSplitBoxRenderable";

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
	protected _focusColor: ColorInput | "auto";

	/**
	 * The command input component that handles user command entry and execution.
	 * @see {@linkcode CommandInputRenderable}
	 */
	protected commandInput?: CommandInputRenderable;

	/**
	 * The default focus color used when "auto" is selected but the bot's accent color is unavailable.
	 * @see {@linkcode ColorInput}
	 */
	protected defaultFocusColor: ColorInput = Colors.LuminousVividPink;

	/** Whether log messages should include the current date in their timestamps. */
	protected includeDate: boolean;

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
	 * @see {@linkcode ConsoleCommand}
	 */
	public get commands(): ConsoleCommand[] {
		return this.commandInput!.commands;
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
		this.logs?.debug(...messages);
	}

	/**
	 * Destroys the CLI renderer and cleans up the console interface.
	 */
	public destroy(): void {
		this.renderer?.destroy();
	}

	/**
	 * Prints an error message to the log display area.
	 * @param messages - The error messages to log.
	 */
	public error(...messages: any[]): void {
		this.logs?.error(...messages);
	}

	/**
	 * Prints an informational message to the log display area.
	 * @param messages - The informational messages to log.
	 */
	public info(...messages: any[]): void {
		this.logs?.info(...messages);
	}

	/**
	 * Initializes the console handler with a CLI renderer. Creates and arranges all UI components including command
	 * input, log display, and the split layout. If wanted, common console methods , {@linkcode console.debug},
	 * {@linkcode console.error}, {@linkcode console.info} and {@linkcode console.warn} can be replaced by matching
	 * intern console handler methods {@linkcode debug}, {@linkcode error}, {@linkcode info} and {@linkcode warn}.
	 * @param ctx - The CLI renderer instance to use for the interface.
	 * @param overwriteConsole - Whether to replace the logging methods with the matching intern console handler.
	 * Defaults to `true`
	 */
	public initialize(ctx: CliRenderer, overwriteConsole: boolean = true): void {
		this.renderer = ctx;

		/** Container for the command input area */
		const commandBox = new CommandInputRenderable(this.renderer, {
			flexDirection: "row",
			height: "20%",
			minHeight: 4,
			title: "Commands",
		});

		/** Container for the log output area */
		const logBox = new BoxRenderable(this.renderer, {
			height: "80%",
			title: "Logs",
		});

		this.logs = new LogRenderable(this.renderer, this.includeDate, {});

		logBox.add(this.logs);

		this.splitBox = new VerticalSplitBoxRenderable(this.renderer, undefined, [commandBox, logBox], {
			border: true,
			borderStyle: "rounded",
			focusedBorderColor: RGBA.fromHex(
				this._focusColor === "auto" ? color(this.defaultFocusColor, "HEX")! : (this._focusColor as string),
			),
			onMouseOut() {
				this.borderColor = this._defaultOptions.borderColor;
				this.getChildren().every((child) => child.blur());
			},
			onMouseOver() {
				this.borderColor = this.focusedBorderColor;
				this.getChildren().every((child) => child.focus());
			},
		});

		this.renderer.root.add(this.splitBox);

		this.renderer.start();

		if (overwriteConsole) {
			console.error = this.error;
			console.debug = this.debug;
			console.info = this.info;
			console.warn = this.warn;
		}
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
		this.logs?.success(...messages);
	}

	/**
	 * Updates the loaded console commands from local files. This method refreshes the command input with the latest
	 * available commands from the filesystem.
	 */
	public async updateCommands(): Promise<void> {
		await this.commandInput?.updateCommands();
	}

	/**
	 * Logs a warning message to the console and updates the UI accordingly.
	 * @param messages - The warning messages to log.
	 */
	public warn(...messages: any[]): void {
		this.logs?.warn(...messages);
	}
}
