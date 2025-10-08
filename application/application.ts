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

    notify(configuration, "INFO", "Bot is starting...");

	await updateEventTypes(configuration, client);

	// Check if multiple bots are provided
	if (Array.isArray(configuration.bot.applications)) {
		configuration.bot.applications.rotate(applicationIndex);

		const sucess = await configuration.bot.applications.asyncFind(async (application) => {
			// Check if token could be valid
			if (application.token && configuration.project.tokenRegex.test(application.token)) {
				return await client
					.login(application.token)
					.then((returnedToken) => {
						return application.token === returnedToken;
					})
					.catch((error: DiscordAPIError) => {
						notify(configuration, "ERROR", String(error));

						return Boolean(configuration.bot.enableBotIteration);
					});
			}

			notify(configuration, "WARNING", `Invalid token provided for bot with ID '${application.applicationId}'`);

			return Boolean(configuration.bot.enableBotIteration);
		});

		// Check if no application was successfully logged in
		if (!sucess && configuration.bot.enableBotIteration) {
			notify(configuration, "WARNING", "Found no application with valid token");
		}
	} else {
		await client.login(configuration.bot.applications.token).catch((error: DiscordAPIError) => {
			notify(configuration, "ERROR", String(error));
		});
	}

	consoleCommandHandler(configuration, client);
};

export { main };
