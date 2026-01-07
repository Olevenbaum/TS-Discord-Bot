// Internal type imports
import { SavedApplicationCommand } from ".";

// Type imports
import {
	ApplicationCommandType,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandGroupBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

/** Chat input command imported from local file */
interface SavedChatInputCommand extends SavedApplicationCommand {
	/**
	 * Data of the chat input command
	 * @override
	 * @see {@link SlashCommandBuilder} | {@link SlashCommandOptionsOnlyBuilder} |
	 * {@link SlashCommandSubcommandGroupBuilder} | {@link SlashCommandSubcommandsOnlyBuilder}
	 */
	data:
		| SlashCommandBuilder
		| SlashCommandOptionsOnlyBuilder
		| SlashCommandSubcommandGroupBuilder
		| SlashCommandSubcommandsOnlyBuilder;

	/**
	 * Type of the chat input command
	 * @override
	 * @see {@link ApplicationCommandType.ChatInput}
	 */
	type: ApplicationCommandType.ChatInput;

	/**
	 * Handles an autocomplete interaction
	 * @param interaction The autocomplete interaction
	 * @see {@link AutocompleteInteraction}
	 */
	autocomplete?(interaction: AutocompleteInteraction): Promise<void>;

	/**
	 * Handles the response to the chat input command interaction
	 * @param interaction The chat input command interaction to response to
	 * @override
	 * @see {@link ChatInputCommandInteraction}
	 */
	execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
