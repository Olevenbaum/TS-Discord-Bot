// Class & type imports
import type { SavedApplicationCommandType, SavedMessageCommand } from "../../../../types";

// Data imports
import { applicationCommands } from "#variables";

// External library imports
import {
	ApplicationCommandType,
	bold,
	codeBlock,
	MessageContextMenuCommandInteraction,
	MessageFlags,
	Team,
	underline,
	User,
} from "discord.js";

// Module imports
import notify from "../../../../modules/notification";
import { updateCooldown, validateCooldown } from "../../../../modules/utilities";

/**
 * Application command type handler for message context menu commands. Manages command execution for message-based
 * interactions, owner permission checks, and cooldown validation. Provides user feedback for unhandled commands and
 * manages error handling for command execution failures.
 * @see {@linkcode SavedApplicationCommandType}
 */
const userCommandInteraction: SavedApplicationCommandType = {
	type: ApplicationCommandType.Message,

	async execute(interaction: MessageContextMenuCommandInteraction): Promise<void> {
		/**
		 * Message application command that was interacted with
		 * @see {@linkcode SavedMessageCommand}
		 */
		const messageCommand = applicationCommands[this.type]?.get(interaction.commandName) as
			| SavedMessageCommand
			| undefined;

		if (!messageCommand) {
			interaction.reply({
				content: `I'm sorry, but it seems like interactions with the command ${bold(
					interaction.commandName,
				)} can't be processed at the moment.`,
				flags: MessageFlags.Ephemeral,
			});

			notify(
				`Found no file handling message command '${interaction.commandName}'`,
				"ERROR",
				`I couldn't find any file handling the message command ${bold(interaction.commandName)}.`,
				5,
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
					flags: MessageFlags.Ephemeral,
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
				content: `You need to wait ${underline(
					cooldownValidation.toString(),
				)} more seconds before using the command ${bold(interaction.commandName)} again. Please be patient.`,
				flags: MessageFlags.Ephemeral,
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
					flags: MessageFlags.Ephemeral,
				});

				notify(
					`Failed to execute message command '${interaction.commandName}':`,
					error,
					`I failed to execute the message command ${bold(interaction.commandName)}:\n${codeBlock(
						error.message,
					)}\nHave a look at the logs for more information.`,
					4,
				);
			});
	},
};

export default userCommandInteraction;
