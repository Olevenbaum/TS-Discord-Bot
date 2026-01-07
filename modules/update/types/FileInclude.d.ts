// Class & type imports
import { type ClientEvents, InteractionType, type MessageComponentType, ApplicationCommandType } from "discord.js";

/** Files of types of components that should be updated */
interface FileInclude {
	/**
	 * Whether to update application commands or list of application commands to update
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
