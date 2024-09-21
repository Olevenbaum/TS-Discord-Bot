// Type imports
import { ApplicationCommandType, Client, Collection, InteractionType, Snowflake } from "discord.js";
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
     * The function that should be called on the commands call
     * @param configuration The configuration of the project and bot
     * @param client The Discord bot client
     * @param rlInterface The readline interface to communicate with the user
     * @param values The values that were passed to the command
     */
    execute(
        configuration: Configuration,
        client: Client,
        rlInterface: Interface,
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
     * Application commands to update
     */
    applicationCommands?: boolean | string[];

    /**
     * Application command types to update
     */
    applicationCommandTypes?: boolean | ApplicationCommandType[];

    /**
     * Whether blocked users should be updated
     */
    blockedUsers?: boolean;

    /**
     * (Message) components to update
     */
    components?: boolean | string[];

    /**
     * Interaction types to update
     */
    interactionTypes?: boolean | InteractionType[];

    /**
     * Modals to update
     */
    modals?: boolean | string[];
}

/**
 * Nested array with unknown depth
 */
type NestedArray<Type> = Array<Type | NestedArray<Type>>;
