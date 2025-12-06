// Global imports
import "../globals/consoleCommandHandler";
import "../globals/fileReader";
import "../globals/fileUpdate";
import "../globals/notifications";
import { configuration, database } from "../globals/variables";

// Type imports
import "../extensions/array.extensions";
import { Client, DiscordAPIError, GatewayIntentBits } from "discord.js";

/**
 * Starts the Discord bot and handles login. Then starts the console command handler.
 * @param intents Gateway intents your bot needs
 * @param botIndex Index of the bot to use when multiple bots are configured. Defaults to `0`
 * @see {@link GatewayIntentBits}
 */
const main = async (intents: GatewayIntentBits[], botIndex: number = 0): Promise<void> => {
	/**  Discord bot client */
	const client = new Client({ intents });

	if (database) {
		await database
			.authenticate()
			.then(() => {
				notify("SUCCESS", "Established connection to database");
			})
			.catch((error: Error) => {
				notify("ERROR", `Unable to connect to the database:\n${error}`);
			});
	}

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
					.catch((error: Error) => {
						if (error instanceof DiscordAPIError) {
							notify("ERROR", String(error));

							return Boolean(configuration.bot.enableBotIteration);
						} else {
							throw error;
						}
					});
			}

			notify("WARNING", `Invalid token provided for bot with ID '${bot.applicationId}'`);

			return Boolean(configuration.bot.enableBotIteration);
		});

		if (!success && configuration.bot.enableBotIteration) {
			notify("WARNING", "No bot with valid token was found");
		}
	} else {
		await client.login(configuration.bot.botData.token).catch((error: Error) => {
			if (error instanceof DiscordAPIError) {
				notify("ERROR", String(error));
			} else {
				throw error;
			}
		});
	}

	consoleCommandHandler(client);
};

export { main };
