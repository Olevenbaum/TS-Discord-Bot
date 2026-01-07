// Class & type imports
import type { SavedInteractionType } from "../../../types";

// Data imports
import { applicationCommandTypes } from "#variables";

// External libraries imports
import { ApplicationCommandType, bold, codeBlock, CommandInteraction, InteractionType, MessageFlags } from "discord.js";

// Module imports
import notify from "../../../modules/notification";

/** Application command interaction handler */
const interactionType: SavedInteractionType = {
	type: InteractionType.ApplicationCommand,

	async execute(interaction: CommandInteraction) {
		/** Application command type of the application command that was interacted with */
		const applicationCommandType = applicationCommandTypes.get(interaction.commandType);

		if (!applicationCommandType) {
			interaction.reply({
				content: `I'm sorry, but it seems that interactions with the command type ${bold(
					ApplicationCommandType[interaction.commandType],
				)} can't be processed at the moment.`,
				flags: MessageFlags.Ephemeral,
			});

			notify(
				`Found no file handling application command type '${ApplicationCommandType[interaction.commandType]}'`,
				"ERROR",
				`I couldn't find any file handling the application command type ${bold(
					ApplicationCommandType[interaction.commandType],
				)}.`,
				5,
			);

			return;
		}

		await applicationCommandType.execute(interaction).catch((error: Error) => {
			interaction.reply({
				content: `I'm sorry, but there was an error handling your interaction with the command type ${bold(
					ApplicationCommandType[interaction.commandType],
				)}.`,
				flags: MessageFlags.Ephemeral,
			});

			notify(
				`Failed to execute application command type '${ApplicationCommandType[interaction.commandType]}':`,
				error,
				`I failed to execute the application command type ${bold(
					ApplicationCommandType[interaction.commandType],
				)}:\n${codeBlock(error.message)}\nHave a look at the logs for more information.`,
				4,
			);
		});
	},
};

export default interactionType;
