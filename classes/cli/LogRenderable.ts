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
import { appendFile } from "fs";
import type { Path } from "typescript";

// Module imports
import { relativePath } from "../../modules/fileReader";
import { getTime } from "../../modules/time";

/**
 * @see {@linkcode TextRenderable}
 */
export class LogRenderable extends TextRenderable {
	/** Whether each log messages timestamp includes the current date */
	protected includeDate: boolean;

	/** Timestamp only including the date (year, month and day of the month) of last printed log message */
	protected lastMessageDate?: Date;

	/**
	 * @param ctx - CLI renderer
	 * @param options - Options to alter the text
	 * @see {@linkcode RenderContext} | {@linkcode TextOptions}
	 */
	constructor(ctx: RenderContext, includeDate: boolean = false, options: TextOptions = {}) {
		super(ctx, options);

		this.includeDate = includeDate;
	}

	/**
	 * Prints a debugging message to the log.
	 * @param messages - Message fragments to add to the log box
	 */
	public debug(...messages: any[]) {
		this.add(
			new StyledText([
				white(`[${getTime(!this.includeDate)}]: `),
				...messages.map((message) => white(`${message.toString()}\n`)),
			]),
		);

		this.triggerSave();
	}

	/**
	 * Prints an error message to the log. Error objects are highlighted in bright red, text messages are
	 * printed in red.
	 * @param messages - Message fragments to add to the log box
	 */
	public error(...messages: any[]) {
		this.add(
			new StyledText([
				white(`[${getTime(!this.includeDate)}]: `),
				...messages.map((message) => {
					if (message instanceof Error) {
						return brightRed(`${message.toString()}\n`);
					}

					return red(`${message.toString()}\n`);
				}),
			]),
		);

		this.triggerSave();
	}

	/**
	 * Prints an informational message to the log. The message is printed in blue.
	 * @param messages - Message fragments to add to the log box
	 */
	public info(...messages: any[]) {
		this.add(
			new StyledText([
				white(`[${getTime(!this.includeDate)}]: `),
				...messages.map((message) => blue(`${message.toString()}\n`)),
			]),
		);

		this.triggerSave();
	}

	/**
	 * Saves the logs to the specified directory or the default directory defined in
	 * {@linkcode configuration.paths.logPath}.
	 * @param path - The path to save the log file at
	 */
	public saveLogs(path?: Path) {
		/** Absolute path to the log file */
		const absolutePath = relativePath(
			`${path ?? configuration.paths.logPath}/${getTime(undefined, true)
				.replaceAll("/", "-")
				.split("")
				.reverse()
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
	 * Prints a message of success to the log. The message is printed in green.
	 * @param messages - Message fragments to add to the log box
	 */
	public success(...messages: any[]) {
		this.add(
			new StyledText([
				white(`[${getTime(!this.includeDate)}]: `),
				...messages.map((message) => green(`${message.toString()}\n`)),
			]),
		);

		this.triggerSave();
	}

	/**
	 * Prints a warning to the log box. The warning is printed in yellow.
	 * @param messages - Message fragments to add to the log box
	 */
	public warn(...messages: any[]) {
		this.add(
			new StyledText([
				white(`[${getTime(!this.includeDate)}]: `),
				...messages.map((message) => yellow(`${message.toString()}\n`)),
			]),
		);

		this.triggerSave();
	}

	/**
	 * Triggers a save if the current date differs from the date of the last sent message and updates the date
	 * of the last sent message.
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
