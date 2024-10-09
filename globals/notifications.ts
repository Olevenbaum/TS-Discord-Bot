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
    ): Promise<void>;

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
    ): Promise<void>;

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
    ): Promise<void>;
}

global.notify = async function (
    configuration: Configuration,
    type: "error" | "info" | "success" | "test" | "warning",
    x: Client<true> | string,
    y?: Client<true> | string,
    message?: string
): Promise<void> {
    // Check type of overload parameter
    if (typeof x === "string") {
        // Check type of overload parameter
        if (typeof y === "string") {
            // Throw type error
            throw new TypeError("Parameter 'client' must be of type 'Client'");
        }
    } else {
        // Check type of overload parameter
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

    // Check if client is provided
    if (client) {
        // Fetch application data
        await client.application.fetch();
    }

    // Check if console message is provided
    if (consoleMessage) {
        // Check message type
        switch (type) {
            case "error":
                // Print error message
                console.error(`\x1b[31m ${consoleMessage} \x1b[0m`);

                // Break switch
                break;

            case "info":
                // Print info message
                console.info(`\x1b[34m ${consoleMessage} \x1b[0m`);

                // Break switch
                break;

            case "success":
                // Print success message
                console.log(`\x1b[32m ${consoleMessage} \x1b[0m`);

                // Break switch
                break;

            case "test":
                // Print test message
                console.log(consoleMessage);

                // Break switch
                break;

            case "warning":
                // Print warning message
                console.warn(`\x1b[33m ${consoleMessage} \x1b[0m`);

                // Break switch
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
            // Exit function
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
            client.application.owner.members.forEach((teamMember) => {
                // Check if member is excluded
                if (
                    (typeof notifications !== "boolean" &&
                        (("excludedMembers" in notifications &&
                            notifications.excludedMembers?.includes(teamMember.user.id)) ||
                            ("excludedRoles" in notifications &&
                                notifications.excludedRoles?.includes(teamMember.role)))) ||
                    teamMember.membershipState === TeamMemberMembershipState.Invited
                ) {
                    // Continue to next member
                    return;
                }

                // Add member to receivers
                receiver.push(teamMember.user);
            });
        } else {
            // Exit function
            return;
        }

        // Send message to receivers
        await Promise.all(receiver.map((user) => user.send(newMessage.replace("@member", userMention(user.id)))));
    }
};

export {};
