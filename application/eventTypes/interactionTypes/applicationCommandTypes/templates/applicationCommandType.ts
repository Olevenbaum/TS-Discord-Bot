// Class & type imports
import type { SavedApplicationCommand, SavedApplicationCommandType } from "../../../../../types";

// Data imports
import { applicationCommands } from "#variables";

// External libraries imports
import {
	ApplicationCommandType,
	bold,
	ChatInputCommandInteraction,
	codeBlock,
	MessageContextMenuCommandInteraction,
	MessageFlags,
	Team,
	underline,
	User,
	UserContextMenuCommandInteraction,
} from "discord.js";

// Module imports
import notify from "../../../../../modules/notification";
import { updateCooldown, validateCooldown } from "../../../../../modules/utilities";

/**
 * Template for application command type handler
 * @see {@linkcode SavedApplicationCommandType}
 */
const applicationCommandInteraction: SavedApplicationCommandType = {
	type: ApplicationCommandType.ChatInput | ApplicationCommandType.Message | ApplicationCommandType.User,

	async execute(
		interaction:
			| ChatInputCommandInteraction
			| MessageContextMenuCommandInteraction
			| UserContextMenuCommandInteraction,
	) {
		/**
		 * Application command that was interacted with
		 * @see {@linkcode SavedApplicationCommand}
		 */
		const applicationCommand = applicationCommands[this.type]?.get(interaction.commandName);

		if (!applicationCommand) {
			interaction.reply({
				content: `I'm sorry, but it seems like interactions with the command ${bold(
					interaction.commandName,
				)} can't be processed at the moment.`,
				flags: MessageFlags.Ephemeral,
			});

			notify(
				`Found no file handling application command '${interaction.commandName}'`,
				"ERROR",
				`I couldn't find any file handling the application command ${bold(interaction.commandName)}.`,
				5,
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
					flags: MessageFlags.Ephemeral,
				});

				return;
			}
		}

		/**
		 * Whether the cooldown expired or the time (in ms) a user has to wait until they can use the application
		 * command again
		 */
		const cooldownValidation = await validateCooldown(applicationCommand, interaction);

		if (typeof cooldownValidation === "number") {
			interaction.reply({
				content: `You need to wait ${underline(
					cooldownValidation.toString(),
				)} more seconds before using the command ${bold(interaction.commandName)} again. Please be patient.`,
				flags: MessageFlags.Ephemeral,
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
					flags: MessageFlags.Ephemeral,
				});

				notify(
					`Failed to execute application command '${interaction.commandName}':`,
					error,
					`I failed to execute the application command ${bold(interaction.commandName)}:\n${codeBlock(
						error.message,
					)}\nHave a look at the logs for more information.`,
					4,
				);
			});
	},
};

export default applicationCommandInteraction;
