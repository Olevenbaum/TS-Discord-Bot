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
import { writeFile } from "fs";
import type { Path } from "typescript";

// Module imports
import { getTime } from "../modules/time";

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
	 * @see {@linkcode TextOptions}
	 */
	constructor(ctx: RenderContext, includeDate: boolean = false, options: TextOptions = {}) {
		super(ctx, options);

		this.includeDate = includeDate;
	}

	/**
	 * Prints a debugging message to the log.
	 * @param messages - Message fragments to add to the log box
	 */
	debug(...messages: any[]) {
		this.add(new StyledText([white(`[${getTime()}]`), ...messages.map((message) => white(message.toString()))]));

		this.triggerSave();
	}

	/**
	 * Prints an error message to the log. Error objects are highlighted in bright red, text messages are
	 * printed in red.
	 * @param messages - Message fragments to add to the log box
	 */
	error(...messages: any[]) {
		this.add(
			new StyledText([
				white(`[${getTime()}]`),
				...messages.map((message) => {
					if (message instanceof Error) {
						return brightRed(message.toString());
					}

					return red(message.toString());
				}),
			]),
		);

		this.triggerSave();
	}

	/**
	 * Prints an informational message to the log. The message is printed in blue.
	 * @param messages - Message fragments to add to the log box
	 */
	info(...messages: any[]) {
		this.add(new StyledText([white(`[${getTime()}]`), ...messages.map((message) => blue(message.toString()))]));

		this.triggerSave();
	}

	/**
	 * Saves all message currently present in the log to a file and clears the log.
	 * @param path - Path to save the log file to
	 */
	saveLogs(path?: Path) {
		writeFile(
			`${path ?? configuration.paths.logPath}${getTime(undefined, true)}.log`,
			this.content.chunks.join("\n"),
			(error) => this.error(error),
		);

		this.content.chunks = [];
	}

	/**
	 * Prints a message of success to the log. The message is printed in green.
	 * @param messages - Message fragments to add to the log box
	 */
	success(...messages: any[]) {
		this.add(new StyledText([white(`[${getTime()}]`), ...messages.map((message) => green(message.toString()))]));

		this.triggerSave();
	}

	/**
	 * Prints a warning to the log box. The warning is printed in yellow.
	 * @param messages - Message fragments to add to the log box
	 */
	warn(...messages: any[]) {
		this.add(new StyledText([white(`[${getTime()}]`), ...messages.map((message) => yellow(message.toString()))]));

		this.triggerSave();
	}

	/**
	 * Triggers a save if the current date differs from the date of the last sent message and updates the date
	 * of the last sent message.
	 */
	triggerSave(): void {
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
