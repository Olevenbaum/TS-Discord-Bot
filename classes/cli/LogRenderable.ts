// Data imports
import { configuration } from "#variables";

// External libraries imports
import {
	blue,
	brightRed,
	green,
	red,
	type RenderContext,
	StyledText,
	type TextOptions,
	TextRenderable,
	white,
	yellow,
} from "@opentui/core";
import { access, appendFile, mkdirSync } from "fs";
import type { Path } from "typescript";

// Module imports
import { relativePath } from "../../modules/fileReader";
import getTime from "../../modules/time";

/**
 * A renderable component for displaying console logs with timestamped messages in different colors based on log levels.
 * Extends TextRenderable to provide logging functionality with automatic file saving capabilities.
 * @see {@linkcode TextRenderable}
 */
export class LogRenderable extends TextRenderable {
	/** Whether each log message's timestamp includes the current date */
	protected includeDate: boolean;

	/** Timestamp only including the date (year, month and day of the month) of the last printed log message */
	protected lastMessageDate?: Date;

	/**
	 * Creates a new LogRenderable instance for displaying timestamped console logs.
	 * @param ctx - The CLI renderer context used for rendering the log component.
	 * @param includeDate - Whether to include the date in log timestamps (default: `false`).
	 * @param options - Additional options to customize the text rendering.
	 * @see {@linkcode RenderContext}
	 * @see {@linkcode TextOptions}
	 */
	constructor(ctx: RenderContext, includeDate: boolean = false, options: TextOptions = {}) {
		super(ctx, options);

		this.includeDate = includeDate;
	}

	/**
	 * Prints a debugging message to the log in white color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param messages - Message fragments to add to the log box.
	 */
	public debug(...messages: any[]) {
		/** Timestamp */
		const timestamp = getTime(!this.includeDate);

		this.add(
			new StyledText([
				white(`[${timestamp}]: `),
				...messages.map((message) =>
					white(`${message.toString()}\n`.replaceAll("\n", "\n".padStart(timestamp.length, " "))),
				),
			]),
		);

		this.triggerSave();
	}

	/**
	 * Prints an error message to the log. Error objects are highlighted in bright red, while text messages are printed
	 * in red. Messages are timestamped and automatically trigger a potential log save based on date changes.
	 * @param messages - Message fragments to add to the log box.
	 */
	public error(...messages: any[]) {
		/** Timestamp */
		const timestamp = getTime(!this.includeDate);

		this.add(
			new StyledText([
				white(`[${timestamp}]: `),
				...messages.map((message) => {
					if (message instanceof Error) {
						return brightRed(
							`${message.toString()}\n`.replaceAll("\n", "\n".padStart(timestamp.length, " ")),
						);
					}

					return red(`${message.toString()}\n`);
				}),
			]),
		);

		this.triggerSave();
	}

	/**
	 * Prints an informational message to the log in blue color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param messages - Message fragments to add to the log box.
	 */
	public info(...messages: any[]) {
		/** Timestamp */
		const timestamp = getTime(!this.includeDate);

		this.add(
			new StyledText([
				white(`[${timestamp}]: `),
				...messages.map((message) =>
					blue(`${message.toString()}\n`.replaceAll("\n", "\n".padStart(timestamp.length, " "))),
				),
			]),
		);

		this.triggerSave();
	}

	/**
	 * Saves the current log contents to a file. Uses the specified path or falls back to the configured log directory.
	 * The filename includes a timestamp for uniqueness.
	 * @param path - Optional path where to save the log file.
	 */
	public saveLogs(path?: Path) {
		if (configuration.bot.saveLogs === false) {
			return;
		}

		this.debug(relativePath(path ?? configuration.paths.logPath));

		access(relativePath(path ?? configuration.paths.logPath), () =>
			mkdirSync(relativePath(path ?? configuration.paths.logPath)),
		);

		/** Absolute path to the log file */
		const absolutePath = relativePath(
			`${path ?? configuration.paths.logPath}/${getTime(undefined, true)
				.replaceAll("/", "-")
				.split("")
				.join("")}.log`,
		);

		appendFile(
			absolutePath,
			this.rootTextNode
				.toChunks()
				.map((chunk) => chunk.text)
				.join(""),
			(error) => {
				if (error) {
					this.error(error);
				} else {
					// this.clear();

					this.info(`Logs saved to '${absolutePath}'`);
				}
			},
		);
	}

	/**
	 * Prints a success message to the log in green color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param messages - Message fragments to add to the log box.
	 */
	public success(...messages: any[]) {
		/** Timestamp */
		const timestamp = getTime(!this.includeDate);

		this.add(
			new StyledText([
				white(`[${timestamp}]: `),
				...messages.map((message) =>
					green(`${message.toString()}\n`.replaceAll("\n", "\n".padStart(timestamp.length, " "))),
				),
			]),
		);

		this.triggerSave();
	}

	/**
	 * Prints a warning message to the log in yellow color. Messages are timestamped and automatically trigger a
	 * potential log save based on date changes.
	 * @param messages - Message fragments to add to the log box.
	 */
	public warn(...messages: any[]) {
		/** Timestamp */
		const timestamp = getTime(!this.includeDate);

		this.add(
			new StyledText([
				white(`[${timestamp}]: `),
				...messages.map((message) =>
					yellow(`${message.toString()}\n`.replaceAll("\n", "\n".padStart(timestamp.length, " "))),
				),
			]),
		);

		this.triggerSave();
	}

	/**
	 * Triggers a log save operation if the current date differs from the date of the last logged message. This ensures
	 * logs are saved daily. Updates the last message date after checking.
	 */
	public triggerSave(): void {
		/** Current date and time */
		const now = new Date();

		/** Current date (year, month and day of month) */
		const currentDate = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

		/** Date of the day after the last printed log message */
		const nextDayDate = new Date(this.lastMessageDate ?? currentDate);

		nextDayDate.setDate(nextDayDate.getDate() + 1);

		if (currentDate >= nextDayDate) {
			this.saveLogs();

			this.lastMessageDate = currentDate;
		}
	}
}
