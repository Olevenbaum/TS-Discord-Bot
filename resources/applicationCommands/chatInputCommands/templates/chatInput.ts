// Type imports
import { ApplicationCommandType, SlashCommandBuilder } from "discord.js";
import { SavedChatInputCommand } from "../../../../types/applicationCommands";

/** Template for chat input command */
const chatInputCommand: SavedChatInputCommand = {
	data: new SlashCommandBuilder(),

	type: ApplicationCommandType.ChatInput,

	async autocomplete(interaction) {},

	async execute(interaction) {},
};

export default chatInputCommand;
