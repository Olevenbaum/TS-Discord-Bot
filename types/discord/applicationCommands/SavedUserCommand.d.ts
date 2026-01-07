// Internal type imports
import { SavedApplicationCommand } from ".";

// Type imports
import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";

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
