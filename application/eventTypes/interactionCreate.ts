// Global imports
import "../../globals/discordTextFormat";
import "../../globals/notifications";
import { blockedUsers, interactionTypes } from "../../globals/variables";

// Type imports
import { Events, Interaction, InteractionType } from "discord.js";
import { Configuration } from "../../types/configuration";
import { SavedEventType } from "../../types/others";

/**
 * Interaction event handler
 */
const interactionCreate: SavedEventType = {
    type: Events.InteractionCreate,

    async execute(configuration: Configuration, interaction: Interaction): Promise<void> {
        // Check if user is allowed to interact with bot
        if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) {
            if (
                (configuration.bot.enableBlockedUsers ?? true) &&
                (blockedUsers.global.includes(interaction.user.id) ||
                    (interaction.guildId && blockedUsers.guilds[interaction.guildId]?.includes(interaction.user.id)))
            ) {
                interaction.reply({
                    content: "I'm sorry, you are currently not allowed to interact with me.",
                    ephemeral: true,
                });

                return;
            } else if (!configuration.bot.enableBotInteraction && interaction.user.bot) {
                interaction.reply("I'm sorry, but I'm not allowed to respond to interactions from bots.");

                return;
            }
        }

        /**
         * Interaction type handler matching the interaction type
         */
        const interactionType = interactionTypes.get(interaction.type);

        // Check if interaction type handler is implemented
        if (!interactionType) {
			if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) {
				interaction.reply({
					content: `I'm sorry, but it seems that interactions of the type ${bold(
						InteractionType[interaction.type],
					)} can't be processed at the moment.`,
					ephemeral: true,
				});
			}

			notify(
				configuration,
				"ERROR",
				`Found no file handling interaction type '${InteractionType[interaction.type]}'`,
				interaction.client,
				`I couldn't find any file handling the interaction type ${bold(InteractionType[interaction.type])}.`,
				2,
			);

			return;
		}

		interactionType.execute(configuration, interaction).catch((error: Error) => {
			if (interaction.type !== InteractionType.ApplicationCommandAutocomplete) {
				interaction.reply({
					content: `I'm sorry, but there was an error handling your interaction of the type ${bold(
						InteractionType[interaction.type],
					)}.`,
					ephemeral: true,
				});
			}

			notify(
				configuration,
				"ERROR",
				`Failed to execute interaction type '${InteractionType[interaction.type]}':\n${error}`,
				interaction.client,
				`I failed to execute the interaction type ${bold(InteractionType[interaction.type])}:\n${code(
					error.message,
				)}\nHave a look at the logs for more information.`,
				3,
			);
		});
    },
};

export default interactionCreate;
