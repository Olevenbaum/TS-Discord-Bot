// Class & type imports
import { ConsoleHandler } from "../classes";
import type { BotData } from "../types";

// Data imports
import { configuration } from "#variables";

// External library imports
import { createCliRenderer } from "@opentui/core";
import { Client, DiscordAPIError, GatewayIntentBits } from "discord.js";
import { Sequelize } from "sequelize";

// Module imports
import "../extensions/Array";
import notify from "../modules/notification";
import { updateFiles } from "../modules/update";

/**
 * Console interface for viewing logs and interacting with the bot directly through the command line.
 * Initialized with automatic focus color detection.
 * @see {@linkcode ConsoleHandler}
 */
export const cli = new ConsoleHandler("auto");

/**
 * Discord bot client instance with configured gateway intents. This client handles all Discord events.
 *
 * More information on events emitted by Discord can be found on the
 * {@link https://discord.com/developers/docs/events/overview | Discord Developer Portal}. To learn how to configure
 * your bots permissions, read about the
 * {@link https://discord.com/developers/docs/events/gateway#gateway-intents | Gateway Intents}.
 * @see {@linkcode Client}
 * @see {@linkcode GatewayIntentBits}
 */
export const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

/**
 * Database connection instance initialized from configuration, or null if database configuration is not provided.
 * Provides access to the Sequelize ORM for database operations.
 * @see {@linkcode Sequelize}
 */
export const database: Sequelize | null = configuration.database ? new Sequelize(configuration.database) : null;

/**
 * Starts the Discord bot and initializes the CLI, handling authentication and database connection. Supports multiple
 * bot configurations and debugging mode. Automatically updates event type files on startup and authenticates the
 * database connection if configured.
 * @param botIndex - Index of the bot to use when multiple bots are configured. Defaults to `0`.
 * @param debugging - Whether to run in debugging mode. Running in debugging mode disables the CLI. Defaults to `false`.
 */
export default async function main(botIndex: number = 0, debugging: boolean = false): Promise<void> {
	if (debugging) {
		cli.initialize(debugging);
	} else {
		await cli.initialize(await createCliRenderer({ openConsoleOnError: false }));
	}

	notify("Bot is starting...", "INFORMATION");

	await updateFiles(["eventTypes"]);

	if (Array.isArray(configuration.bot.botData)) {
		configuration.bot.botData.rotate(botIndex);

		/**
		 * Whether the bot was logged in successfully
		 * @see {@linkcode BotData}
		 */
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
}
