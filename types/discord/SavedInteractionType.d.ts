// Type imports
import { BaseInteraction, InteractionType } from "discord.js";

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
