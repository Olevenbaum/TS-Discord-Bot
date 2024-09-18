// Global imports
import "../../../../globals/cooldownValidator";
import "../../../../globals/discordTextFormat";
import "../../../../globals/notifications";
import { applicationCommands } from "../../../../globals/variables";

// Type imports
import { ApplicationCommandType, UserContextMenuCommandInteraction } from "discord.js";
import { SavedApplicationCommandType, SavedUserCommand } from "../../../../types/applicationCommands";
import { Configuration } from "../../../../types/configuration";

/**
 * User command handler
 */
const userCommandInteraction: SavedApplicationCommandType = {
    type: ApplicationCommandType.User,

    async execute(configuration: Configuration, interaction: UserContextMenuCommandInteraction) {
        /**
         * User command that was interacted with
         */
        const userCommand = applicationCommands
            .filter((applicationCommand) => applicationCommand.type === this.type)
            .get(interaction.commandName) as SavedUserCommand | undefined;

        // Check if user command was found and cooldown expired
        if (userCommand) {
            /**
             * Whether or not the cooldown expired
             */
            const cooldownValidation = await validateCooldown(userCommand, interaction);

            // Check if cooldown expired
            if (cooldownValidation === true) {
                // Try to forward user application command interaction response prompt
                await userCommand
                    .execute(configuration, interaction)
                    .then(() =>
                        // Update cooldown
                        updateCooldown("ApplicationCommand", userCommand, interaction)
                    )
                    .catch(async (error: Error) => {
                        // Interaction response
                        interaction.reply({
                            content: `I'm sorry, but there was an error handling your interaction with the user command ${bold(
                                interaction.commandName
                            )}.`,
                            ephemeral: true,
                        });

                        // Notifications
                        notify(
                            configuration,
                            "error",
                            `Failed to execute user command '${interaction.commandName}':\n${error.message}`,
                            interaction.client,
                            `I failed to execute the user command ${bold(interaction.commandName)}:\n${code(
                                error.message
                            )}`
                        );
                    });
            } else {
                // Interaction response
                interaction.reply({
                    content: `You need to wait ${underlined(
                        cooldownValidation
                    )} more seconds before using the user command ${bold(
                        interaction.commandName
                    )} again. Please be patient.`,
                    ephemeral: true,
                });
            }
        } else {
            // Interaction response
            interaction.reply({
                content: `I'm sorry, but it looks like interactions with the user command ${bold(
                    interaction.commandName
                )} cannot be processed at the moment.`,
                ephemeral: true,
            });

            // Notifications
            notify(
                configuration,
                "error",
                `Found no file handling user command '${interaction.commandName}'`,
                interaction.client,
                `I didn't find any file handling the user command ${bold(interaction.commandName)}!`
            );
        }
    },
};

export default userCommandInteraction;
