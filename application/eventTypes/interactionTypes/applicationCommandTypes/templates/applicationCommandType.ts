// Global imports
import "../../../../globals/cooldownValidator";
import "../../../../globals/discordTextFormat";
import "../../../../globals/notifications";
import { applicationCommands } from "../../../../../globals/variables";

// Type imports
import {
    ApplicationCommandType,
    ChatInputCommandInteraction,
    MessageContextMenuCommandInteraction,
    UserContextMenuCommandInteraction,
} from "discord.js";
import { SavedApplicationCommandType } from "../../../../../types/applicationCommands";
import { Configuration } from "../../../../../types/configuration";

/**
 * Template for application command type handler
 */
const applicationCommandInteraction: SavedApplicationCommandType = {
    type: ApplicationCommandType.ChatInput | ApplicationCommandType.Message | ApplicationCommandType.User,

    async execute(
        configuration: Configuration,
        interaction:
            | ChatInputCommandInteraction
            | MessageContextMenuCommandInteraction
            | UserContextMenuCommandInteraction
    ) {
        /**
         * Application command that was interacted with
         */
        const applicationCommand = applicationCommands
            .filter((applicationCommand) => applicationCommand.type === this.type)
            .get(interaction.commandName);

        // Check if application command was found
        if (applicationCommand) {
            /**
             * Whether or not the cooldown expired
             */
            const cooldownValidation = await validateCooldown(applicationCommand, interaction);

            // Check if cooldown expired
            if (cooldownValidation === true) {
                // Try to forward application command interaction response prompt
                await applicationCommand.execute(configuration, interaction).catch(async (error: Error) => {
                    // Interaction response
                    interaction.reply({
                        content: `I'm sorry, but there was an error handling your interaction with the application command ${bold(
                            interaction.commandName
                        )}.`,
                        ephemeral: true,
                    });

                    // Notifications
                    notify(
                        configuration,
                        "error",
                        `Failed to execute application command '${interaction.commandName}':\n${error.message}`,
                        interaction.client,
                        `I failed to execute the application command ${bold(interaction.commandName)}:\n${code(
                            error.message
                        )}`
                    );
                });
            } else {
                // Interaction response
                interaction.reply({
                    content: `You need to wait ${underlined(
                        cooldownValidation
                    )} more seconds before using the application command ${bold(
                        interaction.commandName
                    )} again. Please be patient.`,
                    ephemeral: true,
                });
            }
        } else {
            // Interaction response
            interaction.reply({
                content: `I'm sorry, but it looks like interactions with the application command ${bold(
                    interaction.commandName
                )} cannot be processed at the moment.`,
                ephemeral: true,
            });

            // Notifications
            notify(
                configuration,
                "error",
                `Found no file handling application command '${interaction.commandName}'`,
                interaction.client,
                `I didn't find any file handling the application command ${bold(interaction.commandName)}!`
            );
        }
    },
};

export default applicationCommandInteraction;
