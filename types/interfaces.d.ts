// Type imports
import {
    ApplicationCommandType,
    BaseInteraction,
    ChatInputCommandInteraction,
    ClientEvents,
    ContextMenuCommandBuilder,
    InteractionType,
    MessageContextMenuCommandInteraction,
    SlashCommandBuilder,
    UserContextMenuCommandInteraction,
} from "discord.js";

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
     * Whether another bot should be started in case of an invalid token
     * @default false
     */
    enableBotIteration?: boolean;
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
 * Configuration data to specify project structure and other important settings
 */
interface ProjectConfiguration {
    /**
     * Path to the directory where the event types are stored
     */
    eventTypesPath: string;

    /**
     * Regular expression to test the token against
     */
    tokenRegex: RegExp;
}

/**
 * Event type imported from local file
 */
interface SavedEventType {
    /**
     * Whether the event is called once
     */
    once: boolean;

    /**
     * Type of the event
     */
    type: keyof ClientEvents;

    /**
     * Forwards the prompt to response to the interaction or handles it by itself
     *
     * @param args Arguments to response to an interaction or an emitted event
     */
    execute(
        configuration: Configuration,
        ...args: any[] // TODO: Add correct types
    ): Promise<void>;
}
