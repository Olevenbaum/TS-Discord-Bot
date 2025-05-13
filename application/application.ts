// Module imports
import fs from "fs";
import path from "path";

// Type imports
import "../extensions/array.extensions";
import { Client, DiscordAPIError, GatewayIntentBits } from "discord.js";
import { Configuration, SavedEventType } from "../types/interfaces";

// Global imports
import "../globals/pathRelativation";

const main = async (
    configuration: Configuration,
    applicationIndex: number = 0
): Promise<void> => {
    /**
     * Discord bot client
     */
    const client = new Client({
        intents: GatewayIntentBits.Guilds,
    });

    /**
     * Relative path to event types directory
     */
    const eventTypesPath = relativePath(configuration.project.eventTypesPath);

    /**
     * List of event type file names
     */
    const eventTypeFileNames = fs
        .readdirSync(eventTypesPath)
        .filter(
            (eventTypeFileName) => path.extname(eventTypeFileName) === ".ts" && !eventTypeFileName.endsWith(".d.ts")
        )
        .map((eventTypeFileName) => path.basename(eventTypeFileName, ".ts"));

    // Iterate event type file names
    eventTypeFileNames.forEach(async (eventTypeFileName) => {
        /**
         * Event type file
         */
        const eventType: SavedEventType = (await import(eventTypesPath + "/" + eventTypeFileName)).eventType; // TODO: preference path.join // TODO: Type check (if possible)

        // Check whether event type is called once
        if (eventType.once) {
            // Add once event listener
            client.once(eventType.type, (...args) => eventType.execute(configuration, ...args));
        } else {
            // Add event listener
            client.on(eventType.type, (...args) => eventType.execute(configuration, ...args));
        }
    });

    // Check if multiple bots are provided
    if (Array.isArray(configuration.bot.applications)) {
        // Shift applications to start with the given index
        configuration.bot.applications.rotate(applicationIndex);

        // Try to log in bot at Discord
        configuration.bot.applications.asyncFind(async (application): Promise<boolean> => {
            // Check if token could be valid
            if (application.token && configuration.project.tokenRegex.test(application.token)) {
                // Return whether token was accepted by Discord
                return await client
                    .login(application.token)
                    .then((returnedToken) => {
                        // Return whether token was correct
                        return application.token === returnedToken;
                    })
                    .catch((error: DiscordAPIError) => {
                        // TODO: Console output
                        // Check if error is caused by wrong token
                        // TODO: Rework error checking
                        if (
                            "code" in error &&
                            error.code.toString().toLowerCase().includes("token") &&
                            error.code.toString().toLowerCase().includes("invalid")
                        ) {
                            // TODO: Console output
                            // Return boolean based on configuration
                            return Boolean(configuration.bot.enableBotIteration);
                        } else {
                            // TODO: Console output
                            // Return false
                            return false;
                        }
                    });
            }
            // TODO: Console output
            // Return boolean based on configuration
            return Boolean(configuration.bot.enableBotIteration);
        });
    } else {
        // Try to log in bot at Discord
        client.login(configuration.bot.applications.token).catch((error: Error) => {
            console.error(error); // TODO: Console output
        });
    }
};

export { main };
