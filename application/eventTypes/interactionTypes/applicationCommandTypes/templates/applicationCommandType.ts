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
    Team,
    User,
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
        const applicationCommand = applicationCommands[
            ApplicationCommandType[this.type] as keyof typeof ApplicationCommandType
        ].get(interaction.commandName);

        // Check if application command was found
        if (!applicationCommand) {
            // Interaction response
            interaction.reply({
                content: `I'm sorry, but it seems that interactions with the application command ${bold(
                    interaction.commandName
                )} can't be processed at the moment.`,
                ephemeral: true,
            });

            // Notifications
            notify(
                configuration,
                "error",
                `Found no file handling application command '${interaction.commandName}'`,
                interaction.client,
                `I couldn't find any file handling the application command ${bold(interaction.commandName)}.`
            );

            // Exit function
            return;
        }

        // Check if chat input command is for owners only
        if (applicationCommand.owner) {
            // Fetch bot owner
            await interaction.client.application.fetch();

            // Check if user is bot owner
            if (
                (interaction.client.application.owner instanceof User &&
                    interaction.user.id !== interaction.client.application.owner.id) ||
                (interaction.client.application.owner instanceof Team &&
                    !interaction.client.application.owner.members.has(interaction.user.id))
            ) {
                // Interaction response
                interaction.reply({
                    content: `I'm sorry, but you don't have permission to use the application command ${bold(
                        interaction.commandName
                    )}.`,
                    ephemeral: true,
                });

                // Exit function
                return;
            }
        }

        /**
         * Whether or not the cooldown expired
         */
        const cooldownValidation = await validateCooldown(applicationCommand, interaction);

        // Check if cooldown expired
        if (typeof cooldownValidation === "number") {
            // Interaction response
            interaction.reply({
                content: `You need to wait ${underlined(
                    cooldownValidation
                )} more seconds before using the application command ${bold(
                    interaction.commandName
                )} again. Please be patient.`,
                ephemeral: true,
            });

            // Exit function
            return;
        }

        // Try to forward application command interaction response prompt
        await applicationCommand
            .execute(configuration, interaction)
            .then(() =>
                // Update cooldown
                updateCooldown("ApplicationCommand", applicationCommand, interaction)
            )
            .catch(async (error: Error) => {
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
                    `Failed to execute application command '${interaction.commandName}':\n${error}`,
                    interaction.client,
                    `I failed to execute the application command ${bold(interaction.commandName)}:\n${code(
                        error.message
                    )}\nHave a look at the logs for more information.`
                );
            });
    },
};

export default applicationCommandInteraction;
