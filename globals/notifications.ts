// Global imports
import "./date";
import { configuration } from "./variables";

// Type imports
import { Client, Team, TeamMemberMembershipState, User, userMention } from "discord.js";
import { NotificationImportance } from "../types/others";

declare global {
	/**
	 * Prints console output and sends a message to the bot owner(s)
	 * Use '@bot' to mention the bot, '@member' to mention the user, the message is sent to, '@owner' to mention the
	 * bot owner(s) and '@team' to insert the bot owner team's name
	 * @param type The type of the message
	 * @param consoleMessage The message to print to the console
	 * @param client The Discord bot client
	 * @param message The message to send
	 * @param importance The importance of the message
	 * @see {@link Client} | {@link NotificationImportance}
	 */
	function notify(
		type: "ERROR" | "INFO" | "SUCCESS" | "TEST" | "WARNING",
		consoleMessage: string,
		client: Client<true>,
		message: string,
		importance?: NotificationImportance,
	): Promise<void>;

	/**
	 * Prints console output
	 * @param type The type of the message
	 * @param consoleMessage The message to print to the console
	 */
	function notify(type: "ERROR" | "INFO" | "SUCCESS" | "TEST" | "WARNING", consoleMessage: string): Promise<void>;

	/**
	 * Sends a message to the bot owner(s)
	 * Use '@bot' to mention the bot, '@member' to mention the user, the message is sent to, '@owner' to mention the
	 * bot owner(s) and '@team' to mention the bot owner team
	 * @param type The type of the message
	 * @param client The Discord bot client
	 * @param message The message to send
	 * @param importance The importance of the message
	 * @see {@link Client} | {@link NotificationImportance}
	 */
	function notify(
		type: "ERROR" | "INFO" | "SUCCESS" | "TEST" | "WARNING",
		client: Client<true>,
		message: string,
		importance?: NotificationImportance,
	): Promise<void>;
}

global.notify = async function (
	type,
	x: Client<true> | string,
	y?: Client<true> | string,
	z?: NotificationImportance | string,
	importance: NotificationImportance = 0,
) {
	if (typeof x === "string") {
		if (typeof y === "string") {
			throw TypeError("Parameter 'client' must be of type 'Client'");
		}
	} else {
		if (typeof y !== "string") {
			throw TypeError("Parameter 'message' must be of type 'string'");
		}
	}

	/** Timestamp */
	const timestamp = getTime(configuration.bot.logDate);

	/** Client overload parameter */
	const client = typeof x === "string" ? (typeof y === "string" ? undefined : y) : x;

	/** Console message overload parameter */
	const consoleMessage = (typeof x === "string" ? x : undefined)?.replaceAll(
		"\n",
		"\n" + " ".repeat(timestamp.length + 4),
	);

	/** Message overload parameter */
	const message = typeof y === "string" ? y : typeof z === "string" ? z : undefined;

	importance = (typeof z === "string" ? importance : z) ?? 0;

	if (client) {
		await client.application.fetch();
	}

	if (consoleMessage) {
		switch (type) {
			case "ERROR":
				console.error(`[${timestamp}] \x1b[31m ${consoleMessage} \x1b[0m`);

				break;

			case "INFO":
				console.info(`[${timestamp}] \x1b[34m ${consoleMessage} \x1b[0m`);

				break;

			case "SUCCESS":
				console.log(`[${timestamp}] \x1b[32m ${consoleMessage} \x1b[0m`);

				break;

			case "TEST":
				console.log(`[${timestamp}] ${consoleMessage}`);

				break;

			case "WARNING":
				console.warn(`[${getTime()}] \x1b[33m ${consoleMessage} \x1b[0m`);

				break;

			default:
				throw TypeError("Parameter 'type' must be one of 'ERROR', 'INFO', 'SUCCESS', 'TEST' or 'WARNING'");
		}
	}

	/** Notification preferences from configuration */
	const notificationsPreference = configuration.bot.notifications;

	if (
		message &&
		client &&
		notificationsPreference &&
		!(
			typeof notificationsPreference !== "boolean" &&
			(typeof notificationsPreference === "number"
				? importance < notificationsPreference
				: !notificationsPreference.types?.includes(type))
		)
	) {
		/** Formatted message with mentions */
		const formattedMessage = message
			.replace("@bot", userMention(client.user.id))
			.replace(
				"@owner",
				client.application.owner instanceof User
					? userMention(client.application.owner.id)
					: userMention(client.application.owner?.ownerId ?? ""),
			)
			.replace("@team", client.application.owner instanceof Team ? client.application.owner.name : "");

		/** Discord users to receive the notification */
		const receivers: User[] = [];

		if (client.application.owner instanceof User) {
			receivers.push(client.application.owner);
		} else if (client.application.owner instanceof Team) {
			client.application.owner.members.forEach((teamMember) => {
				if (!["boolean", "number"].includes(typeof notificationsPreference)) {
					receivers.push(teamMember.user);
					return;
				}

				if (
					(typeof notificationsPreference !== "boolean" &&
						typeof notificationsPreference !== "number" &&
						(("excludedMembers" in notificationsPreference &&
							notificationsPreference.excludedMembers?.includes(teamMember.user.id)) ||
							("excludedRoles" in notificationsPreference &&
								notificationsPreference.excludedRoles?.includes(teamMember.role)))) ||
					teamMember.membershipState === TeamMemberMembershipState.Invited
				) {
					return;
				}

				receivers.push(teamMember.user);
			});
		}

		await Promise.all(
			receivers.map((user) => user.send(formattedMessage.replace("@member", userMention(user.id)))),
		);
	}
};

export {};
