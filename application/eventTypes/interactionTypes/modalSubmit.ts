// Global imports
import "../../../globals/cooldownValidator";
import "../../../globals/discordTextFormat";
import "../../../globals/notifications";
import { modals } from "../../../globals/variables";

// Type imports
import { InteractionType, ModalSubmitInteraction } from "discord.js";
import { Configuration } from "../../../types/configuration";
import { SavedInteractionType } from "../../../types/others";

/**
 * Template for interaction handler
 */
const interactionType: SavedInteractionType = {
	type: InteractionType.ModalSubmit,

	async execute(configuration: Configuration, interaction: ModalSubmitInteraction) {
		/**
		 * Modal that was interacted with
		 */
		const modal = modals.get(interaction.customId);

		// Check if modal is implemented
		if (!modal) {
			interaction.reply({
				content: `I'm sorry, but it seems that interactions with the modal ${bold(
					interaction.customId,
				)} can't be processed at the moment.`,
				ephemeral: true,
			});

			notify(
				configuration,
				"ERROR",
				`Found no file handling modal '${interaction.customId}'`,
				interaction.client,
				`I couldn't find any file handling the application command type ${bold(interaction.customId)}.`,
				2,
			);

			return;
		}

		/**
		 * Whether the cooldown expired or the time (in seconds) a user has to wait before submitting the modal again
		 */
		const cooldownValidation = await validateCooldown(modal, interaction);

		// Check if cooldown expired
		if (typeof cooldownValidation === "number") {
			interaction.reply({
				content: `You need to wait ${underlined(
					cooldownValidation,
				)} more seconds before submitting the modal ${bold(interaction.customId)} again. Please be patient.`,
				ephemeral: true,
			});

			return;
		}

		await modal
			.execute(configuration, interaction)
			.then(() => updateCooldown("ModalSubmit", modal, interaction))
			.catch(async (error: Error) => {
				interaction.reply({
					content: `I'm sorry, but there was an error handling your interaction with the modal ${bold(
						modal.name,
					)}.`,
					ephemeral: true,
				});

				notify(
					configuration,
					"ERROR",
					`Failed to execute modal '${modal.name}':\n${error}`,
					interaction.client,
					`I failed to execute the modal ${bold(modal.name)}:\n${code(
						error.message,
					)}\nHave a look at the logs for more information.`,
					3,
				);
			});
	},
};

export default interactionType;
