// Type imports
import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandGroupBuilder,
	SlashCommandSubcommandsOnlyBuilder,
	UserContextMenuCommandInteraction,
} from "discord.js";
import { CooldownObject } from "../../others";

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
	 * {@link SlashCommandSubcommandGroupBuilder} | {@link SlashCommandSubcommandsOnlyBuilder}
	 */
	data:
		| ContextMenuCommandBuilder
		| SlashCommandBuilder
		| SlashCommandOptionsOnlyBuilder
		| SlashCommandSubcommandGroupBuilder
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
