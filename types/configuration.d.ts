// Class & type imports
import { LogLevel, LogType } from "../modules/notification";

// External libraries imports
import { Snowflake, TeamMemberRole } from "discord.js";
import { Path } from "typescript";
import { Options } from "@sequelize/core";

/**
 * Required individual data of any Discord bot to function.
 * Can be extracted from {@link https://discord.com/developers/applications | Discord Developer Portal} for each bot.
 *
 * More documentation can be found on the {@link https://github.com/Olevenbaum/TS-Bot-Template/wiki/... | GitHub wiki}.
 */
interface BotData {
	/**
	 * Application ID of the bot
	 * @see {@link Snowflake}
	 */
	applicationId: Snowflake;

	/** Public key of the bot */
	publicKey: string;

	/** Verification token of the bot. Can only be shown once on
	 * {@link https://discord.com/developers/applications | Discord Developer Portal}. If lost, create a new one. Make
	 * sure to keep it secret and never share it with anyone!
	 */
	token: string;
}

/**
 * Configuration data imported from JSON file to specify the bots behavior.
 *
 * More documentation can be found on the {@link https://github.com/Olevenbaum/TS-Bot-Template/wiki/... | GitHub wiki}.
 */
interface BotConfiguration {
	/**
	 * Cooldown in seconds between two autocomplete error notifications.
	 * @defaultValue `300`
	 */
	autocompleteErrorCooldown?: number;

	/**
	 * Data of a single or multiple bots that can be started
	 * @see {@link BotData}
	 */
	botData: BotData | BotData[];

	/**
	 * Whether commands should be updated automatically
	 * @defaultValue `true`
	 */
	enableAutoUpdate?: boolean;

	/**
	 * Whether other bots can interact with this bot
	 * @defaultValue `false`
	 */
	enableBotInteraction?: boolean;

	/**
	 * Whether another bot should be started in case of an invalid token
	 * @defaultValue `false`
	 */
	enableBotIteration?: boolean;

	/**
	 * Whether blocked users can interact with the bot
	 * @defaultValue `false`
	 */
	enableBlockedUsers?: boolean;

	/**
	 * Whether console messages should be logged with a date prefix. The timestamp is always included.
	 * @defaultValue `false`
	 */
	logDate?: boolean;

	/**
	 * Whether notifications should be enabled and if yes, which one should be sent and who should receive them
	 * Can be a boolean to enable/disable notifications, a number to set the minimal importance of notifications to
	 * receive or an object to specify detailed preferences
	 * @defaultValue `false`
	 * @see {@link NotificationPreferences}
	 */
	notifications?: boolean | number | NotificationPreferences;
}

/**
 * Configuration data specifying the bots behavior and project structure
 *
 * More documentation can be found on the {@link https://github.com/Olevenbaum/TS-Bot-Template/wiki/... | GitHub wiki}.
 */
interface Configuration {
	/**
	 * Bot configuration data
	 * @see {@link BotConfiguration}
	 *
	 * More documentation can be found on the
	 * {@link https://github.com/Olevenbaum/TS-Bot-Template/wiki/... | GitHub wiki}.
	 */
	bot: BotConfiguration;

	/**
	 * Database configuration data
	 * @see {@link Options}
	 *
	 * More documentation can be found on {@link https://sequelize.org/ | Sequelize}.
	 */
	database?: Options;

	/**
	 * Constants given by Discord API
	 * @see {@link DiscordConstants}
	 *
	 * More documentation can be found on the
	 * {@link https://github.com/Olevenbaum/TS-Bot-Template/wiki/... | GitHub wiki}.
	 */
	discord: DiscordConstants;

	/**
	 * Paths of various files and directories used in the project
	 * @see {@link Paths}
	 *
	 * More documentation can be found on the
	 * {@link https://github.com/Olevenbaum/TS-Bot-Template/wiki/... | GitHub wiki}.
	 */
	paths: Paths;
}

/**
 * Database configuration data
 */
interface DatabaseConfiguration {
	/** Host of the database */
	host: string;

	/** Name of the database */
	name: string;
}

interface DiscordConstants {
	/**
	 * Maximal number of autocomplete results Discord can show
	 *
	 * See on the {@link https://discord.com/developers/docs/interactions/application-commands#autocomplete-structure-autocomplete-choices | Discord Documentation}.
	 */
	maximalAutocompleteResults: number;

	/** Regular expression to test the token against */
	tokenRegex: RegExp;
}

/**
 * Notification preferences
 *
 * More documentation can be found on the {@link https://github.com/Olevenbaum/TS-Bot-Template/wiki/... | GitHub wiki}.
 */
interface NotificationPreferences {
	/**
	 * Team members to exclude from receiving notifications
	 * @see {@link Snowflake}
	 */
	excludedMembers?: Snowflake[];

	/**
	 * Team member roles to exclude from receiving notifications
	 * @see {@link TeamMemberRole}
	 */
	excludedRoles: TeamMemberRole[];

	/**
	 * Importance level of notifications to receive
	 * @defaultValue `0`
	 * @see {@link NotificationImportance}
	 */
	minImportance?: LogLevel;

	/**
	 * Team members and their chosen minimal importance of notifications to receive
	 * @see {@link Snowflake} | {@link NotificationImportance}
	 */
	restrictedMembers?: { [key: Snowflake]: LogLevel };

	/**
	 * Types of notifications to enable
	 * @see {@link NotificationType}
	 */
	types?: LogType[];
}

/**
 * Paths of various files and directories used in the project
 *
 * More documentation can be found on the {@link https://github.com/Olevenbaum/TS-Bot-Template/wiki/... | GitHub wiki}.
 */
interface Paths {
	/** Path(s) of application command types directory / directories */
	applicationCommandTypesPath: string | string[];

	/** Path of blocked users file */
	blockedUsersPath: string;

	/** Paths of chat input commands directory / directories */
	chatInputCommandsPath: string | string[];

	/** Path(s) of (message) components directory / directories */
	componentsPath: string | string[];

	/** Path of configuration data file */
	configurationPath: string;

	/** Path(s) of console commands directory / directories */
	consoleCommandsPath: string | string[];

	/** Path of Discord data file */
	discordConfigurationsPath: Path;

	/** Path(s) of event types directory / directories */
	eventTypesPath: Path | Path[];

	/** Path(s) of interactions types directory / directories */
	interactionTypesPath: Path | Path[];

	/** Path to a directory to save log files to */
	logPath: Path;

	/** Path(s) of message commands directory / directories */
	messageCommandsPath: string | string[];

	/** Path(s) of component types directory / directories */
	componentTypesPath: string | string[];

	/** Path(s) of modals directory / directories */
	modalsPath: string | string[];

	/** Path(s) of user commands directory / directories */
	userCommandsPath: string | string[];
}
