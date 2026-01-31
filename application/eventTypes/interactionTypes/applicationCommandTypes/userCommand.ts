// Class & type imports
import type { SavedApplicationCommandType, SavedUserCommand } from "../../../../types";

// Data imports
import { applicationCommands } from "#variables";

// External library imports
import {
	ApplicationCommandType,
	bold,
	codeBlock,
	MessageFlags,
	Team,
	User,
	underline,
	UserContextMenuCommandInteraction,
} from "discord.js";

// Module imports
import notify from "../../../../modules/notification";
import { updateCooldown, validateCooldown } from "../../../../modules/utilities";

/**
 * Application command type handler for user context menu commands. Manages command execution for user-based
 * interactions, owner permission checks, and cooldown validation. Provides user feedback for unhandled commands and
 * manages error handling for command execution failures.
 * @see {@linkcode SavedApplicationCommandType}
 */
const userCommandInteraction: SavedApplicationCommandType = {
	type: ApplicationCommandType.User,

	async execute(interaction: UserContextMenuCommandInteraction): Promise<void> {
		/**
		 * User command that was interacted with
		 * @see {@linkcode SavedUserCommand}
		 */
		const userCommand = applicationCommands[this.type]?.get(interaction.commandName) as
			| SavedUserCommand
			| undefined;

		if (!userCommand) {
			interaction.reply({
				content: `I'm sorry, but it seems like interactions with the command ${bold(
					interaction.commandName,
				)} can't be processed at the moment.`,
				flags: MessageFlags.Ephemeral,
			});

			notify(
				`Found no file handling user command '${interaction.commandName}'`,
				"ERROR",
				`I couldn't find any file handling the user command ${bold(interaction.commandName)}.`,
				5,
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
					flags: MessageFlags.Ephemeral,
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
				content: `You need to wait ${underline(
					cooldownValidation.toString(),
				)} more seconds before using the command ${bold(interaction.commandName)} again. Please be patient.`,
				flags: MessageFlags.Ephemeral,
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
					flags: MessageFlags.Ephemeral,
				});

				notify(
					`Failed to execute user command '${interaction.commandName}':`,
					error,
					`I failed to execute the user command ${bold(interaction.commandName)}:\n${codeBlock(
						error.message,
					)}\nHave a look at the logs for more information.`,
					4,
				);
			});
	},
};

export default userCommandInteraction;
