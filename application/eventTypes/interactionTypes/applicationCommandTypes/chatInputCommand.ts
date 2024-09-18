// Global imports
import "../../../../globals/discordTextFormat";
import "../../../../globals/cooldownValidator";
import "../../../../globals/notifications";
import { applicationCommands } from "../../../../globals/variables";

// Type imports
import { ApplicationCommandType, ChatInputCommandInteraction } from "discord.js";
import { SavedApplicationCommandType, SavedChatInputCommand } from "../../../../types/applicationCommands";
import { Configuration } from "../../../../types/configuration";

/**
 * Chat input command handler
 */
const chatInputCommandInteraction: SavedApplicationCommandType = {
    type: ApplicationCommandType.ChatInput,

    async execute(configuration: Configuration, interaction: ChatInputCommandInteraction) {
        /**
         * Chat input command that was interacted with
         */
        const chatInputCommand = applicationCommands
            .filter((applicationCommand) => applicationCommand.type === this.type)
            .get(interaction.commandName) as SavedChatInputCommand | undefined;

        // Check if chat input command was found and cooldown expired
        if (chatInputCommand) {
            /**
             * Whether or not the cooldown expired
             */
            const cooldownValidation = await validateCooldown(chatInputCommand, interaction);

            // Check if cooldown expired
            if (cooldownValidation === true) {
                // Try to forward chat input command interaction response prompt
                await chatInputCommand
                    .execute(configuration, interaction)
                    .then(() =>
                        // Update cooldown
                        updateCooldown("ApplicationCommand", chatInputCommand, interaction)
                    )
                    .catch(async (error: Error) => {
                        // Interaction response
                        interaction.reply({
                            content: `I'm sorry, but there was an error handling your interaction with the chat input command ${commandMention(
                                interaction
                            )}.`,
                            ephemeral: true,
                        });

                        // Notifications
                        notify(
                            configuration,
                            "error",
                            `Failed to execute chat input command '${interaction.commandName}':\n${error.message}`,
                            interaction.client,
                            `I failed to execute the chat input command ${commandMention(interaction)}:\n${code(
                                error.message
                            )}`
                        );
                    });
            } else {
                // Interaction response
                interaction.reply({
                    content: `You need to wait ${underlined(
                        cooldownValidation
                    )} more seconds before using the chat input command ${commandMention(
                        interaction
                    )} again. Please be patient.`,
                    ephemeral: true,
                });
            }
        } else {
            // Interaction response
            interaction.reply({
                content: `I'm sorry, but it looks like interactions with the chat input command ${commandMention(
                    interaction
                )} cannot be processed at the moment.`,
                ephemeral: true,
            });

            // Notifications
            notify(
                configuration,
                "error",
                `Found no file handling chat input command '${interaction.commandName}'`,
                interaction.client,
                `I didn't find any file handling the chat input command ${commandMention(interaction)}!`
            );
        }
    },
};

export default chatInputCommandInteraction;
