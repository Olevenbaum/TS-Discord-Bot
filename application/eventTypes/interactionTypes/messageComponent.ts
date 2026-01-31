// Class & type imports
import type { SavedMessageComponentType, SavedInteractionType } from "../../../types";

// Data imports
import { componentTypes } from "#variables";

// External library imports
import { InteractionType, MessageComponentInteraction, ComponentType, bold, codeBlock, MessageFlags } from "discord.js";

// Module imports
import notify from "../../../modules/notification";

/**
 * Interaction type handler for message components. Routes interactions to their respective component type handlers and
 * manages error responses. Provides user feedback for unhandled component types and manages error handling for
 * component execution failures.
 * 
 * More information on message components can be found on the
 * {@link https://discord.com/developers/docs/components/overview | Discord Developer Portal}.
 * @see {@linkcode SavedInteractionType}
 */
const interactionType: SavedInteractionType = {
	type: InteractionType.MessageComponent,

	async execute(interaction: MessageComponentInteraction): Promise<void> {
		/**
		 * Message component type of the message component that was interacted with
		 * @see {@linkcode SavedMessageComponentType}
		 */
		const messageComponentType: SavedMessageComponentType = componentTypes.get(interaction.componentType);

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
