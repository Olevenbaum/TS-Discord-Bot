// Global imports
import "../../../../../globals/cooldownValidator";
import "../../../../../globals/discordTextFormat";
import "../../../../../globals/notifications";
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

/** Template for application command type handler */
const applicationCommandInteraction: SavedApplicationCommandType = {
	type: ApplicationCommandType.ChatInput | ApplicationCommandType.Message | ApplicationCommandType.User,

	async execute(
		interaction:
			| ChatInputCommandInteraction
			| MessageContextMenuCommandInteraction
			| UserContextMenuCommandInteraction,
	) {
		/** Application command that was interacted with */
		const applicationCommand = applicationCommands[
			ApplicationCommandType[this.type] as keyof typeof ApplicationCommandType
		]?.get(interaction.commandName);

		if (!applicationCommand) {
			interaction.reply({
				content: `I'm sorry, but it seems like interactions with the command ${bold(
					interaction.commandName,
				)} can't be processed at the moment.`,
				ephemeral: true,
			});

			notify(
				"ERROR",
				`Found no file handling application command '${interaction.commandName}'`,
				interaction.client,
				`I couldn't find any file handling the application command ${bold(interaction.commandName)}.`,
				4,
			);

			return;
		}

		if (applicationCommand.owner) {
			await interaction.client.application.fetch();

			if (
				(interaction.client.application.owner instanceof User &&
					interaction.user.id !== interaction.client.application.owner.id) ||
				(interaction.client.application.owner instanceof Team &&
					!interaction.client.application.owner.members.has(interaction.user.id))
			) {
				interaction.reply({
					content: `I'm sorry, but you don't have permission to use the command ${bold(
						interaction.commandName,
					)}.`,
					ephemeral: true,
				});

				return;
			}
		}

		/**
		 * Whether the cooldown expired or the time (in ms) a user has to wait untill they can use the application
		 * command again
		 */
		const cooldownValidation = await validateCooldown(applicationCommand, interaction);

		if (typeof cooldownValidation === "number") {
			interaction.reply({
				content: `You need to wait ${underlined(
					cooldownValidation,
				)} more seconds before using the command ${bold(interaction.commandName)} again. Please be patient.`,
				ephemeral: true,
			});

			return;
		}

		await applicationCommand
			.execute(interaction)
			.then(() => updateCooldown("ApplicationCommand", applicationCommand, interaction))
			.catch(async (error: Error) => {
				interaction.reply({
					content: `I'm sorry, but there was an error handling your interaction with the command ${bold(
						interaction.commandName,
					)}.`,
					ephemeral: true,
				});

				notify(
					"ERROR",
					`Failed to execute application command '${interaction.commandName}':\n${error}`,
					interaction.client,
					`I failed to execute the application command ${bold(interaction.commandName)}:\n${code(
						error.message,
					)}\nHave a look at the logs for more information.`,
					3,
				);
			});
	},
};

export default applicationCommandInteraction;
