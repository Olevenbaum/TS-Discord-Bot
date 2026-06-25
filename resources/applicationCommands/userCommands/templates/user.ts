// Class & type imports
import { SavedUserCommand } from "../../../../types";

// External libraries imports
import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";

/** Template for user command */
const userCommand: SavedUserCommand = {
	data: new ContextMenuCommandBuilder(),

	type: ApplicationCommandType.User,

	async execute(interaction: UserContextMenuCommandInteraction) {},
};

userCommand.data.setType(userCommand.type);

export default userCommand;
