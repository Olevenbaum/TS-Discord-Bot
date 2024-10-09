// Type imports
import {
    ApplicationCommand,
    ApplicationCommandType,
    BaseInteraction,
    ChatInputCommandInteraction,
    Client,
    ClientEvents,
    Collection,
    CommandInteraction,
    ComponentType,
    ContextMenuCommandBuilder,
    InteractionType,
    MessageComponentBuilder,
    MessageComponentInteraction,
    MessageComponentType,
    MessageContextMenuCommandInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandSubcommandsOnlyBuilder,
    Snowflake,
    TeamMemberRole,
    UserContextMenuCommandInteraction,
} from "discord.js";
import { Interface } from "readline";

/**
 * Commands for usage in the console
 */
interface ConsoleCommand {
    /**
     * List of aliases for the command
     */
    aliases?: string[];

    /**
     * The decsription of the command
     */
    description: string;

    /**
     * The name of the command
     */
    name: string;

    /**
     * The usage of the command
     */
    usage: string | string[];

    /**
     * The function that should be called on the commands call
     * @param configuration The configuration of the project and bot
     * @param client The Discord bot client
     * @param rlInterface The readline interface to communicate with the user
     * @param values The values that were passed to the command
     */
    execute(
        configuration?: Configuration,
        client?: Client,
        rlInterface?: Interface,
        ...values: NestedArray<boolean | number | string>
    ): void;
}

/**
 * Active cooldowns for any specific interaction type
 */
interface CooldownCollections {
    /**
     * Collection of cooldowns for servers
     */
    servers?: Collection<Snowflake, Date>;

    /**
     * Collection of cooldowns for users
     */
    users?: Collection<Snowflake, Date>;
}

/**
 * Cooldowns for interacting with the interactable element
 */
interface CooldownObject {
    /**
     * The time any user has to wait to interact with this interactable element again on a the same server
     */
    servers?: number;

    /**
     * The time the same user has to wait to interact with this interactable element again
     */
    users?: number;
}

/**
 * Cooldown collection for all interaction types
 */
type Cooldowns = Record<keyof typeof InteractionType, Collection<string, CooldownCollections>>;

/**
 * File (types) that should be updated or read
 */
interface FileInclude {
    /**
     * Whether to update application commands or list of application commands to update
     */
    applicationCommands?: boolean | `${string}:${ApplicationCommandType}`[];

    /**
     * Whether to update application command types or list of application command types to update
     */
    applicationCommandTypes?: boolean | ApplicationCommandType[];

    /**
     * Whether to update blocked users
     */
    blockedUsers?: boolean;

    /**
     * Whether to update (message) components or list of (message) components to update
     */
    components?: boolean | string[];

    /**
     * Whether to update configuration data
     */
    configuration?: boolean;

    /**
     * Whether to update event types or list of event types to update
     */
    eventTypes?: boolean | (keyof ClientEvents)[];

    /**
     * Whether to update interaction types or list of interaction types to update
     */
    interactionTypes?: boolean | InteractionType[];

    /**
     * Whether to update messages or list of messages to update
     */
    modals?: boolean | string[];
}

/**
 * Nested array with unknown depth
 */
type NestedArray<Type> = Array<Type | NestedArray<Type>>;

/**
 * Event type imported from local file
 */
interface SavedEventType {
    /**
     * Whether the event is called once
     */
    once?: boolean;

    /**
     * Type of the event
     */
    type: keyof ClientEvents;

    /**
     * Forwards the prompt to response to the event or handles it by itself
     * @param configuration The configuration of the project and bot
     * @param args The needed arguments to response to an interaction or the emitted event
     */
    execute(
        configuration: Configuration,
        ...args: any[] // TODO: Add correct types
    ): Promise<void>;
}

/**
 * Interaction type imported from local file
 */
interface SavedInteractionType {
    /**
     * Type of the interaction
     */
    type: InteractionType;

    /**
     * Forwards the interaction to be handled or handles it by itself
     * @param configuration The configuration of the project and bot
     * @param interaction The interaction to respond to
     */
    execute(configuration: Configuration, interaction: BaseInteraction): Promise<void>;
}
