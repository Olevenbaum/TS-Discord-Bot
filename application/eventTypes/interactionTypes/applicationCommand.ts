// Global imports
import "../../../globals/discordTextFormat";
import "../../../globals/notifications";
import { applicationCommandTypes } from "../../../globals/variables";

// Type imports
import { ApplicationCommandType, CommandInteraction, InteractionType } from "discord.js";
import { SavedInteractionType } from "../../../types/others";

/** Application command interaction handler */
const interactionType: SavedInteractionType = {
	type: InteractionType.ApplicationCommand,

	async execute(interaction: CommandInteraction) {
		/** Application command type of the application command that was interacted with */
		const applicationCommandType = applicationCommandTypes.get(
			ApplicationCommandType[interaction.commandType] as keyof typeof ApplicationCommandType,
		);

		if (!applicationCommandType) {
			interaction.reply({
				content: `I'm sorry, but it seems that interactions with the command type ${bold(
					ApplicationCommandType[interaction.commandType],
				)} can't be processed at the moment.`,
				ephemeral: true,
			});

			notify(
				"ERROR",
				`Found no file handling application command type '${ApplicationCommandType[interaction.commandType]}'`,
				interaction.client,
				`I couldn't find any file handling the application command type ${bold(
					ApplicationCommandType[interaction.commandType],
				)}.`,
				4,
			);

			return;
		}

		await applicationCommandType.execute(interaction).catch((error: Error) => {
			interaction.reply({
				content: `I'm sorry, but there was an error handling your interaction with the command type ${bold(
					ApplicationCommandType[interaction.commandType],
				)}.`,
				ephemeral: true,
			});

			notify(
				"ERROR",
				`Failed to execute application command type '${
					ApplicationCommandType[interaction.commandType]
				}':\n${error}`,
				interaction.client,
				`I failed to execute the application command type ${bold(
					ApplicationCommandType[interaction.commandType],
				)}:\n${code(error.message)}\nHave a look at the logs for more information.`,
				3,
			);
		});
	},
};

export default interactionType;
