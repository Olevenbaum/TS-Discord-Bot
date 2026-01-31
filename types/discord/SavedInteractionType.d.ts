// External library imports
import { BaseInteraction, InteractionType } from "discord.js";

/**
 * Represents a Discord interaction handler loaded from a local file. Interaction handlers process various types of user
 * interactions with the bot, such as slash commands, button clicks, or modal submissions. These handlers are registered
 * and called when interactions occur.
 */
interface SavedInteractionType {
	/**
	 * The specific type of Discord interaction this handler processes. Determines which interaction events will
	 * trigger this handler.
	 * @see {@linkcode InteractionType}
	 */
	type: InteractionType;

	/**
	 * Executes the interaction handler logic when an interaction of the specified type occurs. Receives the
	 * interaction object and performs the necessary response or processing.
	 * @param interaction - The Discord interaction object to handle, containing all relevant data.
	 * @see {@linkcode BaseInteraction}
	 */
	execute(interaction: BaseInteraction): Promise<void>;
}
