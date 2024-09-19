// Global imports
import "../../globals/discordTextFormat";
import "../../globals/notifications";
import { blockedUsers, interactionTypes } from "../../globals/variables";

// Type imports
import { Events, Interaction, InteractionType } from "discord.js";
import { Configuration } from "../../types/configuration";
import { SavedEventType } from "../../types/interfaces";

/**
 * Interaction event handler
 */
const interactionCreate: SavedEventType = {
    type: Events.InteractionCreate,

    async execute(configuration: Configuration, interaction: Interaction): Promise<void> {
        // Check if user is allowed to interact with bot
        if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) {
            if (configuration.bot.enableBlockedUsers && blockedUsers.includes(interaction.user.id)) {
                // Interaction response
                interaction.reply({
                    content: "I'm sorry, you are currently not allowed to interact with me.",
                    ephemeral: true,
                });

                // Exit function
                return;
            } else if (!configuration.bot.enableBotInteraction && interaction.user.bot) {
                // Interaction response
                interaction.reply("I'm sorry, but I'm not allowed to respond to interactions from bots.");

                // Exit function
                return;
            }
        }

        /**
         * Interaction type handler matching the interaction type
         */
        const interactionType = interactionTypes.get(interaction.type);

        // Check if interaction type was found
        if (!interactionType) {
            // Check if interaction is autocomplete interaction
            if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) {
                // Interaction response
                interaction.reply({
                    content: `I'm sorry, but it looks like interactions of the type ${bold(
                        InteractionType[interaction.type]
                    )} cannot be processed at the moment.`,
                    ephemeral: true,
                });
            }

            // Notification
            notify(
                configuration,
                "error",
                `Found no file handling interaction type '${InteractionType[interaction.type]}'`,
                interaction.client,
                `I didn't find any file handling the interaction type ${bold(InteractionType[interaction.type])}!`
            );

            // Exit function
            return;
        }

        // Try to forward interaction response prompt
        interactionType.execute(configuration, interaction).catch((error: Error) => {
            // Check if interaction is autocomplete interaction
            if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) {
                // Interaction response
                interaction.reply({
                    content: `I'm sorry, but there was an error handling your interaction of the type ${bold(
                        InteractionType[interaction.type]
                    )}.`,
                    ephemeral: true,
                });
            }

            // Notification
            notify(
                configuration,
                "error",
                `Failed to execute interaction type '${InteractionType[interaction.type]}':\n${error}`,
                interaction.client,
                `I failed to execute the interaction type ${bold(InteractionType[interaction.type])}:\n${code(
                    error.message
                )}`
            );
        });

    },
};

export default interactionCreate;
