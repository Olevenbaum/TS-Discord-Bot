// Class & type imports
import type { ConsoleCommand, If } from "#types";

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
import { access, appendFile, mkdirSync } from "fs";
import type { Path } from "typescript";

// Internal module imports
import { CLIState } from "./CLIState";
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
	 * @see {@linkcode ConsoleCommand}
	 */
	protected _commands?: ConsoleCommand[];

	/**
	 * The CLI renderer responsible for drawing the interface and handling user input.
	 * @see {@linkcode CliRenderer}
	 */
	protected _renderer?: CliRenderer;

	/**
	 * Defaults to {@linkcode CLIState.UNINITIALIZED}
	 * @see {@linkcode CLIState}
	 */
	protected _state: CLIState = CLIState.UNINITIALIZED;

	/**
	 * The main area for visualization of content.
	 * @see {@linkcode BoxRenderable}
	 */
	protected contentArea?: BoxRenderable;

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
	 * The logs of the last day.
	 * @see {@linkcode StyledText}
	 */
	protected logs: StyledText[] = [];

	/**
	 * @see {@linkcode CLIView}
	 */
	protected view: CLIView = CLIView.OVERVIEW;

	/**
	 * Windows that can be selected to be shown in the main area of the CLI.
	 * @see {@linkcode CLIView}
	 * @see {@linkcode Window}
	 */
	protected windows: Partial<Record<CLIView, Window>> = {};

	/**
	 * Menu to select the content of the main area of the CLI.
	 * @see {@linkcode SelectRenderable}
	 */
	protected windowSelection?: SelectRenderable;

	/**
	 * Creates a new console handler. If wanted, common console methods like {@linkcode console.debug},
	 * {@linkcode console.error}, {@linkcode console.info} and {@linkcode console.warn} can be replaced by matching
	 * intern console handler methods {@linkcode debug}, {@linkcode error}, {@linkcode info} and {@linkcode warn}.
	 * @param overwriteConsole Whether to replace the logging methods with the matching intern console handler
	 * functions. Defaults to `true`.
	 */
	public constructor(overwriteConsole: boolean = true) {
		this._state = CLIState.INITIALIZING;

		createCliRenderer().then(async (renderer) => {
			this._renderer = renderer;

			await readFiles<BlankWindow>(configuration.paths.windows).then((blankWindows) => {
				for (const blankWindow of blankWindows) {
					/**
					 * Window with content
					 * @see {@linkcode Window}
					 */
					const window: Window = { ...blankWindow, content: blankWindow.create(this, {}) };

					this.windows[window.id] = window;
				}
			});
			/**
			 * The base or "root" every other {@linkcode Renderable} is added to.
			 * @see {@linkcode BoxRenderable}
			 */
			const base = new BoxRenderable(this._renderer, {
				flexDirection: "column",
				flexGrow: 1,
			});

			const topRow = new BoxRenderable(this._renderer, {
				flexDirection: "row-reverse",
				flexGrow: 1,
			});

			this.contentArea = new BoxRenderable(this._renderer, {
				border: true,
				borderStyle: "rounded",
				flexGrow: 1,
			});

			const windowSelectionBox = new BoxRenderable(this._renderer, {
				border: true,
				borderStyle: "rounded",
				width: 15,
			});

			this.windowSelection = new SelectRenderable(this._renderer, {
				options: Object.entries(this.windows).map(([_, window]) => {
					return { name: window.title, description: window.description, value: window.id };
				}),
			});

			windowSelectionBox.add(this.windowSelection);

			topRow.add(windowSelectionBox);
			topRow.add(this.contentArea);

			this.contextMenu = new BoxRenderable(this._renderer, {
				border: true,
				borderStyle: "rounded",
				height: 5,
			});

			base.add(topRow);
			base.add(this.contextMenu);

			this._renderer.root.add(base);

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

	/**
	 * The base renderer for the CLI.
	 * @see {@linkcode CliRenderer}
	 */
	public get renderer(): If<Ready, CliRenderer> {
		return this._renderer as If<Ready, CliRenderer>;
	}

	/**
	 * The current state of the console handler.
	 * @see {@linkcode CLIState}
	 */
	public get state(): CLIState {
		return this._state;
	}

	/** Changes the {@linkcode _state | state} of the console handler. */
	protected changeReadyState(): void {
		if (this._renderer && Object.keys(this.windows).length > 0 && this._commands) {
			this._state = CLIState.READY;
		} else if (this.renderer?.isDestroyed) {
			this._state = CLIState.DESTROYED;
		} else {
			this._state = CLIState.UNINITIALIZED;
		}
	}

	/**
	 * Changes the current window to the window with provided ID.
	 * @param window The window to show. Defaults to {@linkcode CLIView.OVERVIEW}.
	 * @see {@linkcode CLIView}
	 */
	protected changeWindow(window: CLIView = CLIView.OVERVIEW): void {
		if (this.isReady() && window !== this.view && window in Object.keys(this.windows)) {
			this.contentArea = this.windows[window]!.content;
			this.view = window;
		}
	}

	/** Clears the {@linkcode logs} of the console handler. */
	public clearLogs(): void {
		this.logs = [];
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
		this._state = CLIState.DESTROYED;
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
		return this._state === CLIState.READY;
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
		const timestamp = `[${getTime(true)}]`;

		this.logs.push(
			new StyledText([
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
			]),
		);
	}

	/**
	 * Saves the current logs to a local file.
	 * @param path The path of the file the logs should be saved in.
	 * @see {@linkcode Path}
	 */
	public saveLogs(path?: Path): void {
		access(relativePath(path ?? configuration.paths.logPath), () =>
			mkdirSync(relativePath(path ?? configuration.paths.logPath)),
		);

		/** Path to the log file */
		const logPath = relativePath(
			`${path ?? configuration.paths.logPath}/${getTime(undefined, true)
				.replaceAll("/", "-")
				.split("")
				.join("")}.log` as Path,
		);

		appendFile(logPath, this.logs.map((logEntry) => logEntry.chunks.join(" ")).join("\n"), (error) => {
			if (error) {
			} else {
				this.clearLogs();
			}
		});
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

			this.lastSaveDate = currentDate;
		}
	}

	/** Updates all console commands that can be used. Every call after the first overwrite any old console commands. */
	public async updateCommands(): Promise<void> {
		this._commands = await readFiles<ConsoleCommand>(configuration.paths.consoleCommandsPath);

		this.changeReadyState();
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
