// Global imports
import "../globals/consoleCommandHandler";
import "../globals/fileReader";
import "../globals/notifications";

// Type imports
import "../extensions/array.extensions";
import { Client, DiscordAPIError, GatewayIntentBits } from "discord.js";
import { Configuration } from "../types/configuration";
import { SavedEventType } from "../types/interfaces";

const main = async (configuration: Configuration, applicationIndex: number = 0): Promise<void> => {
    /**
     * Discord bot client
     */
    const client = new Client({
        intents: GatewayIntentBits.Guilds,
    });

    // Notification
    notify(configuration, "info", "Bot is starting...");
    notify(configuration, "info", "Loading event types...");

    // Iterate through saved event types
    (await readFiles<SavedEventType>(configuration, configuration.project.eventTypesPath)).forEach((eventType) => {
        // Check whether event type is called once
        if (eventType.once) {
            // Add once event listener
            client.once(eventType.type, (...args) => eventType.execute(configuration, ...args));
        } else {
            // Add event listener
            client.on(eventType.type, (...args) => eventType.execute(configuration, ...args));
        }
    });

    // Notification
    notify(configuration, "success", "Event types loaded");

    // Check if multiple bots are provided
    if (Array.isArray(configuration.bot.applications)) {
        // Shift applications to start with the given index
        configuration.bot.applications.rotate(applicationIndex);

        // Try to log in bot at Discord
        const sucess = await configuration.bot.applications.asyncFind(async (application) => {
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
                        // Notification
                        notify(configuration, "error", error.message);

                        // Return boolean based on configuration
                        return Boolean(configuration.bot.enableBotIteration);
                    });
            }

            // Notification
            notify(
                configuration,
                "warning",
                `Invalid token provided for bot application with ID '${application.applicationId}'`
            );

            // Return boolean based on configuration
            return Boolean(configuration.bot.enableBotIteration);
        });

        // Check if no application was successful
        if (!sucess && configuration.bot.enableBotIteration) {
            // Notification
            notify(configuration, "warning", "Found no application with valid token");
        }
    } else {
        // Try to log in bot at Discord
        await client.login(configuration.bot.applications.token).catch((error: DiscordAPIError) => {
            // Notification
            notify(configuration, "error", error.message);
        });
    }

    // Handle console commands
    consoleCommandHandler(configuration, client);
};

export { main };
