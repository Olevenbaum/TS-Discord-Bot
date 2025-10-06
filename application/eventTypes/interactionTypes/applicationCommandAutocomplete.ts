// Global imports
import "../../../globals/discordTextFormat";
import "../../../globals/notifications";
import { applicationCommands, timestamps } from "../../../globals/variables";

// Type imports
import { ApplicationCommandType, AutocompleteInteraction, InteractionType } from "discord.js";
import { SavedChatInputCommand } from "../../../types/applicationCommands";
import { Configuration } from "../../../types/configuration";
import { SavedInteractionType } from "../../../types/others";

/**
 * Chat input command autocomplete interaction handler
 */
const chatInputCommandAutocompleteInteraction: SavedInteractionType = {
    type: InteractionType.ApplicationCommandAutocomplete,

    async execute(configuration: Configuration, interaction: AutocompleteInteraction) {
        /**
         * Chat input command that the autocomplete was requested for
         */
        const chatInputCommand = applicationCommands[
			ApplicationCommandType[ApplicationCommandType.ChatInput] as keyof typeof ApplicationCommandType
		]?.get(interaction.commandName) as SavedChatInputCommand | undefined;

		// Check if chat input command is implemented
		if (!(chatInputCommand && chatInputCommand.autocomplete)) {
			interaction.respond([]);

			/**
			 * Timestamp of the last notification sent
			 */
			const lastNotificationTimestamp = timestamps.get(
				`${InteractionType[InteractionType.ApplicationCommandAutocomplete]}:${interaction.commandId}`,
			);

			// Check if timer to send notification has passed
			if (
				!lastNotificationTimestamp ||
				interaction.createdAt.getTime() >
					lastNotificationTimestamp.getTime() +
						configuration.project.applicationCommandAutocompleteErrorCooldown * 1000
			) {
				timestamps.set(
					`${InteractionType[InteractionType.ApplicationCommandAutocomplete]}:${interaction.commandId}`,
					interaction.createdAt,
				);

				notify(
					configuration,
					"ERROR",
					`Found no file handling autocomplete for chat input command '${interaction.commandName}'`,
					interaction.client,
					`I couldn't find any file handling the autocomplete for the chat input command ${commandMention(
						interaction,
					)}.`,
					2,
				);
			}

			return;
		}

		// Try to forward chat input command autocomplete interaction response prompt
		await chatInputCommand.autocomplete(configuration, interaction).catch((error: Error) => {
			/**
			 * Timestamp of the last notification sent
			 */
			const lastNotificationTimestamp = timestamps.get(
				`${InteractionType[InteractionType.ApplicationCommandAutocomplete]}:${interaction.commandId}`,
			);

			// Check if timer to send notification has passed
			if (
				!lastNotificationTimestamp ||
				interaction.createdAt.getTime() >
					lastNotificationTimestamp.getTime() +
						configuration.project.applicationCommandAutocompleteErrorCooldown * 1000
			) {
				timestamps.set(
					`${InteractionType[InteractionType.ApplicationCommandAutocomplete]}:${interaction.commandId}`,
					interaction.createdAt,
				);

				notify(
					configuration,
					"ERROR",
					`Failed to provide autocomplete options for chat input command ${commandMention(
						interaction,
					)}:\n${error}`,
					interaction.client,
					`I failed to provide autocomplete for the command ${commandMention(interaction)}:\n${code(
						error.message,
					)}\nHave a look at the logs for more information.`,
					3,
				);
			}
		});
    },
};

export default chatInputCommandAutocompleteInteraction;
