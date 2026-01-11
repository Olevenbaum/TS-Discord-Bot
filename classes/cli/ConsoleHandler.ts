// Data imports
import { client } from "#application";
import { configuration } from "#variables";

// External libraries imports
import { BoxRenderable, CliRenderer, RGBA } from "@opentui/core";
import { color, type ColorInput } from "bun";
import { Colors } from "discord.js";
import { Path } from "typescript";

// Internal class & type imports
import { CommandInputRenderable } from "./CommandInputRenderable";
import { LogRenderable } from "./LogRenderable";
import { VerticalSplitBoxRenderable } from "./VerticalSplitBoxRenderable";

/** Handles console commands via a CLI interface */
export class ConsoleHandler {
	/**
	 * Color of focused children
	 * @see {@linkcode ColorInput}
	 */
	protected _focusColor: ColorInput | "auto";

	/**
	 * @see {@linkcode CommandInputRenderable}
	 */
	protected commandInput?: CommandInputRenderable;

	/**
	 * The default color ({@linkcode Colors.LuminousVividPink}) focused children have if no other color was chosen
	 * @see {@linkcode ColorInput}
	 */
	protected defaultFocusColor: ColorInput = Colors.LuminousVividPink;

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
	 * Creates a new console handler. The function {@linkcode ConsoleHandler.initialize | initialize()} needs to be
	 * called first for the console handler to function.
	 * @param focusColor - A color for the borders of focused elements. "auto" selects the accent color of the Discord
	 * bot
	 * @param includeDate - Whether to print the current date in front of every log message
	 * @see {@link ColorInput}
	 */
	constructor(focusColor: ColorInput | "auto" = "auto", includeDate: boolean = false) {
		this._focusColor = focusColor;
		this.includeDate = includeDate;
	}

	/**
	 * The color the border of both the command and log boxes switch to on focus
	 * @see {@linkcode ColorInput}
	 */
	public get focusColor(): ColorInput {
		return this._focusColor;
	}

	/**
	 * The color the border of both the command and log boxes switch to on focus
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

	/** Sets the focus color to the bots accent color. */
	private async autoFocusColor(): Promise<void> {
		await client.user!.fetch();

		this._focusColor = client.user!.hexAccentColor ?? this.defaultFocusColor;

		if (this.splitBox) {
			this.splitBox.focusColor = this._focusColor;
		}
	}

	/** Prints a debug message to the log box. */
	public debug(...messages: any[]): void {
		this.logs?.debug(...messages);
	}

	/** Destroys the CLI renderer and closes the console handler. */
	public destroy(): void {
		this.renderer?.destroy();
	}

	/** Prints an error message to the log box. */
	public error(...messages: any[]): void {
		this.logs?.error(...messages);
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
	}

	/**
	 * Saves the logs to the specified directory or the default directory defined in
	 * {@linkcode configuration.paths.logPath}.
	 * @param path - The path to save the log file at
	 */
	public saveLogs(path?: Path) {
		this.logs?.saveLogs(path);
	}

	/** Prints a message of success to the log box */
	public success(...messages: any[]): void {
		this.logs?.success(...messages);
	}

	/** Updates the loaded console commands from local files */
	public async updateCommands(): Promise<void> {
		await this.commandInput?.updateCommands();
	}

	/** Prints awarning to the log box */
	public warn(...messages: any[]): void {
		this.logs?.warn(...messages);
	}
}
