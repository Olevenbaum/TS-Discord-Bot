// Type imports
import { ApplicationCommandType, ContextMenuCommandBuilder, MessageContextMenuCommandInteraction } from "discord.js";
import { SavedMessageCommand } from "../../../../types/applicationCommands";
import { Configuration } from "../../../../types/configuration";

/**
 * Template for message command
 */
const messageCommand: SavedMessageCommand = {
    data: new ContextMenuCommandBuilder(),

    type: ApplicationCommandType.Message,

    async execute(configuration: Configuration, interaction: MessageContextMenuCommandInteraction) {},
};

// Set message command type
messageCommand.data.setType(messageCommand.type);

// Export message command
export default messageCommand;
