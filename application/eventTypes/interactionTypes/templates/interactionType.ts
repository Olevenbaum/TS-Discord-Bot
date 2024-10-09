// Type imports
import { Interaction, InteractionType } from "discord.js";
import { Configuration } from "../../../../types/configuration";
import { SavedInteractionType } from "../../../../types/others";

/**
 * Template for interaction handler
 */
const interactionType: SavedInteractionType = {
    type:
        InteractionType.ApplicationCommand ||
        InteractionType.ApplicationCommandAutocomplete ||
        InteractionType.MessageComponent ||
        InteractionType.ModalSubmit ||
        InteractionType.Ping,

    async execute(configuration: Configuration, interaction: Interaction) {},
};

export default interactionType;
