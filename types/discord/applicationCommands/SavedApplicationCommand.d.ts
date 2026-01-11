// Class & type imports
import type { CooldownObject } from "../../others";

// External libraries imports
import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
	SlashCommandBuilder,
	type SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandGroupBuilder,
	type SlashCommandSubcommandsOnlyBuilder,
	UserContextMenuCommandInteraction,
} from "discord.js";

/**
 * Represents a Discord application command loaded from a local file. Application commands are slash commands or context
 * menu commands that users can invoke in Discord. This interface defines the structure for command definitions that
 * include metadata, cooldowns, and execution logic.
 */
export interface SavedApplicationCommand {
	/**
	 * Whether this command is restricted to bot owners or team members only. If `true`, the command will check user
	 * permissions before execution.
	 */
	owner?: boolean;

	/**
	 * Cooldown configuration for the command to prevent spam or abuse. Can specify different cooldowns with custom
	 * durations regarding servers and DMs.
	 * @see {@linkcode CooldownObject}
	 */
	cooldown?: CooldownObject;

	/**
	 * The command definition data used to register the command with Discord. Contains the command name, description,
	 * options, and other metadata. The specific builder type depends on the command structure.
	 * @see {@linkcode ContextMenuCommandBuilder}
	 * @see {@linkcode SlashCommandBuilder}
	 * @see {@linkcode SlashCommandOptionsOnlyBuilder}
	 * @see {@linkcode SlashCommandSubcommandGroupBuilder}
	 * @see {@linkcode SlashCommandSubcommandsOnlyBuilder}
	 */
	data:
		| ContextMenuCommandBuilder
		| SlashCommandBuilder
		| SlashCommandOptionsOnlyBuilder
		| SlashCommandSubcommandGroupBuilder
		| SlashCommandSubcommandsOnlyBuilder;

	/**
	 * The type of application command. Determines how the command appears and behaves in Discord.
	 * @see {@linkcode ApplicationCommandType}
	 */
	type: ApplicationCommandType;

	/**
	 * Executes the command logic when a user invokes the application command. Receives the interaction object and
	 * handles the response, which may include replying, editing, or performing other Discord API actions.
	 * @param interaction - The Discord interaction object containing command details and context.
	 * @see {@linkcode ChatInputCommandInteraction}
	 * @see {@linkcode MessageContextMenuCommandInteraction}
	 * @see {@linkcode UserContextMenuCommandInteraction}
	 */
	execute(
		interaction:
			| ChatInputCommandInteraction
			| MessageContextMenuCommandInteraction
			| UserContextMenuCommandInteraction,
	): Promise<void>;
}
