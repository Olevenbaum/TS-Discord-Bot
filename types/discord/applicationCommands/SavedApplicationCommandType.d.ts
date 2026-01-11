// External libraries imports
import { ApplicationCommandType, CommandInteraction } from "discord.js";

/**
 * Represents a handler for a specific type of Discord application command. Application command type handlers provide
 * generic processing for all commands of a particular type before delegating to specific command handlers.
 */
export interface SavedApplicationCommandType {
	/**
	 * The application command type this handler processes. Determines which category of commands this handler will
	 * intercept.
	 * @see {@linkcode ApplicationCommandType}
	 */
	type: ApplicationCommandType;

	/**
	 * Executes type-specific logic for application command interactions. This may include logging, permission checks,
	 * or preprocessing before passing to individual command handlers.
	 * @param interaction - The command interaction to process.
	 * @see {@linkcode CommandInteraction}
	 */
	execute(interaction: CommandInteraction): Promise<void>;
}
