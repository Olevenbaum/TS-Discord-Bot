// External libraries imports
import {
	ApplicationCommandType,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandGroupBuilder,
	type SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

// Internal class & type imports
import type { SavedApplicationCommand } from "./SavedApplicationCommand";

/**
 * Represents a Discord slash command (chat input command) loaded from a local file. Slash commands are the primary way
 * users interact with bots via text commands that appear in the Discord UI. This extends the base application command
 * with slash-specific features like autocomplete.
 * @see {@linkcode SavedApplicationCommand}
 */
export interface SavedChatInputCommand extends SavedApplicationCommand {
	/**
	 * The slash command definition data used to register the command. Contains the command name, description, options,
	 * subcommands, and other slash-specific metadata.
	 * @override
	 * @see {@linkcode SlashCommandBuilder}
	 * @see {@linkcode SlashCommandOptionsOnlyBuilder}
	 * @see {@linkcode SlashCommandSubcommandGroupBuilder}
	 * @see {@linkcode SlashCommandSubcommandsOnlyBuilder}
	 */
	data:
		| SlashCommandBuilder
		| SlashCommandOptionsOnlyBuilder
		| SlashCommandSubcommandGroupBuilder
		| SlashCommandSubcommandsOnlyBuilder;

	/**
	 * The command type, fixed to {@linkcode ApplicationCommandType.ChatInput} for slash commands.
	 * @override
	 * @see {@linkcode ApplicationCommandType.ChatInput}
	 */
	type: ApplicationCommandType.ChatInput;

	/**
	 * Optional handler for autocomplete interactions on this slash command. Called when users are typing in command
	 * options to provide suggestions. Only needed if the command has options that support autocomplete.
	 * @param interaction - The autocomplete interaction to handle.
	 * @see {@linkcode AutocompleteInteraction}
	 */
	autocomplete?(interaction: AutocompleteInteraction): Promise<void>;

	/**
	 * Executes the slash command logic when invoked by a user. Handles the command execution and responds to the
	 * interaction.
	 * @param interaction - The chat input command interaction to process.
	 * @override
	 * @see {@linkcode ChatInputCommandInteraction}
	 */
	execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
