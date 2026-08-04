// Class & type imports
import type { If } from "#types";

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
	SelectOption,
	SelectRenderable,
	StyledText,
	white,
	yellow,
} from "@opentui/core";
import { Collection } from "discord.js";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import type { Path } from "typescript";

// Internal module imports
import { ButtonGroupRenderable } from "./ButtonGroupRenderable";
import { ButtonRenderable } from "./ButtonRenderable";
import { CLIView } from "./CLIView";
import type { BlankWindow, ConsoleCommand, LogEntry, Tag, Window } from "../types";

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
	 * @see {@linkcode Collection}
	 * @see {@linkcode ConsoleCommand}
	 */
	protected _commands: Collection<string, ConsoleCommand>;

	/**
	 * The logs of the last day.
	 * @see {@linkcode LogEntry}
	 */
	protected _logs: LogEntry[] = [];

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
	 * @see {@linkcode Collection}
	 * @see {@linkcode Window}
	 */
	protected windows: Collection<CLIView, Window>;

	/**
	 * Menu to select the content of the main area of the CLI.
	 * @see {@linkcode ButtonGroupRenderable}
	 */
	protected windowSelection?: ButtonGroupRenderable;

	/**
	 * Listeners that get notified when a new log is added. Calling listeners without any arguments can be used for
	 * special uses (e.g. clearing the logs).
	 * @see {@linkcode LogEntry}
	 */
	protected logListeners: ((log?: LogEntry) => void)[] = [];

	/**
	 * Creates a new console handler. If wanted, common console methods like {@linkcode console.debug},
	 * {@linkcode console.error}, {@linkcode console.info} and {@linkcode console.warn} can be replaced by matching
	 * intern console handler methods {@linkcode debug}, {@linkcode error}, {@linkcode info} and {@linkcode warn}.
	 * @param overwriteConsole Whether to replace the logging methods with the matching intern console handler
	 * functions. Defaults to `true`.
	 */
	public constructor(overwriteConsole: boolean = true) {
		this.ready = false as Ready;

		this._commands = new Collection();
		this.windows = new Collection();

		createCliRenderer().then(async (renderer) => {
			this._renderer = renderer;

			await readFiles<BlankWindow>(configuration.paths.windows).then((blankWindows) => {
				blankWindows.forEach((blankWindow) => {
					const [content, focusTarget] = blankWindow.createWindow(this as ConsoleHandler<true>);

					this.windows.set(blankWindow.id, {
						content,
						focusTarget: focusTarget ?? content,
						menuOptions: blankWindow.createMenuOptions?.(this as ConsoleHandler<true>) ?? [],
						...blankWindow,
					});
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
				titleAlignment: "center",
			});

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
				numKeyPress: true,
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

			this.switchWindow();

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
	 * @see {@linkcode Collection}
	 * @see {@linkcode ConsoleCommand}
	 */
	public get commands(): If<Ready, Collection<string, ConsoleCommand>> {
		return this._commands as If<Ready, Collection<string, ConsoleCommand>>;
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
	 * @param type Type of the message fragments.
	 * @param messages Message fragments to add to the log box.
	 * @see {@linkcode LogType}
	 */
	protected log(type: LogType, ...messages: any[]): void;

	/**
	 * Prints a log message to the log in the matching log type color. Messages are timstampted and automatically
	 * trigger a potential log save based on date changes.
	 * @param type Type of the message fragments.
	 * @param tags Tags describing the messages origin and / or purpose.
	 * @param messages Message fragments to add to the log box.
	 * @see {@linkcode LogType}
	 */
	protected log(type: LogType, tags: Tag[], ...messages: any[]): void;

	protected log(type: LogType, ...messages: any[]): void {
		if (configuration.bot.saveLogs !== false) {
			this.triggerSave();
		}

		/** Tags that describe the messages origin and / or purpose */
		const tags: Tag[] | undefined =
			Array.isArray(messages[0]) && messages[0].every((message) => message.startsWith("#"))
				? messages[0]
				: undefined;

		/** Timestamp of the current time */
		const timestamp = `[${getTime(true)}]: `;

		/** Log message ready for display and storage */
		const log: LogEntry = {
			content: new StyledText([
				white(timestamp),
				...messages
					.map((message) => {
						/** Messages split at every new line */
						const messageFragments = String(message).split("\n");

						switch (type) {
							case LogType.DEBUG:
								return messageFragments.map((messageFragment) => white(messageFragment));

							case LogType.ERROR:
								return message instanceof Error
									? messageFragments.map((messageFragment) => brightRed(messageFragment))
									: messageFragments.map((messageFragment) => red(messageFragment));

							case LogType.INFORMATION:
								return messageFragments.map((messageFragment) => blue(messageFragment));

							case LogType.SUCCESS:
								return messageFragments.map((messageFragment) => green(messageFragment));

							case LogType.WARNING:
								return messageFragments.map((messageFragment) => yellow(messageFragment));
						}
					})
					.flat()
					.map((message, index, messageFragments) =>
						index < messageFragments.length - 1
							? [message, white("\n".padEnd(timestamp.length + "\n".length, " "))]
							: [message, white("\n")],
					)
					.flat(),
			]),

			timestamp: new Date(),

			type,
		};

		if (tags) {
			log.tags = tags;
		}

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
		if (this.windows.has(window)) {
			/**
			 * The renderable content of the window to switch to
			 * @see {@linkcode Renderable}
			 */
			const nextWindow = this.windows.get(window)!;

			this.content!.title = `[ ${nextWindow.title} ]`;

			this.content!.remove(this.windows.get(this.view)!.content.id);
			this.content!.add(nextWindow.content);

			this.contextMenu!.getChildren().forEach((button) => {
				this.contextMenu!.remove(button.id);
			});
			nextWindow.menuOptions.forEach((button) => {
				this.contextMenu!.add(button);
			});

			process.nextTick(() => {
				this.view = window;
				nextWindow.focusTarget.focus();
				nextWindow.focusTarget.requestRender();
			});
		}
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
	public debug(...messages: any[]): void;

	/**
	 * Prints a debugging message to the log in white color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param tag Tags describing the messages origin and / or purpose.
	 * @param messages Message fragments to add to the log box.
	 */
	public debug(tags: Tag[], ...messages: any[]): void;

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
	public error(...messages: any[]): void;

	/**
	 * Prints an error message to the log. Error objects are highlighted in bright red, while text messages are printed
	 * in red. Messages are timestamped and automatically trigger a potential log save based on date changes.
	 * @param tag Tags describing the messages origin and / or purpose.
	 * @param messages Message fragments to add to the log box.
	 */
	public error(tags: Tag[], ...messages: any[]): void;

	public error(...messages: any[]): void {
		this.log(LogType.ERROR, ...messages);
	}

	/**
	 * Finds the command the user entered in {@linkcode _commands | commands}.
	 * @return The command the user entered
	 * @see {@linkcode ConsoleCommand}
	 */
	public findCommand(input: string): ConsoleCommand | undefined {
		input = input.trim();

		/** Command name without whitespace or parameters */
		const partialCommandName = input.slice(0, input.includes(" ") ? input.indexOf(" ") : undefined).toUpperCase();

		return this._commands.find(
			(command) =>
				command.name.toUpperCase() === partialCommandName ||
				command.aliases?.some((commandAlias) => commandAlias.toUpperCase() === partialCommandName),
		);
	}

	/**
	 * Prints an informational message to the log in blue color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param messages Message fragments to add to the log box.
	 */
	public info(...messages: any[]): void;

	/**
	 * Prints an informational message to the log in blue color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param tag Tags describing the messages origin and / or purpose.
	 * @param messages Message fragments to add to the log box.
	 */
	public info(tags: Tag[], ...messages: any[]): void;

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
	public registerLogListener(handler: (logEntry?: LogEntry) => void): void {
		this.logListeners.push(handler);
	}

	/**
	 * Saves the current logs to a local file.
	 * @param path The path of the file the logs should be saved in.
	 * @see {@linkcode Path}
	 */
	public saveLogs(path?: Path): void {
		/** Relative path to the directory to save the logs in */
		const logDirectory = relativePath(path ?? configuration.paths.logPath);

		if (!existsSync(logDirectory)) {
			mkdirSync(logDirectory, { recursive: true });
		}

		/** Path to the log file */
		const logPath = relativePath(
			`${path ?? configuration.paths.logPath}/${getTime(undefined, true)
				.replaceAll("/", "-")
				.split("")
				.join("")}.log` as Path,
		);

		/** Path to the `JSON` log file */
		const jsonLogPath = relativePath(
			`${path ?? configuration.paths.logPath}/${getTime(undefined, true)
				.replaceAll("/", "-")
				.split("")
				.join("")}.json` as Path,
		);

		try {
			appendFileSync(
				logPath,
				this._logs.map((logEntry) => logEntry.content.chunks.map((chunk) => chunk.text).join("")).join("\n"),
			);

			/** Old logs from the same day to append new logs to */
			const oldLogs: typeof this._logs = existsSync(jsonLogPath)
				? JSON.parse(readFileSync(jsonLogPath, "utf8").trim())
				: [];

			writeFileSync(jsonLogPath, JSON.stringify([...oldLogs, ...this._logs], undefined, 2), "utf8");

			this.lastSaveDate = new Date();

			this.clearLogs();

			this.success(`Logs saved to '${logPath}' and '${jsonLogPath}'`);
		} catch (error) {
			this.error(["#failedSave"], error);
		}
	}

	/**
	 * Prints a success message to the log in green color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param messages Message fragments to add to the log box.
	 */
	public success(...messages: any[]): void;

	/**
	 * Prints a success message to the log in green color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param tag Tags describing the messages origin and / or purpose.
	 * @param messages Message fragments to add to the log box.
	 */
	public success(tags: Tag[], ...messages: any[]): void;

	public success(...messages: any[]): void {
		this.log(LogType.SUCCESS, ...messages);
	}

	/**
	 * Creates suggestions for the user for what to enter based on what already was entered.
	 * @param input THe input the user already entered
	 * @returns Commands and / or parameters that match the input
	 * @see {@linkcode SelectOption}
	 */
	public suggestCommand(input?: string): SelectOption[] {
		/** Options the user might want to enter */
		const options: SelectOption[] = [];

		if (input) {
			input = input.trim();

			/** Command name without whitespace or parameters */
			const partialCommandName = input
				.slice(0, input.includes(" ") ? input.indexOf(" ") : undefined)
				.toUpperCase();

			if (input.includes(" ")) {
			} else {
				this._commands.forEach((command) => {
					if (command.name.toUpperCase().startsWith(partialCommandName)) {
						options.push({
							description: command.description,
							name: command.name,
							value: command.name.toUpperCase(),
						});
					}

					if (command.aliases) {
						command.aliases
							.map((commandAlias) => commandAlias.toUpperCase())
							.forEach((commandAlias) => {
								if (commandAlias.startsWith(partialCommandName)) {
									options.push({
										description: command.description,
										name: commandAlias,
										value: command.name.toUpperCase(),
									});
								}
							});
					}
				});
			}
		} else {
			this._commands.forEach((command) => {
				options.push({
					description: command.description,
					name: command.name,
					value: command.name.toUpperCase(),
				});

				if (command.aliases) {
					command.aliases
						.map((commandAlias) => commandAlias.toUpperCase())
						.forEach((commandAlias) => {
							options.push({
								description: command.description,
								name: commandAlias,
								value: command.name.toUpperCase(),
							});
						});
				}
			});
		}

		return options.sort((firstOption, secondOption) => firstOption.name.localeCompare(secondOption.name));
	}

	/**
	 * Triggers a log save operation if the current date differs from the date of the last logged message. This ensures
	 * logs are saved daily.
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
		(await readFiles<ConsoleCommand>(configuration.paths.consoleCommandsPath)).forEach((command) =>
			this._commands.set(command.name, command),
		);

		this._commands.sort((_, __, firstCommand, secondCommand) => firstCommand.localeCompare(secondCommand));
	}

	/** Updates all windows. Windows already set in the collection will be overwritten. */
	public async updateWindows(): Promise<void> {
		if (this.ready) {
			readFiles<BlankWindow>(configuration.paths.windows).then((windows) => {
				this.content?.remove(this.windows.get(this.view)!.content.id);

				windows.forEach((window) => {
					const [content, focusTarget] = window.createWindow(this as ConsoleHandler<true>);

					this.windows.set(window.id, {
						menuOptions: window.createMenuOptions?.(this as ConsoleHandler<true>) ?? [],
						content,
						focusTarget: focusTarget ?? content,
						...window,
					});
				});
				this.windows.sort((_, __, firstWindow, secondWindow) => firstWindow - secondWindow);

				this.content?.add(this.windows.get(this.view)!.content.id);
			});
		}
	}

	/**
	 * Prints a warning message to the log in yellow color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param messages Message fragments to add to the log box.
	 */
	public warn(...messages: any[]): void;

	/**
	 * Prints a warning message to the log in yellow color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param tag Tags describing the messages origin and / or purpose.
	 * @param messages Message fragments to add to the log box.
	 */
	public warn(tags: Tag[], ...messages: any[]): void;

	public warn(...messages: any[]): void {
		this.log(LogType.WARNING, ...messages);
	}
}
