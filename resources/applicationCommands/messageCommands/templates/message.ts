// Type imports
import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { SavedMessageCommand } from "../../../../types/applicationCommands";

/** Template for message command */
const messageCommand: SavedMessageCommand = {
	data: new ContextMenuCommandBuilder(),

	type: ApplicationCommandType.Message,

	async execute(interaction) {},
};

messageCommand.data.setType(messageCommand.type);

export default messageCommand;
