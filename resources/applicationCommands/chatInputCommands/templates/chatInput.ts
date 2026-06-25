// Class & type imports
import { SavedChatInputCommand } from "../../../../types";

// External libraries imports
import {
	ApplicationCommandType,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
} from "discord.js";

/** Template for chat input command */
const chatInputCommand: SavedChatInputCommand = {
	data: new SlashCommandBuilder(),

	type: ApplicationCommandType.ChatInput,

	async autocomplete(interaction: AutocompleteInteraction) {},

	async execute(interaction: ChatInputCommandInteraction) {},
};

export default chatInputCommand;
