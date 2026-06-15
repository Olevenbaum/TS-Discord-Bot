// Class & type imports
import { Window } from "../../types";

// External library imports
import { BoxRenderable, CliRenderer, createCliRenderer, SelectRenderable } from "@opentui/core";
// import { If } from "discord.js";

// Internal class & type imports
import { CLIState } from "../../modules/cli/classes/CLIState";
import { CLIView } from "../../modules/cli/classes/CLIView";

type If<Value extends boolean, TrueResult, FalseResult = undefined> = Value extends true
	? TrueResult
	: Value extends false
		? FalseResult
		: TrueResult | FalseResult;

/**
 * Manages the console-based user interface for the Discord bot, providing a terminal-like experience for executing
 * commands and viewing logs. It creates a split-screen layout with command input at the top and log output below,
 * handling user interactions and system feedback.
 */
export class ConsoleHandler<Ready extends boolean = boolean> {
	/**
	 * @see {@linkcode CLIView}
	 * @see {@linkcode Window}
	 */
	private windows: Partial<Record<CLIView, Window>> = {};

	/**
	 * @see {@linkcode BoxRenderable}
	 */
	protected _cliLayout: If<Ready, BoxRenderable>;

	/**
	 * @see {@linkcode BoxRenderable}
	 */
	protected _contentArea: If<Ready, BoxRenderable>;

	/**
	 * @see {@linkcode SelectRenderable}
	 */
	protected _contextMenu: If<Ready, SelectRenderable>;

	/**
	 * @see {@linkcode SelectRenderable}
	 */
	protected _menu: If<Ready, SelectRenderable>;

	/**
	 * The CLI renderer responsible for drawing the interface and handling user input.
	 * @see {@linkcode CliRenderer}
	 */
	protected _renderer: If<Ready, CliRenderer>;

	/**
	 * Defaults to {@linkcode CLIState.UNINITIALIZED}
	 * @see {@linkcode CLIState}
	 */
	protected _state: CLIState = CLIState.UNINITIALIZED;

	/**
	 * @see {@linkcode CLIView}
	 */
	protected _view: CLIView = CLIView.OVERVIEW;

	/** Whether log messages should include the current date in their timestamps. Defaults to `false`. */
	protected includeDate: boolean = false;

	protected readonly ready: Ready;

	/**
	 * Creates a new console handler. If wanted, common console methods like {@linkcode console.debug},
	 * {@linkcode console.error}, {@linkcode console.info} and {@linkcode console.warn} can be replaced by matching
	 * intern console handler methods {@linkcode debug}, {@linkcode error}, {@linkcode info} and {@linkcode warn}.
	 *
	 * @param overwriteConsole - Whether to replace the logging methods with the matching intern console handler.
	 * Defaults to `true`.
	 * @param includeDate - Whether to include dates in log timestamps. Defaults to `false`.
	 */
	public constructor(overwriteConsole: boolean = true, includeDate: boolean = false) {
		this.ready = (this._state === CLIState.READY) as Ready;
		this.includeDate = includeDate;

		if (this.ready) {
			this._cliLayout = new BoxRenderable();
		}

		this._state = CLIState.INITIALIZING;

		createCliRenderer().then((renderer) => {
			this._renderer = renderer;

			this._state = CLIState.READY;
		});

		if (overwriteConsole) {
		}

		this.initialize();
	}

	public get renderer(): CliRenderer {
		return this._renderer;
	}

	/**
	 * The current state of the CLI.
	 * @see {@linkcode CLIState}
	 */
	public get state(): CLIState {
		return this._state;
	}

	/**
	 * The current window displayed by the CLI.
	 * @see {@linkcode CLIView}
	 */
	public get view(): CLIView {
		return this._view;
	}

	/**
	 * Prints a debugging message to the log display area.
	 * @param messages - The messages to log.
	 */
	public debug(...messages: any[]): void {}

	/** Destroys the CLI renderer and cleans up the console interface. */
	public destroy(): void {
		this._renderer?.destroy();
	}

	/**
	 * Prints an error message to the log display area.
	 * @param messages - The error messages to log.
	 */
	public error(...messages: any[]): void {}

	/**
	 * Prints an informational message to the log display area.
	 * @param messages - The informational messages to log.
	 */
	public info(...messages: any[]): void {}

	/**
	 * Initializes the console handler with a CLI renderer.
	 * @see {@linkcode CliRenderer}
	 */
	public async initialize(): Promise<void> {}

	/**
	 * Whether the CLI is ready.
	 * @returns - Whether the CLI is ready.
	 */
	public isReady(): this is ConsoleHandler<true> {
		return this.state === CLIState.READY;
	}

	/**
	 * Logs a success message to the console and updates the UI accordingly.
	 * @param messages - The success messages to log.
	 */
	public success(...messages: any[]): void {}

	/**
	 * Updates the loaded console commands from local files. This method refreshes the command input with the latest
	 * available commands from the filesystem.
	 */
	public async updateCommands(): Promise<void> {}

	/**
	 * Logs a warning message to the console and updates the UI accordingly.
	 * @param messages - The warning messages to log.
	 */
	public warn(...messages: any[]): void {}
}
