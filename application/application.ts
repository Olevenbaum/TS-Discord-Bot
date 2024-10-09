// Global imports
import "../globals/consoleCommandHandler";
import "../globals/eventTypeUpdate";
import "../globals/fileReader";
import "../globals/notifications";

// Type imports
import "../extensions/array.extensions";
import { Client, DiscordAPIError, GatewayIntentBits } from "discord.js";
import { Configuration } from "../types/configuration";

const main = async (configuration: Configuration, applicationIndex: number = 0): Promise<void> => {
    /**
     * Discord bot client
     */
    const client = new Client({
        intents: GatewayIntentBits.Guilds,
    });

    // Notification
    notify(configuration, "info", "Bot is starting...");

    // Update event types
    await updateEventTypes(configuration, client);

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
                        notify(configuration, "error", String(error));

                        // Return boolean based on configuration
                        return Boolean(configuration.bot.enableBotIteration);
                    });
            }

            // Notification
            notify(configuration, "warning", `Invalid token provided for bot with ID '${application.applicationId}'`);

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
            notify(configuration, "error", String(error));
        });
    }

    // Handle console commands
    consoleCommandHandler(configuration, client);
};

export { main };
