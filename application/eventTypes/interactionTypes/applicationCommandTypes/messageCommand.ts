// Global imports
import "../../../../globals/cooldownValidator";
import "../../../../globals/discordTextFormat";
import "../../../../globals/notifications";
import { applicationCommands } from "../../../../globals/variables";

// Type imports
import { ApplicationCommandType, MessageContextMenuCommandInteraction } from "discord.js";
import { SavedApplicationCommandType, SavedMessageCommand } from "../../../../types/applicationCommands";
import { Configuration } from "../../../../types/configuration";

/**
 * Message command handler
 */
const userCommandInteraction: SavedApplicationCommandType = {
    type: ApplicationCommandType.Message,

    async execute(configuration: Configuration, interaction: MessageContextMenuCommandInteraction) {
        /**
         * Message application command that was interacted with
         */
        const messageCommand = applicationCommands
            .filter((applicationCommand) => applicationCommand.type === this.type)
            .get(interaction.commandName) as SavedMessageCommand | undefined;

        // Check if message command was found and cooldown expired
        if (messageCommand) {
            /**
             * Whether or not the cooldown expired
             */
            const cooldownValidation = await validateCooldown(messageCommand, interaction);

            // Check if cooldown expired
            if (cooldownValidation === true) {
                // Try to forward message application command interaction response prompt
                await messageCommand
                    .execute(configuration, interaction)
                    .then(() =>
                        // Update cooldown
                        updateCooldown("ApplicationCommand", messageCommand, interaction)
                    )
                    .catch(async (error: Error) => {
                        // Interaction response
                        interaction.reply({
                            content: `I'm sorry, but there was an error handling your interaction with the message command ${bold(
                                interaction.commandName
                            )}.`,
                            ephemeral: true,
                        });

                        // Notifications
                        notify(
                            configuration,
                            "error",
                            `Failed to execute message command '${interaction.commandName}':\n${error.message}`,
                            interaction.client,
                            `I failed to execute the message command ${bold(interaction.commandName)}:\n${code(
                                error.message
                            )}`
                        );
                    });
            } else {
                // Interaction response
                interaction.reply({
                    content: `You need to wait ${underlined(
                        cooldownValidation
                    )} more seconds before using the message command ${bold(
                        interaction.commandName
                    )} again. Please be patient.`,
                    ephemeral: true,
                });
            }
        } else {
            // Interaction response
            interaction.reply({
                content: `I'm sorry, but it looks like interactions with the message command ${bold(
                    interaction.commandName
                )} cannot be processed at the moment.`,
                ephemeral: true,
            });

            // Notifications
            notify(
                configuration,
                "error",
                `Found no file handling message command '${interaction.commandName}'`,
                interaction.client,
                `I didn't find any file handling the message command ${bold(interaction.commandName)}!`
            );
        }
    },
};

export default userCommandInteraction;
