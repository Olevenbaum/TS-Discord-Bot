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

/** Commands for usage in the console */
interface ConsoleCommand {
	/** List of aliases for the command */
	aliases?: string[];

	/** The description of the command */
	description: string;

	/** The name of the command */
	name: string;

	/** Parameter data for the command */
	parameters?: ConsoleCommandParameterData | ConsoleCommandParameterData[] | ConsoleCommandParameterData[][];

	/**
	 * The function that should be called on the commands call
	 * @param client The Discord bot client
	 * @param rlInterface The readline interface to communicate with the user
	 * @param parameters The parameters that were passed to the command
	 * @see {@link Client} | {@link Interface} | {@link NestedArray}
	 */
	execute(client: Client, rlInterface: Interface, ...parameters: NestedArray<boolean | number | string>): void;
}

/** Array parameter data of a console command */
interface ConsoleCommandArrayParameter extends ConsoleCommandBaseParameter {
	/**
	 * Given (possible) options for the parameter.
	 * If changing options depending on the situation might be provided, a function returning the options can be used.
	 */
	options?: string[] | (() => string[]);

	/** A pattern all elements of the parameter must match */
	pattern?: RegExp;

	/** Type of the parameter */
	type: "object";
}

interface ConsoleCommandBaseParameter {
	/** Description of the parameter */
	description: string;

	/** Name of the parameter */
	name: string;

	/** Whether the parameter is required */
	required?: boolean;

	/** Type of the parameter */
	type: "boolean" | "number" | "string" | "object";
}

/** Boolean parameter data of a console command */
interface ConsoleCommandBooleanParameter extends ConsoleCommandBaseParameter {
	/** Type of the parameter */
	type: "boolean";
}

/** Number parameter data of a console command */
interface ConsoleCommandNumberParameter extends ConsoleCommandBaseParameter {
	/** Possible range of the number parameter */
	range?: [number, number];

	/** Type of the parameter */
	type: "number";
}

/** Parameter data of a console command */
type ConsoleCommandParameterData =
	| ConsoleCommandArrayParameter
	| ConsoleCommandBooleanParameter
	| ConsoleCommandNumberParameter
	| ConsoleCommandStringParameter;

/** String parameter data of a console command */
interface ConsoleCommandStringParameter extends ConsoleCommandBaseParameter {
	/**
	 * Given (possible) options for the parameter.
	 * If changing options depending on the situation might be provided, a function returning the options can be used.
	 */
	options?: string[] | (() => string[]);

	/** A pattern the parameter must match */
	pattern?: RegExp;

	/** Type of the parameter */
	type: "string";
}

/** Active cooldowns for any specific interaction type */
interface CooldownCollections {
	/**
	 * Collection of cooldowns for servers
	 * @see {@link Collection} | {@link Date} | {@link Snowflake}
	 */
	servers?: Collection<Snowflake, Date>;

	/**
	 * Collection of cooldowns for users
	 * @see {@link Collection} | {@link Date} | {@link Snowflake}
	 */
	users?: Collection<Snowflake, Date>;
}

/** Cooldowns for interacting with the interactable element */
interface CooldownObject {
	/** The time any user has to wait to interact with this interactable element again on a the same server */
	servers?: number;

	/** The time the same user has to wait to interact with this interactable element again */
	users?: number;
}

/**
 * Cooldown collection for all interaction types
 * @see {@link Collection} | {@link CooldownCollections} | {@link InteractionType}
 */
type Cooldowns = Record<keyof typeof InteractionType, Collection<string, CooldownCollections>>;

/**
 * File (types) that should be updated or read
 */
interface FileInclude {
	/**
	 * Whether to update application commands or list of application commands to update
	 *
	 * @see {@link ApplicationCommandType}
	 */
	applicationCommands?: boolean | Partial<Record<keyof typeof ApplicationCommandType, string[]>>;

	/**
	 * Whether to update application command types or list of application command types to update
	 * @see {@link ApplicationCommandType}
	 */
	applicationCommandTypes?: boolean | (keyof typeof ApplicationCommandType)[];

	/** Whether to update blocked users */
	blockedUsers?: boolean;

	/** Whether to update (message) components or list of (message) components to update */
	components?: boolean | string[];

	/** Whether to update configuration data */
	configuration?: boolean;

	/**
	 * Whether to update event types or list of event types to update
	 * @see {@link ClientEvents}
	 */
	eventTypes?: boolean | (keyof ClientEvents)[];

	/**
	 * Whether to update interaction types or list of interaction types to update
	 * @see {@link InteractionType}
	 */
	interactionTypes?: boolean | (keyof typeof InteractionType)[];

	/**
	 * Whether to update message component types or list of message component types to update
	 * @see {@link MessageComponentType}
	 */
	messageComponentTypes?: boolean | MessageComponentType[];

	/** Whether to update messages or list of messages to update */
	modals?: boolean | string[];
}

/**
 * Importance of a notification.
 * Interally, following system is used:
 * - **5**: Critical messages like crashes or bot startup/shutdown
 * - **4**: Major errors (not finding modules/files)
 * - **3**: Regular messages like minor errors (failed interactions, invalid inputs)
 * - **2**: Messages like successful actions
 * - **1**: Informational messages like logs and debug information
 * - **0**: Test messages
 * 
 * **Note**: 
 *
 * **Recommendation**: Consider following the system above for a consistent notification system.
 */
type NotificationImportance = 0 | 1 | 2 | 3 | 4 | 5;

/** Type of notifications */
type NotificationType = "ERROR" | "INFO" | "SUCCESS" | "TEST" | "WARNING";

/** Nested array with unknown depth */
type NestedArray<Type> = Array<Type | NestedArray<Type>>;

/** Event type imported from local file */
interface SavedEventType {
	/** Whether the event is called once */
	once?: boolean;

	/**
	 * Type of the event
	 * @see {@link ClientEvents}
	 */
	type: keyof ClientEvents;

	/**
	 * Forwards the prompt to response to the event or handles it by itself
	 * @param args The needed arguments to response to an interaction or the emitted event
	 */
	execute(...args: any[]): Promise<void>;
}

/** Interaction type imported from local file */
interface SavedInteractionType {
	/**
	 * Type of the interaction
	 * @see {@link InteractionType}
	 */
	type: InteractionType;

	/**
	 * Forwards the interaction to be handled or handles it by itself
	 * @param interaction The interaction to respond to
	 * @see {@link BaseInteraction}
	 */
	execute(interaction: BaseInteraction): Promise<void>;
}

/** Task that can be called to perform a promise based action */
type Task<ReturnType> = () => Promise<ReturnType>;
