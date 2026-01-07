// Type imports
import { ApplicationCommandType, CommandInteraction } from "discord.js";

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
