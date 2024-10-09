// Type imports
import {
    ApplicationCommandType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
} from "discord.js";
import { SavedChatInputCommand } from "../../../../types/applicationCommands";
import { Configuration } from "../../../../types/configuration";

/**
 * Template for chat input command
 */
const chatInputCommand: SavedChatInputCommand = {
    data: new SlashCommandBuilder(),

    type: ApplicationCommandType.ChatInput,

    async autocomplete(configuration: Configuration, interaction: AutocompleteInteraction) {},

    async execute(configuration: Configuration, interaction: ChatInputCommandInteraction) {},
};

export default chatInputCommand;
