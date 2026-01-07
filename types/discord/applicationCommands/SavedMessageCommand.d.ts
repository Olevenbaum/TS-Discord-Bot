// Internal type imports
import { SavedApplicationCommand } from ".";

// Type imports
import { ApplicationCommandType, MessageContextMenuCommandInteraction, ContextMenuCommandBuilder } from "discord.js";

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
