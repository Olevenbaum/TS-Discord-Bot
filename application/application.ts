// Class & type imports
import { ConsoleHandler } from "../classes";

// Data imports
import { configuration } from "#variables";

// External libraries imports
import { createCliRenderer } from "@opentui/core";
import { Client, DiscordAPIError, GatewayIntentBits } from "discord.js";
import { Sequelize } from "sequelize";

// Module imports
import "../extensions/Array";
import notify from "../modules/notification";
import { updateFiles } from "../modules/update";

/**
 * CLI to see the logs and interact with the bot directly
 * @see {@linkcode ConsoleHandler}
 */
export const cli = new ConsoleHandler();

/**
 * Discord bot client
 * @see {@linkcode Client} | {@linkcode GatewayIntentBits}
 */
export const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

/**
 * Database connection instance
 * @see {@link Sequelize}
 */
export const database: Sequelize | null = configuration.database ? new Sequelize(configuration.database) : null;

/**
 * Starts the Discord bot and handles login as well as starting the CLI.
 * @param botIndex Index of the bot to use when multiple bots are configured. Defaults to `0`
 */
export default async function main(botIndex?: number): Promise<void>;

export default async function main(botIndex: number = 0): Promise<void> {
	notify("Bot is starting...", "INFORMATION");

	await updateFiles(["eventTypes"]);

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
							notify(error);

							return Boolean(configuration.bot.enableBotIteration);
						} else {
							throw error;
						}
					});
			}

			notify(`Invalid token provided for bot with ID '${bot.applicationId}'`, "WARNING");

			return Boolean(configuration.bot.enableBotIteration);
		});

		if (!success && configuration.bot.enableBotIteration) {
			notify("No bot with valid token was found", "WARNING");
		}
	} else {
		await client.login(configuration.bot.botData.token).catch((error: Error) => {
			if (error instanceof DiscordAPIError) {
				notify(error);
			} else {
				throw error;
			}
		});
	}

	if (database) {
		await database
			.authenticate()
			.then(() => {
				notify("Established connection to database", "SUCCESS");
			})
			.catch((error: Error) => {
				notify(`Unable to connect to the database:\n${error}`, "ERROR");
			});
	}

	cli.initialize(await createCliRenderer());
}
