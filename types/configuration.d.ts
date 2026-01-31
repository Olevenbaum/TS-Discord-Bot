// Class & type imports
import { type LogLevel, LogType } from "../modules/notification";

// External libraries imports
import type { Options } from "@sequelize/core";
import { type Snowflake, TeamMemberRole } from "discord.js";
import type { Path } from "typescript";

/**
 * Represents the essential configuration data required for a Discord bot to function properly. This includes
 * credentials and identifiers obtained from the
 * {@link https://discord.com/developers/applications | Discord Developer Portal} that authenticate the bot with
 * Discord's API.
 */
interface BotData {
	/**
	 * Application ID of the bot
	 * @see {@linkcode Snowflake}
	 */
	applicationId: Snowflake;

	/** Public key of the bot */
	publicKey: string;

	/** Verification token of the bot. Can only be shown once on the
	 * {@link https://discord.com/developers/applications | Discord Developer Portal}. If lost, create a new one. Make
	 * sure to keep it secret and never share it with anyone!
	 */
	token: string;
}

/**
 * Represents the configuration data imported from a JSON file that specifies the bot's behavior and operational
 * parameters. This includes settings for interactions, notifications, updates, and various bot features.
 */
interface BotConfiguration {
	/**
	 * Cooldown in seconds between two autocomplete error notifications.
	 * @defaultValue `300`
	 */
	autocompleteErrorCooldown?: number;

	/**
	 * Data of a single or multiple bots that can be started
	 * @see {@linkcode BotData}
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
	 * @defaultValue `true`
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
	 * @see {@linkcode NotificationPreferences}
	 */
	notifications?: boolean | number | NotificationPreferences;

	/**
	 * Whether to save the log messages at least once a day and before the bot shuts down.
	 * @defaultValue `true`
	 */
	saveLogs: boolean;
}

/**
 * Represents the comprehensive configuration data that specifies the bot's behavior, project structure, and external
 * service integrations. This is the root configuration object that encompasses all bot settings.
 */
interface Configuration {
	/**
	 * Bot configuration data
	 * @see {@linkcode BotConfiguration}
	 */
	bot: BotConfiguration;

	/**
	 * Database configuration data
	 * @see {@linkcode Options}
	 */
	database?: Options;

	/**
	 * Constants given by Discord API
	 * @see {@linkcode DiscordConstants}
	 */
	discord: DiscordConstants;

	/**
	 * Paths of various files and directories used in the project
	 * @see {@linkcode Paths}
	 */
	paths: Paths;
}

/**
 * Represents the configuration data required to connect to and interact with the bot's database. This includes
 * connection parameters and database identification details.
 */
interface DatabaseConfiguration {
	/** The hostname or IP address of the database server. */
	host: string;

	/** The name of the database to connect to on the server. */
	name: string;
}

/**
 * Represents constants defined by the Discord API that affect bot behavior and limitations. These values are
 * fixed by Discord and should be used to ensure compliance with API constraints.
 */
interface DiscordConstants {
	/**
	 * The maximum number of autocomplete results that Discord can display in a single autocomplete interaction.
	 * Bots should limit their autocomplete responses to this number to ensure proper display.
	 *
	 * See the {@link https://discord.com/developers/docs/interactions/application-commands#autocomplete-structure-autocomplete-choices | Discord Documentation}.
	 */
	maximalAutocompleteResults: number;

	/**
	 * Regular expression pattern used to validate Discord bot tokens. Ensures tokens conform to Discord's expected
	 * format before attempting authentication.
	 */
	tokenRegex: RegExp;
}

/**
 * Represents the preferences for controlling bot notifications, including recipient filtering and importance levels.
 * This allows fine-grained control over who receives notifications and what types of events trigger them.
 */
interface NotificationPreferences {
	/**
	 * Team members to exclude from receiving notifications
	 * @see {@linkcode Snowflake}
	 */
	excludedMembers?: Snowflake[];

	/**
	 * Team member roles to exclude from receiving notifications
	 * @see {@linkcode TeamMemberRole}
	 */
	excludedRoles: TeamMemberRole[];

	/**
	 * Importance level of notifications to receive
	 * @defaultValue `0`
	 * @see {@linkcode LogLevel}
	 */
	minImportance?: LogLevel;

	/**
	 * Team members and their chosen minimal importance of notifications to receive
	 * @see {@linkcode Snowflake}
	 * @see {@linkcode LogLevel}
	 */
	restrictedMembers?: { [key: Snowflake]: LogLevel };

	/**
	 * Types of notifications to enable
	 * @see {@linkcode NotificationType}
	 */
	types?: LogType[];
}

/**
 * Represents the file and directory paths used throughout the project for loading various bot components and
 * resources. These paths define the project structure and where different types of files are located.
 */
interface Paths {
	/** Path(s) to the directory or directories containing application command type definitions. */
	applicationCommandTypesPath: string | string[];

	/** Path to the file containing the list of blocked users who cannot interact with the bot. */
	blockedUsersPath: string;

	/** Path(s) to the directory or directories containing chat input (slash) command definitions. */
	chatInputCommandsPath: string | string[];

	/** Path(s) to the directory or directories containing message component definitions. */
	componentsPath: string | string[];

	/** Path to the configuration data file containing bot settings and parameters. */
	configurationPath: string;

	/** Path(s) to the directory or directories containing console command definitions. */
	consoleCommandsPath: string | string[];

	/** Path to the Discord configuration data file containing API-related constants and settings. */
	discordConfigurationsPath: Path;

	/** Path(s) to the directory or directories containing event type definitions. */
	eventTypesPath: Path | Path[];

	/** Path(s) to the directory or directories containing interaction type definitions. */
	interactionTypesPath: Path | Path[];

	/** Path to the directory where log files should be saved for debugging and monitoring. */
	logPath: Path;

	/** Path(s) to the directory or directories containing message context menu command definitions. */
	messageCommandsPath: string | string[];

	/** Path(s) to the directory or directories containing message component type definitions. */
	componentTypesPath: string | string[];

	/** Path(s) to the directory or directories containing modal dialog definitions. */
	modalsPath: string | string[];

	/** Path(s) to the directory or directories containing user context menu command definitions. */
	userCommandsPath: string | string[];
}
