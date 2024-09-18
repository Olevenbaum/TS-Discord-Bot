// Type imports
import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { SavedUserCommand } from "../../../types/applicationCommands";
import { Configuration } from "../../../types/configuration";

/**
 * Template for user command
 */
const userCommand: SavedUserCommand = {
    data: new ContextMenuCommandBuilder(),
    type: ApplicationCommandType.User,

    async execute(configuration: Configuration, interaction: UserContextMenuCommandInteraction) {},
};

// Set user command type
userCommand.data.setType(userCommand.type);

// Export user command
export default userCommand;
