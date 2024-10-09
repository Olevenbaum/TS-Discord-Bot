// Global imports
import "../../globals/notifications";

// Type imports
import { Client } from "discord.js";
import { Interface } from "readline";
import { Configuration } from "../../types/configuration";
import { ConsoleCommand } from "../../types/others";

/**
 * Console command to terminate the bot and exit the console
 */
const consoleCommand: ConsoleCommand = {
    aliases: ["END", "EXIT"],

    description: "Terminates the bot and exits the console",

    name: "QUIT",

    usage: "quit",

    async execute(configuration: Configuration, client: Client<true>, rlInterface: Interface) {
        // Notification
        await notify(
            configuration,
            "info",
            "Shutting down...",
            client,
            `I'm tired and need to rest... See you! ZzZzZz...`
        );

        // Destroy the client and terminate the connection
        await client.destroy();

        // Close the readline interface
        rlInterface.close();
    },
};

export default consoleCommand;
