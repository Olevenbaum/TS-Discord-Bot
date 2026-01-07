// Class & type imports
import type { SavedChatInputCommand, SavedInteractionType } from "../../../types";

// Data imports
import { applicationCommands, configuration, timestamps } from "#variables";

// External libraries imports
import {
	ApplicationCommandType,
	AutocompleteInteraction,
	chatInputApplicationCommandMention,
	codeBlock,
	InteractionType,
} from "discord.js";

// Module imports
import notify from "../../../modules/notification";

/** Chat input command autocomplete interaction handler */
const chatInputCommandAutocompleteInteraction: SavedInteractionType = {
	type: InteractionType.ApplicationCommandAutocomplete,

	async execute(interaction: AutocompleteInteraction) {
		/** Chat input command that the autocomplete was requested for */
		const chatInputCommand = applicationCommands[ApplicationCommandType.ChatInput]?.get(interaction.commandName) as
			| SavedChatInputCommand
			| undefined;

		if (!(chatInputCommand && chatInputCommand.autocomplete)) {
			interaction.respond([]);

			/** Timestamp of the last notification sent */
			const lastNotificationTimestamp = timestamps.get(
				`${InteractionType[InteractionType.ApplicationCommandAutocomplete]}:${interaction.commandId}`,
			);

			if (
				!lastNotificationTimestamp ||
				interaction.createdAt.getTime() >
					lastNotificationTimestamp.getTime() + (configuration.bot.autocompleteErrorCooldown ?? 300) * 1000
			) {
				timestamps.set(
					`${InteractionType[InteractionType.ApplicationCommandAutocomplete]}:${interaction.commandId}`,
					interaction.createdAt,
				);

				notify(
					`Found no file handling autocomplete for chat input command '${interaction.commandName}'`,
					"ERROR",
					`I couldn't find any file handling autocompletion for the chat input command ${chatInputApplicationCommandMention(
						interaction.commandName,
						interaction.commandId,
					)}.`,
					5,
				);
			}

			return;
		}

		await chatInputCommand.autocomplete(interaction).catch((error: Error) => {
			/** Timestamp of the last notification sent */
			const lastNotificationTimestamp = timestamps.get(
				`${InteractionType[InteractionType.ApplicationCommandAutocomplete]}:${interaction.commandId}`,
			);

			if (
				!lastNotificationTimestamp ||
				interaction.createdAt.getTime() >
					lastNotificationTimestamp.getTime() + (configuration.bot.autocompleteErrorCooldown ?? 300) * 1000
			) {
				timestamps.set(
					`${InteractionType[InteractionType.ApplicationCommandAutocomplete]}:${interaction.commandId}`,
					interaction.createdAt,
				);

				notify(
					`Failed to provide autocomplete options for chat input command ${chatInputApplicationCommandMention(
						interaction.commandName,
						interaction.commandId,
					)}:`,
					error,
					`I failed to provide autocompletion for the command ${chatInputApplicationCommandMention(
						interaction.commandName,
						interaction.commandId,
					)}:\n${codeBlock(error.message)}\nHave a look at the logs for more information.`,
					4,
				);
			}
		});
	},
};

export default chatInputCommandAutocompleteInteraction;
