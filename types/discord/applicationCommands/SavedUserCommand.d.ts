// External libraries imports
import { ApplicationCommandType, ContextMenuCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";

// Internal class & type imports
import type { SavedApplicationCommand } from "./SavedApplicationCommand";

/**
 * Represents a Discord user context menu command loaded from a local file. User commands appear in the context menu
 * when right-clicking on users and allow actions on specific users.
 * @see {@linkcode SavedApplicationCommand}
 */
export interface SavedUserCommand extends SavedApplicationCommand {
	/**
	 * The context menu command definition data used to register the command. Contains the command name and other
	 * metadata specific to user context menus.
	 * @override
	 * @see {@linkcode ContextMenuCommandBuilder}
	 */
	data: ContextMenuCommandBuilder;

	/**
	 * The command type, fixed to {@linkcode ApplicationCommandType.User} for user context menu commands.
	 * @override
	 * @see {@linkcode ApplicationCommandType.User}
	 */
	type: ApplicationCommandType.User;

	/**
	 * Executes the user command logic when a user selects it from the context menu. Receives the interaction with the
	 * target user and handles the response.
	 * @param interaction - The user context menu command interaction to process.
	 * @override
	 * @see {@linkcode UserContextMenuCommandInteraction}
	 */
	execute(interaction: UserContextMenuCommandInteraction): Promise<void>;
}
