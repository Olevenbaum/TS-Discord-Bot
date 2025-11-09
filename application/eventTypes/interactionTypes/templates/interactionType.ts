// Type imports
import { InteractionType } from "discord.js";
import { SavedInteractionType } from "../../../../types/others";

/** Template for interaction handler */
const interactionType: SavedInteractionType = {
	type:
		InteractionType.ApplicationCommand ||
		InteractionType.ApplicationCommandAutocomplete ||
		InteractionType.MessageComponent ||
		InteractionType.ModalSubmit ||
		InteractionType.Ping,

	async execute(interaction) {},
};

export default interactionType;
