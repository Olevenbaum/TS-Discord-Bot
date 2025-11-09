// Global imports
import "../globals/consoleCommandHandler";
import "../globals/fileReader";
import "../globals/fileUpdate";
import "../globals/notifications";
import { configuration } from "../globals/variables";

// Type imports
import "../extensions/array.extensions";
import { Client, DiscordAPIError, GatewayIntentBits } from "discord.js";

/**
 * Starts the Discord bot and handles login. Then starts the console command handler.
 * @param intents Gateway intents your bot needs
 * @see {@link GatewayIntentBits}
 */
const main = async (botIndex: number = 0, intents: GatewayIntentBits[]): Promise<void> => {
	/**  Discord bot client */
	const client = new Client({ intents });

	notify("INFO", "Bot is starting...");

	await updateFiles(client, ["eventTypes"]);

	if (Array.isArray(configuration.bot.botData)) {
		configuration.bot.botData.rotate(botIndex);

		/** Whether the bot was logged in successfully */
		const success = await configuration.bot.botData.asyncFind(async (bot) => {
			if (bot.token && configuration.discord.tokenRegex.test(bot.token)) {
				return await client
					.login(bot.token)
					.then((returnedToken) => {
						return bot.token === returnedToken;
					})
					.catch((error: DiscordAPIError) => {
						notify("ERROR", String(error));

						return Boolean(configuration.bot.enableBotIteration);
					});
			}

			notify("WARNING", `Invalid token provided for bot with ID '${bot.applicationId}'`);

			return Boolean(configuration.bot.enableBotIteration);
		});

		if (!success && configuration.bot.enableBotIteration) {
			notify("WARNING", "No bot with valid token was found");
		}
	} else {
		await client.login(configuration.bot.botData.token).catch((error: DiscordAPIError) => {
			notify("ERROR", String(error));
		});
	}

	consoleCommandHandler(client);
};

export { main };
