// Class & type imports
import type { SavedInteractionType, SavedModal } from "../../../types";

// Data imports
import { modals } from "#variables";

// External libraries imports
import { bold, codeBlock, InteractionType, ModalSubmitInteraction, MessageFlags, underline } from "discord.js";

// Module imports
import notify from "../../../modules/notification";
import { updateCooldown, validateCooldown } from "../../../modules/utilities";

/**
 * Modal submit interaction handler
 * @see {@linkcode SavedInteractionType}
 */
const interactionType: SavedInteractionType = {
	type: InteractionType.ModalSubmit,

	async execute(interaction: ModalSubmitInteraction) {
		/**
		 * Modal that was interacted with
		 * @see {@linkcode SavedModal}
		 */
		const modal = modals.get(interaction.customId);

		if (!modal) {
			interaction.reply({
				content: `I'm sorry, but it seems like submissions of the modal you just interacted with can't be processed at the moment.`,
				flags: MessageFlags.Ephemeral,
			});

			notify(
				`Found no file handling modal '${interaction.customId}'`,
				"ERROR",
				`I couldn't find any file handling the modal ${bold(interaction.customId)}.`,
				5,
			);

			return;
		}

		/**
		 * Whether the cooldown expired or the time (in seconds) a user has to wait before submitting the modal again
		 */
		const cooldownValidation = await validateCooldown(modal, interaction);

		// TODO: Add title of modal received from interaction, not name of modal file
		if (typeof cooldownValidation === "number") {
			interaction.reply({
				content: `You need to wait ${underline(
					cooldownValidation.toString(),
				)} more seconds before submitting the modal ${bold(modal.name)} again. Please be patient.`,
				ephemeral: true,
			});

			return;
		}

		// TODO: Replace name of modal file with title of modal received from interaction
		await modal
			.execute(interaction)
			.then(() => updateCooldown("ModalSubmit", modal, interaction))
			.catch(async (error: Error) => {
				interaction.reply({
					content: `I'm sorry, but there was an error handling your interaction with the modal ${bold(
						modal.name,
					)}.`,
					flags: MessageFlags.Ephemeral,
				});

				notify(
					`Failed to execute modal '${modal.name}':`,
					error,
					`I failed to execute the modal ${bold(modal.name)}:\n${codeBlock(
						error.message,
					)}\nHave a look at the logs for more information.`,
					4,
				);
			});
	},
};

export default interactionType;
