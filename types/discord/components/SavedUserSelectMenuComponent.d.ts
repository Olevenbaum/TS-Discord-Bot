// Internal type imports
import { SavedMessageComponent } from ".";
import { UserSelectComponentCreateOptions } from "./CreateOptions";

// Type imports
import { ComponentType, UserSelectMenuBuilder, UserSelectMenuInteraction } from "discord.js";

/** User select component imported from local file */
interface SavedUserSelectMenuComponent extends SavedMessageComponent {
	/** Type of the user select component */
	type: ComponentType.UserSelect;

	/**
	 * Creates the user select component
	 * @returns The user select builder
	 */
	create(): UserSelectMenuBuilder;

	/**
	 * Creates the user select component
	 * @param options The options to modify the user select component
	 * @returns The user select builder
	 */
	create(options?: UserSelectComponentCreateOptions): UserSelectMenuBuilder;

	/**
	 * Handles the response to the user select component interaction
	 * @param interaction The user select component interaction to respond to
	 */
	execute(interaction: UserSelectMenuInteraction): Promise<void>;
}
