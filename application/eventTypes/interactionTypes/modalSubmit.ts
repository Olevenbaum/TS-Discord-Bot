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

        // Check if modal was found
        if (!modal) {
            // Interaction response
            interaction.reply({
                content: `I'm sorry, but it seems that interactions with the modal ${bold(
                    interaction.customId
                )} can't be processed at the moment.`,
                ephemeral: true,
            });

            // Notification
            notify(
                configuration,
                "error",
                `Found no file handling modal '${interaction.customId}'`,
                interaction.client,
                `I couldn't find any file handling the application command type ${bold(interaction.customId)}.`
            );

            // Exit function
            return;
        }

        /**
         * Whether or not the cooldown expired
         */
        const cooldownValidation = await validateCooldown(modal, interaction);

        // Check if cooldown expired
        if (typeof cooldownValidation === "number") {
            // Interaction response
            interaction.reply({
                content: `You need to wait ${underlined(
                    cooldownValidation
                )} more seconds before submitting the modal ${bold(interaction.customId)} again. Please be patient.`,
                ephemeral: true,
            });

            // Exit function
            return;
        }

        // Try to forward modal interaction response prompt
        await modal
            .execute(configuration, interaction)
            .then(() =>
                // Notification
                updateCooldown("ModalSubmit", modal, interaction)
            )
            .catch(async (error: Error) => {
                // Interaction response
                interaction.reply({
                    content: `I'm sorry, but there was an error handling your interaction with the modal ${bold(
                        modal.name
                    )}.`,
                    ephemeral: true,
                });

                // Notification
                notify(
                    configuration,
                    "error",
                    `Failed to execute modal '${modal.name}':\n${error}`,
                    interaction.client,
                    `I failed to execute the modal ${bold(modal.name)}:\n${code(
                        error.message
                    )}\nHave a look at the logs for more information.`
                );
            });
    },
};

export default interactionType;
