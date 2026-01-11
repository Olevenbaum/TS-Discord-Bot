// External libraries imports
import { ApplicationCommandType, MessageContextMenuCommandInteraction, ContextMenuCommandBuilder } from "discord.js";

// Internal class & type imports
import type { SavedApplicationCommand } from "./SavedApplicationCommand";

/**
 * Represents a Discord message context menu command loaded from a local file. Message commands appear in the context
 * menu when right-clicking on messages and allow users to perform actions on specific messages.
 * @see {@linkcode SavedApplicationCommand}
 */
export interface SavedMessageCommand extends SavedApplicationCommand {
	/**
	 * The context menu command definition data used to register the command. Contains the command name and other
	 * metadata specific to message context menus.
	 * @override
	 * @see {@linkcode ContextMenuCommandBuilder}
	 */
	data: ContextMenuCommandBuilder;

	/**
	 * The command type, fixed to {@linkcode ApplicationCommandType.Message} for message context menu
	 * commands.
	 * @override
	 * @see {@linkcode ApplicationCommandType.Message}
	 */
	type: ApplicationCommandType.Message;

	/**
	 * Executes the message command logic when a user selects it from the context menu. Receives the interaction with
	 * the target message and handles the response.
	 * @param interaction - The message context menu command interaction to process.
	 * @override
	 * @see {@linkcode MessageContextMenuCommandInteraction}
	 */
	execute(interaction: MessageContextMenuCommandInteraction): Promise<void>;
}
