// Global imports
import "../../../globals/discordTextFormat";
import "../../../globals/notifications";
import { messageComponentTypes } from "../../../globals/variables";

// Type imports
import { InteractionType, MessageComponentInteraction, ComponentType } from "discord.js";
import { SavedInteractionType } from "../../../types/others";

/** Template for interaction handler */
const interactionType: SavedInteractionType = {
	type: InteractionType.MessageComponent,

	async execute(interaction: MessageComponentInteraction) {
		/** Message component type of the message component that was interacted with */
		const messageComponentType = messageComponentTypes.get(interaction.componentType);

		if (!messageComponentType) {
			interaction.reply({
				content: `I'm sorry, but it seems like interactions with the message component type ${bold(
					ComponentType[interaction.componentType],
				)} can't be processed at the moment.`,
				ephemeral: true,
			});

			notify(
				"ERROR",
				`Found no file handling message component type '${ComponentType[interaction.componentType]}'`,
				interaction.client,
				`I couldn't find any file handling the message component type ${bold(
					ComponentType[interaction.componentType],
				)}.`,
				4,
			);

			return;
		}

		await messageComponentType.execute(interaction).catch((error: Error) => {
			interaction.reply({
				content: `I'm sorry, but there was an error handling your interaction with the message component type ${bold(
					ComponentType[interaction.componentType],
				)}.`,
				ephemeral: true,
			});

			notify(
				"ERROR",
				`Failed to execute message component type '${ComponentType[interaction.componentType]}':\n${error}`,
				interaction.client,
				`I failed to execute the message component type ${bold(
					ComponentType[interaction.componentType],
				)}:\n${code(error.message)}\nHave a look at the logs for more information.`,
				3,
			);
		});
	},
};

export default interactionType;
