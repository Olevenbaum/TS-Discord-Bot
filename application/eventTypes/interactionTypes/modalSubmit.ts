// Global imports
import "../../../globals/cooldownValidator";
import "../../../globals/discordTextFormat";
import "../../../globals/notifications";
import { modals } from "../../../globals/variables";

// Type imports
import { InteractionType, ModalSubmitInteraction } from "discord.js";
import { Configuration } from "../../../types/configuration";
import { SavedInteractionType } from "../../../types/interfaces.d";

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
        if (modal) {
            /**
             * Whether or not the cooldown expired
             */
            const cooldownValidation = await validateCooldown(modal, interaction);

            // Check if cooldown expired
            if (cooldownValidation === true) {
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
                            `Failed to execute modal '${modal.name}':\n${error.message}`,
                            interaction.client,
                            `I failed to execute the modal ${bold(modal.name)}:\n${code(error.message)}!`
                        );
                    });
            } else {
                // Interaction response
                interaction.reply({
                    content: `You need to wait ${underlined(
                        cooldownValidation
                    )} more seconds before submitting the modal ${bold(
                        interaction.customId
                    )} again. Please be patient.`,
                    ephemeral: true,
                });
            }
        } else {
            // Interaction response
            interaction.reply({
                content: `I'm sorry, but it looks like interactions with the modal ${bold(
                    interaction.customId
                )} cannot be processed at the moment.`,
                ephemeral: true,
            });

            // Notification
            notify(
                configuration,
                "error",
                `Found no file handling modal '${interaction.customId}'`,
                interaction.client,
                `I didn't find any file handling the application command type ${bold(interaction.customId)}!`
            );
        }
    },
};

export default interactionType;
