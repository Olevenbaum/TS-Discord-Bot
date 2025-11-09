// Type imports
import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { SavedUserCommand } from "../../../../types/applicationCommands";

/** Template for user command */
const userCommand: SavedUserCommand = {
	data: new ContextMenuCommandBuilder(),

	type: ApplicationCommandType.User,

	async execute(interaction) {},
};

userCommand.data.setType(userCommand.type);

export default userCommand;
