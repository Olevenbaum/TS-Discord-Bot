// External libraries imports
import { MessageComponentInteraction, type MessageComponentType } from "discord.js";

/**
 * Represents a handler for a specific type of Discord message component interaction. Message component type handlers
 * provide generic processing for all components of a particular type before delegating to specific component handlers.
 * @see {@linkcode SavedMessageComponent}
 */
interface SavedMessageComponentType {
	/**
	 * The message component type this handler processes. Determines which category of components this handler will
	 * intercept.
	 * @see {@linkcode MessageComponentType}
	 */
	type: MessageComponentType;

	/**
	 * Executes type-specific logic for message component interactions. This may include logging, permission checks,
	 * or preprocessing before passing to individual component handlers.
	 * @param interaction - The message component interaction to process.
	 * @see {@linkcode MessageComponentInteraction}
	 */
	execute(interaction: MessageComponentInteraction): Promise<void>;
}
