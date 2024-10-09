// Global imports
import "../../../../globals/cooldownValidator";
import "../../../../globals/discordTextFormat";
import "../../../../globals/notifications";
import { applicationCommands } from "../../../../globals/variables";

// Type imports
import { ApplicationCommandType, MessageContextMenuCommandInteraction, Team, User } from "discord.js";
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
        const messageCommand = applicationCommands[
            ApplicationCommandType[this.type] as keyof typeof ApplicationCommandType
        ].get(interaction.commandName) as SavedMessageCommand | undefined;

        // Check if message command was found and cooldown expired
        if (!messageCommand) {
            // Interaction response
            interaction.reply({
                content: `I'm sorry, but it seems that interactions with the message command ${bold(
                    interaction.commandName
                )} can't be processed at the moment.`,
                ephemeral: true,
            });

            // Notifications
            notify(
                configuration,
                "error",
                `Found no file handling message command '${interaction.commandName}'`,
                interaction.client,
                `I couldn't find any file handling the message command ${bold(interaction.commandName)}.`
            );

            // Exit function
            return;
        }

        // Check if chat input command is for owners only
        if (messageCommand.owner) {
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
                    content: `I'm sorry, but you don't have permission to use the message command ${bold(
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
        const cooldownValidation = await validateCooldown(messageCommand, interaction);

        // Check if cooldown expired
        if (typeof cooldownValidation === "number") {
            // Interaction response
            interaction.reply({
                content: `You need to wait ${underlined(
                    cooldownValidation
                )} more seconds before using the message command ${bold(
                    interaction.commandName
                )} again. Please be patient.`,
                ephemeral: true,
            });

            // Exit function
            return;
        }

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
                    `Failed to execute message command '${interaction.commandName}':\n${error}`,
                    interaction.client,
                    `I failed to execute the message command ${bold(interaction.commandName)}:\n${code(
                        error.message
                    )}\nHave a look at the logs for more information.`
                );
            });
    },
};

export default userCommandInteraction;
