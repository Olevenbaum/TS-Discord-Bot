// Type imports
import { Client, Team, TeamMemberMembershipState, User, userMention } from "discord.js";
import { Configuration } from "../types/configuration";

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
     */
    function notify(
        configuration: Configuration,
        type: "error" | "info" | "success" | "test" | "warning",
        consoleMessage: string,
        client: Client<true>,
        message: string
    ): void;

    /**
     * Prints console output
     * @param configuration The configuration of the project and bot
     * @param type The type of the message
     * @param consoleMessage The message to print to the console
     */
    function notify(
        configuration: Configuration,
        type: "error" | "info" | "success" | "test" | "warning",
        consoleMessage: string
    ): void;

    /**
     * Sends a message to the bot owner(s)
     * Use '@bot' to mention the bot, '@member' to mention the user, the message is sent to, '@owner' to mention the
     * bot owner(s) and '@team' to mention the bot owner team
     * @param configuration The configuration of the project and bot
     * @param type The type of the message
     * @param client The Discord bot client
     * @param message The message to send
     */
    function notify(
        configuration: Configuration,
        type: "error" | "info" | "success" | "test" | "warning",
        client: Client<true>,
        message: string
    ): void;
}

global.notify = async function (
    configuration: Configuration,
    type: "error" | "info" | "success" | "test" | "warning",
    x: Client<true> | string,
    y?: Client<true> | string,
    message?: string
): Promise<void> {
    // Check overload conditions
    if (typeof x === "string") {
        if (typeof y === "string") {
            // Throw type error
            throw new TypeError("Parameter 'client' must be of type 'Client'");
        }
    } else {
        if (typeof y !== "string") {
            // Throw type error
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
    message = typeof y === "string" ? y : message;

    // Check if client is given
    if (client) {
        // Fetch application data
        await client.application.fetch();
    }

    // Check if console message is given
    if (consoleMessage) {
        // Print console message
        switch (type) {
            case "error":
                console.error(`\x1b[31m ${consoleMessage} \x1b[0m`);
                break;
            case "info":
                console.info(`\x1b[34m ${consoleMessage} \x1b[0m`);
                break;
            case "success":
                console.log(`\x1b[32m ${consoleMessage} \x1b[0m`);
                break;
            case "test":
                console.log(consoleMessage);
                break;
            case "warning":
                console.warn(`\x1b[33m ${consoleMessage} \x1b[0m`);
                break;
        }
    }

    /**
     * Notification settings
     */
    const notifications = configuration.bot.notifications;

    // Check if notifications are enabled
    if (message && client && notifications) {
        // Check if notifications are enabled for the type
        if (typeof notifications !== "boolean" && !notifications.types?.includes(type)) {
            return;
        }

        // Replace placeholders in message
        const newMessage = message
            .replace("@bot", userMention(client.user.id))
            .replace(
                "@owner",
                client.application.owner instanceof User
                    ? userMention(client.application.owner.id)
                    : userMention(client.application.owner?.ownerId ?? "")
            )
            .replace("@team", client.application.owner instanceof Team ? client.application.owner.name : "");

        /**
         * Discord users to receive the notification
         */
        const receiver: User[] = [];

        // Check type of owner
        if (client.application.owner instanceof User) {
            // Add owner to receivers
            receiver.push(client.application.owner);
        } else if (client.application.owner instanceof Team) {
            // Iterate through team members
            for (const teamMember of client.application.owner.members.values()) {
                // Check if member is excluded
                if (
                    (typeof notifications !== "boolean" &&
                        (("excludedMembers" in notifications &&
                            notifications.excludedMembers?.includes(teamMember.user.id)) ||
                            ("excludedRoles" in notifications &&
                                notifications.excludedRoles?.includes(teamMember.role)))) ||
                    teamMember.membershipState === TeamMemberMembershipState.Invited
                ) {
                    continue;
                }

                // Add member to receivers
                receiver.push(teamMember.user);
            }
        } else {
            return;
        }

        // Send message to receivers
        Promise.all(receiver.map((user) => user.send(newMessage.replace("@member", userMention(user.id)))));
    }
};

export {};
