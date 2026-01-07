// Type imports
import { MessageComponentInteraction, MessageComponentType } from "discord.js";

/** Message component type imported from local file */
interface SavedMessageComponentType {
	/** Message component type */
	type: MessageComponentType;

	/**
	 * Handles the interaction with the message component type
	 * @param interaction The interaction to response to
	 */
	execute(interaction: MessageComponentInteraction): Promise<void>;
}
