// Class & type imports
import { SavedMessageCommand } from "../../../../types";

// External libraries imports
import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";

/** Template for message command */
const messageCommand: SavedMessageCommand = {
	data: new ContextMenuCommandBuilder(),

	type: ApplicationCommandType.Message,

	async execute(interaction) {},
};

messageCommand.data.setType(messageCommand.type);

export default messageCommand;
