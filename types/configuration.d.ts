// Type imports
import { Snowflake } from "discord.js";

/**
 * Discord application data
 */
interface Application {
    /**
     * Application ID
     */
    applicationId: string;

    /**
     * Public key of the application
     */
    publicKey: string;

    /**
     * Verification token of the application
     */
    token: string;
}

/**
 * Configuration data imported from JSON file to specify the bots behavior
 */
interface BotConfiguration {
    /**
     * Single or multiple applications that can be started
     */
    applications: Application | Application[];

    /**
     * Whether the commands should be updated automatically
     */
    enableAutoUpdate?: boolean;

    /**
     * Whether other bots can interact with this bot
     */
    enableBotInteraction?: boolean;

    /**
     * Whether another bot should be started in case of an invalid token
     */
    enableBotIteration?: boolean;

    /**
     * Whether blocked users can interact with the bot
     */
    enableBlockedUsers?: boolean;

    /**
     * Whether notifications should be enabled
     */
    notifications?: boolean | NotificationPreferences;
}

/**
 * Configuration data to specify the bots behavior and project structure
 */
interface Configuration {
    /**
     * Bot configuration data
     */
    bot: BotConfiguration;

    /**
     * Project configuration data
     */
    project: ProjectConfiguration;
}

/**
 * Notification preferences
 */
interface NotificationPreferences {
    /**
     * Team members to exclude from receiving notifications
     */
    excludedMembers?: Snowflake[];

    /**
     * Team member roles to exclude from receiving notifications
     */
    excludedRoles: string[];

    /**
     * Types of notifications to enable
     */
    types?: string[];
}

/**
 * Configuration data to specify project structure and other important settings
 */
interface ProjectConfiguration {
    /**
     * Time that has to pass until an error message is sent again for application command autocomplete interactions (in
     * seconds)
     */
    applicationCommandAutocompleteErrorCooldown: number;

    /**
     * Path to the directory where the application command types are stored
     */
    applicationCommandTypesPath: string;

    /**
     * Path to the file where the blocked users are stored
     */
    blockedUsersPath: string;

    /**
     * Path to the directory where the chat input commands are stored
     */
    chatInputCommandsPath: string;

    /**
     * Path to the directory where the (message) components are stored
     */
    componentsPath: string;

    /**
     * Path to the file where the configuration data is stored
     */
    configurationPath: string;

    /**
     * Path to the directory where the console commands are stored
     */
    consoleCommandsPath: string;

    /**
     * Path to the directory where the event types are stored
     */
    eventTypesPath: string;

    /**
     * Path to the directory where the interactions types are stored
     */
    interactionTypesPath: string;

    /**
     * Path to the directory where the message commands are stored
     */
    messageCommandsPath: string;

    /**
     * Path to the directory where the message component types are stored
     */
    messageComponentTypesPath: string;

    /**
     * Path to the directory where the modals are stored
     */
    modalsPath: string;

    /**
     * Regular expression to test the token against
     */
    tokenRegex: RegExp;

    /**
     * Path to the directory where the user commands are stored
     */
    userCommandsPath: string;
}
