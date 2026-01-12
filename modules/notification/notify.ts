// Data imports
import { cli, client } from "#application";
import { configuration } from "#variables";

// External libraries imports
import { Team, TeamMemberMembershipState, User, userMention } from "discord.js";

// Internal type imports
import { LogType } from "./classes";
import { LogLevel } from "./types";

/**
 * Sends a log message to the console.
 * @param message - Message to print
 * @param type - Type of the message
 * @see {@linkcode LogLevel}
 */
export default function notify(message: string, type: LogType | keyof typeof LogType): void;

/**
 * Sends an error message to the console.
 * @param error - The error to print
 * @see {@linkcode Error}
 */
export default function notify(error: Error): void;

/**
 * Sends an error message to the console.
 * @param message - Message to add context to the error
 * @param error - The error to print
 * @see {@linkcode Error}
 */
export default function notify(message: string, error: Error): void;

/**
 * Sends a log message to the console and to the owner(s) of the bot, if wanted.
 * @param message - Message to print to console and send to bot owner(s)
 * @param type - Type of the message
 * @param sendToDiscord - Whether to send the message to bot owner(s)
 * @param level - Level of the message sent to bot owner(s)
 * @see {@linkcode LogLevel} | {@linkcode LogType}
 */
export default function notify(
	message: string,
	type: LogType | keyof typeof LogType,
	sendToDiscord: boolean,
	level?: LogLevel,
): void;

/**
 * Sends an error message to the console and to the owner(s) of the bot, if wanted.
 * @param message - Message to add context to the error
 * @param error - The error to print and send to bot owner(s)
 * @param sendToDiscord - Whether to send the message to bot owner(s)
 * @param level - Level of the message sent to bot owner(s)
 * @see {@linkcode LogLevel} | {@linkcode LogType}
 */
export default function notify(message: string, error: Error, sendToDiscord: boolean, level?: LogLevel): void;

/**
 * Sends a log message to the console and to the owner(s) of the bot, if wanted.
 * @param message - Message to print to console
 * @param type - Type of the message
 * @param discordMessage - Message to send to bot owner(s)
 * @param level - Level of the message sent to bot owner(s)
 * @see {@linkcode LogLevel} | {@linkcode LogType}
 */
export default async function notify(
	message: string,
	type: LogType | keyof typeof LogType,
	discordMessage: string,
	level?: LogLevel,
): Promise<void>;

/**
 * Sends an error message to the console and to the owner(s) of the bot, if wanted.
 * @param message - Message to add context to the error
 * @param error - The error to print and send to bot owner(s)
 * @param discordMessage - Message to send to bot owner(s)
 * @param level - Level of the message sent to bot owner(s)
 * @see {@linkcode LogLevel} | {@linkcode LogType}
 */
export default async function notify(
	message: string,
	error: Error,
	discordMessage: string,
	level?: LogLevel,
): Promise<void>;

export default async function notify(
	message: string | Error,
	x: Error | LogType | keyof typeof LogType = LogType.ERROR,
	y?: string | boolean,
	level: LogLevel = 0,
): Promise<void> {
	const type = x instanceof Error ? LogType.ERROR : typeof x === "string" ? LogType[x] : x;

	switch (type) {
		case LogType.ERROR:
			if (x instanceof Error) {
				cli.error(message, x);

				break;
			}

			cli.error(message);

			break;

		case LogType.WARNING:
			cli.warn(message);

			break;

		case LogType.INFORMATION:
			cli.info(message);

			break;

		case LogType.SUCCESS:
			cli.success(message);

			break;

		default:
			cli.debug(message);
	}

	if (
		y &&
		client.isReady() &&
		configuration.bot.notifications &&
		!(
			typeof configuration.bot.notifications !== "boolean" &&
			(typeof configuration.bot.notifications === "number"
				? level < configuration.bot.notifications
				: !configuration.bot.notifications.types?.includes(type))
		)
	) {
		/** Message to send to bot owner or team members */
		const discordMessage = (typeof y === "string" ? y : (message as string))
			.replaceAll("@bot", userMention(client.user.id))
			.replaceAll(
				"@owner",
				client.application.owner instanceof User
					? userMention(client.application.owner.id)
					: userMention(client.application.owner?.ownerId ?? ""),
			)
			.replaceAll("@team", client.application.owner instanceof Team ? client.application.owner.name : "");

		/**
		 * Discord users to receive the notification
		 * @see {@linkcode User}
		 */
		const receivers: User[] = [];

		if (client.application.owner instanceof User) {
			receivers.push(client.application.owner);
		} else if (client.application.owner instanceof Team) {
			client.application.owner.members.forEach((teamMember) => {
				if (!["boolean", "number"].includes(typeof configuration.bot.notifications)) {
					receivers.push(teamMember.user);
					return;
				}

				if (
					(typeof configuration.bot.notifications !== "boolean" &&
						typeof configuration.bot.notifications !== "number" &&
						(("excludedMembers" in configuration.bot.notifications! &&
							configuration.bot.notifications.excludedMembers?.includes(teamMember.user.id)) ||
							("excludedRoles" in configuration.bot.notifications! &&
								configuration.bot.notifications.excludedRoles?.includes(teamMember.role)))) ||
					teamMember.membershipState === TeamMemberMembershipState.Invited
				) {
					return;
				}

				receivers.push(teamMember.user);
			});
		}

		await Promise.all(
			receivers.map((user) => user.send(discordMessage.replaceAll("@member", userMention(user.id)))),
		);
	}
}
