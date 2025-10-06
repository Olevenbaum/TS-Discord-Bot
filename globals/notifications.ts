// Global imports
import "./date";

// Type imports
import { Client, Team, TeamMemberMembershipState, User, userMention } from "discord.js";
import { Configuration } from "../types/configuration";
import { NotificationImportance } from "../types/others";

declare global {
	/**
	 * Prints console output and sends a message to the bot owner(s)
	 * Use '@bot' to mention the bot, '@member' to mention the user, the message is sent to, '@owner' to mention the
	 * bot owner(s) and '@team' to mention the bot owner team
	 * @param configuration The configuration of the project and bot
	 * @param type The type of the message
	 * @param consoleMessage The message to print to the console
	 * @param client The Discord bot client
	 * @param message The message to send
	 * @param importance The importance of the message
	 */
	function notify(
		configuration: Configuration,
		type: "ERROR" | "INFO" | "SUCCESS" | "TEST" | "WARNING",
		consoleMessage: string,
		client: Client<true>,
		message: string,
		importance?: NotificationImportance,
	): Promise<void>;

	/**
	 * Prints console output
	 * @param configuration The configuration of the project and bot
	 * @param type The type of the message
	 * @param consoleMessage The message to print to the console
	 */
	function notify(
		configuration: Configuration,
		type: "ERROR" | "INFO" | "SUCCESS" | "TEST" | "WARNING",
		consoleMessage: string,
	): Promise<void>;

	/**
	 * Sends a message to the bot owner(s)
	 * Use '@bot' to mention the bot, '@member' to mention the user, the message is sent to, '@owner' to mention the
	 * bot owner(s) and '@team' to mention the bot owner team
	 * @param configuration The configuration of the project and bot
	 * @param type The type of the message
	 * @param client The Discord bot client
	 * @param message The message to send
	 * @param importance The importance of the message
	 */
	function notify(
		configuration: Configuration,
		type: "ERROR" | "INFO" | "SUCCESS" | "TEST" | "WARNING",
		client: Client<true>,
		message: string,
		importance?: NotificationImportance,
	): Promise<void>;
}

global.notify = async function (
	configuration: Configuration,
	type: "ERROR" | "INFO" | "SUCCESS" | "TEST" | "WARNING",
	x: Client<true> | string,
	y?: Client<true> | string,
	z?: NotificationImportance | string,
	importance?: NotificationImportance,
): Promise<void> {
	// Check type of overload parameter
	if (typeof x === "string") {
		if (typeof y === "string") {
			throw new TypeError("Parameter 'client' must be of type 'Client'");
		}
	} else {
		// Check type of overload parameter
		if (typeof y !== "string") {
			throw new TypeError("Parameter 'message' must be of type 'string'");
		}
	}

	/**
	 * Overload parameter
	 */
	const client = typeof x === "string" ? (typeof y === "string" ? undefined : y) : x;

	/**
	 * Overload parameter
	 */
	const consoleMessage = typeof x === "string" ? x : undefined;

	/**
	 * Overload parameter
	 */
	const message = typeof y === "string" ? y : typeof z === "string" ? z : undefined;

	/**
	 * Overload parameter
	 */
	importance = (typeof z === "string" ? importance : z) ?? 0;

	// Check if client is provided
	if (client) {
		await client.application.fetch();
	}

	// Check if console message is provided
	if (consoleMessage) {
		switch (type) {
			case "ERROR":
				console.error(`[${getTime()}] \x1b[31m ${consoleMessage} \x1b[0m`);

				break;

			case "INFO":
				console.info(`[${getTime()}] \x1b[34m ${consoleMessage} \x1b[0m`);

				break;

			case "SUCCESS":
				console.log(`[${getTime()}] \x1b[32m ${consoleMessage} \x1b[0m`);

				break;

			case "TEST":
				console.log(`[${getTime()}] ${consoleMessage}`);

				break;

			case "WARNING":
				console.warn(`[${getTime()}] \x1b[33m ${consoleMessage} \x1b[0m`);

				break;
		}
	}

	/**
	 * Notification settings
	 */
	const notifications = configuration.bot.notifications;

	// Check if notifications are enabled
	if (message && client && notifications) {
		// Check if notifications are enabled for the type and importance of message
		if (
			typeof notifications !== "boolean" &&
			(typeof notifications === "number" ? importance < notifications : !notifications.types?.includes(type))
		) {
			return;
		}

		const newMessage = message
			.replace("@bot", userMention(client.user.id))
			.replace(
				"@owner",
				client.application.owner instanceof User
					? userMention(client.application.owner.id)
					: userMention(client.application.owner?.ownerId ?? ""),
			)
			.replace("@team", client.application.owner instanceof Team ? client.application.owner.name : "");

		/**
		 * Discord users to receive the notification
		 */
		const receiver: User[] = [];

		// Check type of owner
		if (client.application.owner instanceof User) {
			receiver.push(client.application.owner);
		} else if (client.application.owner instanceof Team) {
			client.application.owner.members.forEach((teamMember) => {
				// Check if member is excluded
				if (
					(typeof notifications !== "boolean" &&
						typeof notifications !== "number" &&
						(("excludedMembers" in notifications &&
							notifications.excludedMembers?.includes(teamMember.user.id)) ||
							("excludedRoles" in notifications &&
								notifications.excludedRoles?.includes(teamMember.role)))) ||
					teamMember.membershipState === TeamMemberMembershipState.Invited
				) {
					return;
				}

				receiver.push(teamMember.user);
			});
		} else {
			return;
		}

		await Promise.all(receiver.map((user) => user.send(newMessage.replace("@member", userMention(user.id)))));
	}
};

export {};
