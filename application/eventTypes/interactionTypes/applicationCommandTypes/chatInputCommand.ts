// Global imports
import "../../../../globals/discordTextFormat";
import "../../../../globals/cooldownValidator";
import "../../../../globals/notifications";
import { applicationCommands } from "../../../../globals/variables";

// Type imports
import { ApplicationCommandType, ChatInputCommandInteraction, Team, User } from "discord.js";
import { SavedApplicationCommandType, SavedChatInputCommand } from "../../../../types/applicationCommands";
import { Configuration } from "../../../../types/configuration";

/**
 * Chat input command handler
 */
const chatInputCommandInteraction: SavedApplicationCommandType = {
	type: ApplicationCommandType.ChatInput,

	async execute(configuration: Configuration, interaction: ChatInputCommandInteraction) {
		/**
		 * Chat input command that was interacted with
		 */
		const chatInputCommand = applicationCommands[
			ApplicationCommandType[this.type] as keyof typeof ApplicationCommandType
		]?.get(interaction.commandName) as SavedChatInputCommand | undefined;

		// Check if chat input command is implemented
		if (!chatInputCommand) {
			interaction.reply({
				content: `I'm sorry, but it seems that interactions with the chat input command ${commandMention(
					interaction,
				)} can't be processed at the moment.`,
				ephemeral: true,
			});

			notify(
				configuration,
				"ERROR",
				`Found no file handling chat input command '${interaction.commandName}'`,
				interaction.client,
				`I couldn't find any file handling the chat input command ${commandMention(interaction)}.`,
				2,
			);

			return;
		}

		// Check if chat input command is for owners only
		if (chatInputCommand.owner) {
			await interaction.client.application.fetch();

			if (
				(interaction.client.application.owner instanceof User &&
					interaction.user.id !== interaction.client.application.owner.id) ||
				(interaction.client.application.owner instanceof Team &&
					!interaction.client.application.owner.members.has(interaction.user.id))
			) {
				interaction.reply({
					content: `I'm sorry, but you don't have permission to use the chat input command ${commandMention(
						interaction,
					)}.`,
					ephemeral: true,
				});

				return;
			}
		}

		/**
		 * Whether the cooldown expired or the time (in seconds) a user has to wait till they can use the chat input command
		 * again
		 */
		const cooldownValidation = await validateCooldown(chatInputCommand, interaction);

		// Check if cooldown expired
		if (typeof cooldownValidation === "number") {
			interaction.reply({
				content: `You need to wait ${underlined(
					cooldownValidation,
				)} more seconds before using the chat input command ${commandMention(
					interaction,
				)} again. Please be patient.`,
				ephemeral: true,
			});

			return;
		}

		await chatInputCommand
			.execute(configuration, interaction)
			.then(() => updateCooldown("ApplicationCommand", chatInputCommand, interaction))
			.catch(async (error: Error) => {
				interaction.reply({
					content: `I'm sorry, but there was an error handling your interaction with the chat input command ${commandMention(
						interaction,
					)}.`,
					ephemeral: true,
				});

				notify(
					configuration,
					"ERROR",
					`Failed to execute chat input command '${interaction.commandName}':\n${error}`,
					interaction.client,
					`I failed to execute the chat input command ${commandMention(interaction)}:\n${code(
						error.message,
					)}\nHave a look at the logs for more information.`,
					3,
				);
			});
	},
};

export default chatInputCommandInteraction;
