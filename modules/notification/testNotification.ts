// Data imports
import { configuration } from "#variables";

// Internal class & type imports
import { LogType } from "./classes";
import { LogLevel } from "./types";

/**
 * Evaluates whether the owner(s) of the bot should receive the log messages on Discord directly.
 * @param type - The type of the log message.
 * @param level - The level of the log message.
 * @returns Whether notifications are enabled for this specific message
 * @see {@linkcode LogLevel}
 * @see {@linkcode LogType}
 */
export default function testNotification(type: LogType, level: LogLevel): boolean {
	switch (typeof configuration.bot.notifications) {
		case "boolean":
			return configuration.bot.notifications;

		case "number":
			return level >= configuration.bot.notifications;

		case "object":
			return (
				(configuration.bot.notifications.types?.includes(type) ?? true) &&
				level >= (configuration.bot.notifications.minImportance ?? 0)
			);

		default:
			return true;
	}
}
