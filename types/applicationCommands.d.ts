// Type imports
import {
	ApplicationCommandType,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	CommandInteraction,
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
	PermissionsBitField,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	SlashCommandSubcommandsGroupBuilder,
	UserContextMenuCommandInteraction,
} from "discord.js";
import { CooldownObject } from "./others";

/** Application command imported from local file */
interface SavedApplicationCommand {
	/** Whether the application command can only be used by the owner or team members of the bot */
	owner?: boolean;

	/**
	 * The time any or a specific user has to wait to use this application command again
	 * @see {@link CooldownObject}
	 */
	cooldown?: CooldownObject;

	/**
	 * Data of the application command
	 * @see {@link ContextMenuCommandBuilder} | {@link SlashCommandBuilder} | {@link SlashCommandOptionsOnlyBuilder} |
	 * {@link SlashCommandSubcommandsGroupBuilder} | {@link SlashCommandSubcommandsOnlyBuilder}
	 */
	data:
		| ContextMenuCommandBuilder
		| SlashCommandBuilder
		| SlashCommandOptionsOnlyBuilder
		| SlashCommandSubcommandsGroupBuilder
		| SlashCommandSubcommandsOnlyBuilder;

	/**
	 * Type of the application command
	 * @see {@link ApplicationCommandType}
	 */
	type: ApplicationCommandType;

	/**
	 * Handles the response to the application command's interaction
	 * @param interaction The application command interaction to response to
	 * @see {@link ChatInputCommandInteraction} | {@link MessageContextMenuCommandInteraction}
	 * | {@link UserContextMenuCommandInteraction}
	 */
	execute(
		interaction:
			| ChatInputCommandInteraction
			| MessageContextMenuCommandInteraction
			| UserContextMenuCommandInteraction,
	): Promise<void>;
}

/** Application command type imported from local file */
interface SavedApplicationCommandType {
	/**
	 * Application command type
	 * @see {@link ApplicationCommandType}
	 */
	type: ApplicationCommandType;

	/**
	 * Handles the interaction with the application command type
	 * @param interaction The interaction to be handled
	 * @see {@link CommandInteraction}
	 */
	execute(interaction: CommandInteraction): Promise<void>;
}

/** Chat input command imported from local file */
interface SavedChatInputCommand extends SavedApplicationCommand {
	/**
	 * Data of the chat input command
	 * @override
	 * @see {@link SlashCommandBuilder} | {@link SlashCommandOptionsOnlyBuilder} |
	 * {@link SlashCommandSubcommandsGroupBuilder} | {@link SlashCommandSubcommandsOnlyBuilder}
	 */
	data:
		| SlashCommandBuilder
		| SlashCommandOptionsOnlyBuilder
		| SlashCommandSubcommandsGroupBuilder
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

/** Message command imported from local file */
interface SavedMessageCommand extends SavedApplicationCommand {
	/**
	 * Data of the message command
	 * @override
	 * @see {@link ContextMenuCommandBuilder}
	 */
	data: ContextMenuCommandBuilder;

	/**
	 * Type of the message command
	 * @override
	 * @see {@link ApplicationCommandType.Message}
	 */
	type: ApplicationCommandType.Message;

	/**
	 * Handles the response to the message command interaction
	 * @param interaction The message command interaction to respond to
	 * @override
	 * @see {@link MessageContextMenuCommandInteraction}
	 */
	execute(interaction: MessageContextMenuCommandInteraction): Promise<void>;
}

/** User command imported from local file */
interface SavedUserCommand extends SavedApplicationCommand {
	/**
	 * Data of the user command
	 * @override
	 * @see {@link ContextMenuCommandBuilder}
	 */
	data: ContextMenuCommandBuilder;

	/**
	 * Type of the user command
	 * @override
	 * @see {@link ApplicationCommandType.User}
	 */
	type: ApplicationCommandType.User;

	/**
	 * Handles the response to the user command interaction
	 * @param interaction The user context menu interaction to respond to
	 * @override
	 * @see {@link UserContextMenuCommandInteraction}
	 */
	execute(interaction: UserContextMenuCommandInteraction): Promise<void>;
}
