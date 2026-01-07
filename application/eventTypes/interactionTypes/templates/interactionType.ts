// Class & type imports
import type { SavedInteractionType } from "../../../../types";

// External libraries imports
import { BaseInteraction, InteractionType } from "discord.js";

/** Template for interaction handler */
const interactionType: SavedInteractionType = {
	type:
		InteractionType.ApplicationCommand ||
		InteractionType.ApplicationCommandAutocomplete ||
		InteractionType.MessageComponent ||
		InteractionType.ModalSubmit ||
		InteractionType.Ping,

	async execute(interaction: BaseInteraction) {},
};

export default interactionType;
