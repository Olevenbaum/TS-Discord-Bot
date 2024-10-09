// Global imports
import "../../../globals/notifications";
import { applicationCommandTypes } from "../../../globals/variables";

// Type imports
import { ApplicationCommandType, CommandInteraction, InteractionType } from "discord.js";
import { Configuration } from "types/configuration";
import { SavedInteractionType } from "../../../types/others";

/**
 * Application command interaction handler
 */
const interactionType: SavedInteractionType = {
    type: InteractionType.ApplicationCommand,

    async execute(configuration: Configuration, interaction: CommandInteraction) {
        /**
         * Application command type of the application command that was interacted with
         */
        const applicationCommandType = applicationCommandTypes.get(interaction.commandType);

        // Check if application command type was found
        if (!applicationCommandType) {
            // Interaction response
            interaction.reply({
                content: `I'm sorry, but it seems that interactions with the application command type ${bold(
                    ApplicationCommandType[interaction.commandType]
                )} can't be processed at the moment.`,
                ephemeral: true,
            });

            // Notification
            notify(
                configuration,
                "error",
                `Found no file handling application command type '${ApplicationCommandType[interaction.commandType]}'`,
                interaction.client,
                `I couldn't find any file handling the application command type ${bold(
                    ApplicationCommandType[interaction.commandType]
                )}.`
            );

            // Exit function
            return;
        }

        // Try to forward application command interaction response prompt
        applicationCommandType.execute(configuration, interaction).catch((error: Error) => {
            // Interaction response
            interaction.reply({
                content: `I'm sorry, but there was an error handling your interaction with the application command type ${bold(
                    ApplicationCommandType[interaction.commandType]
                )}.`,
                ephemeral: true,
            });

            // Notification
            notify(
                configuration,
                "error",
                `Failed to execute application command type '${
                    ApplicationCommandType[interaction.commandType]
                }':\n${error}`,
                interaction.client,
                `I failed to execute the application command type ${bold(
                    ApplicationCommandType[interaction.commandType]
                )}:\n${code(error.message)}\nHave a look at the logs for more information.`
            );
        });
    },
};

export default interactionType;
