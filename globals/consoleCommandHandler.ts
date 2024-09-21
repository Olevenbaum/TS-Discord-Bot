// Global imports
import "./fileReader";
import "./pathRelativation";
import "./fileUpdate";
import "./notifications";

// Module imports
import * as rl from "readline";

// Type imports
import { Client } from "discord.js";
import { Configuration } from "../types/configuration";
import { ConsoleCommand, NestedArray } from "../types/others";

declare global {
    /**
     * Handles any commands entered in the console while the bot is running
     * @param configuration The configuration of the project and bot
     * @param client The Discord bot client
     */
    function consoleCommandHandler(configuration: Configuration, client: Client): void;
}

global.consoleCommandHandler = async function (configuration: Configuration, client: Client) {
    /**
     * Commands for usage in the console
     */
    const commands = await readFiles<ConsoleCommand>(configuration, configuration.project.consoleCommandsPath);

    // Check if commands are available
    if (commands.length === 0) {
        // Exit function
        return;
    }

    /**
     * Readline interface
     */
    const rlInterface = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    // Ask user for command
    rlInterface.question("\x1b[35m Enter command: \x1b[0m", (consoleInput: string) => {
        /**
         * Slice console input to get the command name
         */
        const commandName = consoleInput
            .trim()
            .slice(0, consoleInput.includes(" ") ? consoleInput.indexOf(" ") : consoleInput.length);

        /**
         * Command that was called
         */
        const command = commands.find(
            (command) =>
                command.name.toUpperCase() === commandName.toUpperCase() ||
                (command.aliases &&
                    command.aliases.map((alias) => alias.toUpperCase()).includes(commandName.toUpperCase()))
        );

        if (!command) {
            // Notification
            notify(configuration, "error", `Found no command '${commandName}'`);

            // Exit function
            return;
        }

        /**
         * Values that were passed to the command
         */
        const values = transformParameters(consoleInput.trim().slice(commandName.length).trim());

        // Try to execute command
        try {
            command.execute(configuration, client, rlInterface, ...values);
        } catch (error) {
            // Check if error was thrown because of a false parameter
            if (error instanceof TypeError) {
                // Notification
                notify(
                    configuration,
                    "error",
                    `Command ${command.name} received parameter that could not be handled ${error.message}`
                );
            } else {
                // Forward error
                throw error;
            }
        }
    });

    const transformParameters = function (parameters: string): NestedArray<boolean | number | string> {
        // Return transformed parameters
        return parameters
            .trim()
            .split(" ")
            .map((value) => {
                value.trim();

                // Check type of value
                if (value === "true" || value === "false") {
                    // Return boolean
                    return Boolean(value);
                } else if (!isNaN(Number(value))) {
                    // Return number
                    return Number(value);
                } else if (value.startsWith("[") && value.endsWith("]")) {
                    // Return array
                    return transformParameters(value.slice(1, value.length - 1));
                } else {
                    // Return string
                    return value;
                }
            });
    };
};
