// Global imports
import "../../../../globals/cooldownValidator";
import "../../../../globals/discordTextFormat";
import "../../../../globals/notifications";
import { applicationCommands } from "../../../../globals/variables";

// Type imports
import { ApplicationCommandType, Team, User, UserContextMenuCommandInteraction } from "discord.js";
import { SavedApplicationCommandType, SavedUserCommand } from "../../../../types/applicationCommands";

/** User command handler */
const userCommandInteraction: SavedApplicationCommandType = {
	type: ApplicationCommandType.User,

	async execute(interaction: UserContextMenuCommandInteraction) {
		/** User command that was interacted with */
		const userCommand = applicationCommands[
			ApplicationCommandType[this.type] as keyof typeof ApplicationCommandType
		]?.get(interaction.commandName) as SavedUserCommand | undefined;

		if (!userCommand) {
			interaction.reply({
				content: `I'm sorry, but it seems like interactions with the command ${bold(
					interaction.commandName,
				)} can't be processed at the moment.`,
				ephemeral: true,
			});

			notify(
				"ERROR",
				`Found no file handling user command '${interaction.commandName}'`,
				interaction.client,
				`I couldn't find any file handling the user command ${bold(interaction.commandName)}.`,
				4,
			);

			return;
		}

		if (userCommand.owner) {
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
		 * Whether cooldown expired or the time (in seconds) a user has to wait till they can use the user command
		 * again
		 */
		const cooldownValidation = await validateCooldown(userCommand, interaction);

		if (typeof cooldownValidation === "number") {
			interaction.reply({
				content: `You need to wait ${underlined(
					cooldownValidation,
				)} more seconds before using the command ${bold(interaction.commandName)} again. Please be patient.`,
				ephemeral: true,
			});

			return;
		}

		await userCommand
			.execute(interaction)
			.then(() => updateCooldown("ApplicationCommand", userCommand, interaction))
			.catch(async (error: Error) => {
				interaction.reply({
					content: `I'm sorry, but there was an error handling your interaction with the command ${bold(
						interaction.commandName,
					)}.`,
					ephemeral: true,
				});

				notify(
					"ERROR",
					`Failed to execute user command '${interaction.commandName}':\n${error}`,
					interaction.client,
					`I failed to execute the user command ${bold(interaction.commandName)}:\n${code(
						error.message,
					)}\nHave a look at the logs for more information.`,
					3,
				);
			});
	},
};

export default userCommandInteraction;
