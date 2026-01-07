// Class & type imports
import type { SavedApplicationCommandType, SavedChatInputCommand } from "../../../../types";

// Data imports
import { applicationCommands } from "#variables";

// External libraries imports
import {
	ApplicationCommandType,
	chatInputApplicationCommandMention,
	ChatInputCommandInteraction,
	codeBlock,
	Collection,
	MessageFlags,
	Team,
	underline,
	User,
} from "discord.js";

// Module imports
import notify from "../../../../modules/notification";
import { updateCooldown, validateCooldown } from "../../../../modules/utilities";

/** Chat input command handler */
const chatInputCommandInteraction: SavedApplicationCommandType = {
	type: ApplicationCommandType.ChatInput,

	async execute(interaction: ChatInputCommandInteraction) {
		/** Chat input command that was interacted with */
		const chatInputCommand = (applicationCommands[this.type] as Collection<string, SavedChatInputCommand>)?.get(
			interaction.commandName,
		);

		if (!chatInputCommand) {
			interaction.reply({
				content: `I'm sorry, but it seems like interactions with the command ${chatInputApplicationCommandMention(
					interaction.commandName,
					interaction.commandId,
				)} can't be processed at the moment.`,
				flags: MessageFlags.Ephemeral,
			});

			notify(
				`Found no file handling chat input command '${interaction.commandName}'`,
				"ERROR",
				`I couldn't find any file handling the chat input command ${chatInputApplicationCommandMention(
					interaction.commandName,
					interaction.commandId,
				)}.`,
				5,
			);

			return;
		}

		if (chatInputCommand.owner) {
			await interaction.client.application.fetch();

			if (
				(interaction.client.application.owner instanceof User &&
					interaction.user.id !== interaction.client.application.owner.id) ||
				(interaction.client.application.owner instanceof Team &&
					!interaction.client.application.owner.members.has(interaction.user.id))
			) {
				interaction.reply({
					content: `I'm sorry, but you don't have permission to use the command ${chatInputApplicationCommandMention(
						interaction.commandName,
						interaction.commandId,
					)}.`,
					flags: MessageFlags.Ephemeral,
				});

				return;
			}
		}

		/**
		 * Whether the cooldown expired or the time (in seconds) a user has to wait till they can use the chat input
		 * command again
		 */
		const cooldownValidation = await validateCooldown(chatInputCommand, interaction);

		if (typeof cooldownValidation === "number") {
			interaction.reply({
				content: `You need to wait ${underline(
					cooldownValidation.toString(),
				)} more seconds before using the command ${chatInputApplicationCommandMention(
					interaction.commandName,
					interaction.commandId,
				)} again. Please be patient.`,
				flags: MessageFlags.Ephemeral,
			});

			return;
		}

		await chatInputCommand
			.execute(interaction)
			.then(() => updateCooldown("ApplicationCommand", chatInputCommand, interaction))
			.catch(async (error: Error) => {
				interaction.reply({
					content: `I'm sorry, but there was an error handling your interaction with the command ${chatInputApplicationCommandMention(
						interaction.commandName,
						interaction.commandId,
					)}.`,
					flags: MessageFlags.Ephemeral,
				});

				notify(
					`Failed to execute chat input command '${interaction.commandName}':`,
					error,
					`I failed to execute the chat input command ${chatInputApplicationCommandMention(
						interaction.commandName,
						interaction.commandId,
					)}:\n${codeBlock(error.message)}\nHave a look at the logs for more information.`,
					4,
				);
			});
	},
};

export default chatInputCommandInteraction;
