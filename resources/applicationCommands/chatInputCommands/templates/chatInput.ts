// Class & type imports
import { SavedChatInputCommand } from "../../../../types";

// External libraries imports
import { ApplicationCommandType, SlashCommandBuilder } from "discord.js";

/** Template for chat input command */
const chatInputCommand: SavedChatInputCommand = {
	data: new SlashCommandBuilder(),

	type: ApplicationCommandType.ChatInput,

	async autocomplete(interaction) {},

	async execute(interaction) {},
};

export default chatInputCommand;
