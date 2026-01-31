// Class & type imports
import type { SavedInteractionType } from "../../../../types";

// External library imports
import { Interaction, InteractionType } from "discord.js";

/**
 * Template for interaction type handlers. Copy this file, implement the {@linkcode SavedInteractionType.execute} method
 * for your specific interaction type and modify the {@linkcode SavedInteractionType.type} field to specify which
 * interaction type this handler responds to. Each handler is responsible for routing to appropriate sub-handlers if
 * neccessary and managing error handling including feedback to the user.
 * @see {@linkcode SavedInteractionType}
 */
const interactionType: SavedInteractionType = {
	type:
		InteractionType.ApplicationCommand,

	async execute(interaction: Interaction) {
		
	},
};

export default interactionType;
