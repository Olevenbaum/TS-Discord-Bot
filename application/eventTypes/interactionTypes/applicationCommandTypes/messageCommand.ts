// Global imports
import "../../../../globals/cooldownValidator";
import "../../../../globals/discordTextFormat";
import "../../../../globals/notifications";
import { applicationCommands } from "../../../../globals/variables";

// Type imports
import { ApplicationCommandType, MessageContextMenuCommandInteraction, Team, User } from "discord.js";
import { SavedApplicationCommandType, SavedMessageCommand } from "../../../../types/applicationCommands";

/** Message command handler */
const userCommandInteraction: SavedApplicationCommandType = {
	type: ApplicationCommandType.Message,

	async execute(interaction: MessageContextMenuCommandInteraction) {
		/** Message application command that was interacted with */
		const messageCommand = applicationCommands[
			ApplicationCommandType[this.type] as keyof typeof ApplicationCommandType
		]?.get(interaction.commandName) as SavedMessageCommand | undefined;

		if (!messageCommand) {
			interaction.reply({
				content: `I'm sorry, but it seems like interactions with the command ${bold(
					interaction.commandName,
				)} can't be processed at the moment.`,
				ephemeral: true,
			});

			notify(
				"ERROR",
				`Found no file handling message command '${interaction.commandName}'`,
				interaction.client,
				`I couldn't find any file handling the message command ${bold(interaction.commandName)}.`,
				4,
			);

			return;
		}

		if (messageCommand.owner) {
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
		 * Whether the cooldown expired or the time (in seconds) a user has to wait till they can use the message
		 * command again
		 */
		const cooldownValidation = await validateCooldown(messageCommand, interaction);

		if (typeof cooldownValidation === "number") {
			interaction.reply({
				content: `You need to wait ${underlined(
					cooldownValidation,
				)} more seconds before using the command ${bold(interaction.commandName)} again. Please be patient.`,
				ephemeral: true,
			});

			return;
		}

		await messageCommand
			.execute(interaction)
			.then(() => updateCooldown("ApplicationCommand", messageCommand, interaction))
			.catch(async (error: Error) => {
				interaction.reply({
					content: `I'm sorry, but there was an error handling your interaction with the command ${bold(
						interaction.commandName,
					)}.`,
					ephemeral: true,
				});

				notify(
					"ERROR",
					`Failed to execute message command '${interaction.commandName}':\n${error}`,
					interaction.client,
					`I failed to execute the message command ${bold(interaction.commandName)}:\n${code(
						error.message,
					)}\nHave a look at the logs for more information.`,
					3,
				);
			});
	},
};

export default userCommandInteraction;
