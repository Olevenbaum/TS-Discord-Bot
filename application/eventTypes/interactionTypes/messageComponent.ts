// Class & type imports
import type { SavedInteractionType } from "../../../types";

// Data imports
import { componentTypes } from "#variables";

// External libraries imports
import { InteractionType, MessageComponentInteraction, ComponentType, bold, codeBlock, MessageFlags } from "discord.js";

// Module imports
import notify from "../../../modules/notification";

/** Message component interaction handler */
const interactionType: SavedInteractionType = {
	type: InteractionType.MessageComponent,

	async execute(interaction: MessageComponentInteraction) {
		/** Message component type of the message component that was interacted with */
		const messageComponentType = componentTypes.get(interaction.componentType);

		if (!messageComponentType) {
			interaction.reply({
				content: `I'm sorry, but it seems like interactions with the message component type ${bold(
					ComponentType[interaction.componentType],
				)} can't be processed at the moment.`,
				flags: MessageFlags.Ephemeral,
			});

			notify(
				`Found no file handling message component type '${ComponentType[interaction.componentType]}'`,
				"ERROR",
				`I couldn't find any file handling the message component type ${bold(
					ComponentType[interaction.componentType],
				)}.`,
				5,
			);

			return;
		}

		await messageComponentType.execute(interaction).catch((error: Error) => {
			interaction.reply({
				content: `I'm sorry, but there was an error handling your interaction with the message component type ${bold(
					ComponentType[interaction.componentType],
				)}.`,
				flags: MessageFlags.Ephemeral,
			});

			notify(
				`Failed to execute message component type '${ComponentType[interaction.componentType]}':`,
				error,
				`I failed to execute the message component type ${bold(
					ComponentType[interaction.componentType],
				)}:\n${codeBlock(error.message)}\nHave a look at the logs for more information.`,
				4,
			);
		});
	},
};

export default interactionType;
