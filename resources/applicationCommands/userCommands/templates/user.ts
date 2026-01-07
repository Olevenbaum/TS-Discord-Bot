// Class & type imports
import { SavedUserCommand } from "../../../../types";

// External libraries imports
import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";

/** Template for user command */
const userCommand: SavedUserCommand = {
	data: new ContextMenuCommandBuilder(),

	type: ApplicationCommandType.User,

	async execute(interaction) {},
};

userCommand.data.setType(userCommand.type);

export default userCommand;
