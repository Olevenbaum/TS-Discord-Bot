// Internal type imports
import { SavedMessageComponent } from ".";
import { RoleSelectMenuComponentCreateOptions } from "../CreateOptions";

// Type imports
import { ComponentType, RoleSelectMenuBuilder, RoleSelectMenuInteraction } from "discord.js";

/** Role select component imported from local file */
interface SavedRoleSelectMenuComponent extends SavedMessageComponent {
	/** Type of the role select component */
	type: ComponentType.RoleSelect;

	/**
	 * Creates the role select component
	 * @returns The role select builder
	 */
	create(): RoleSelectMenuBuilder;

	/**
	 * Creates the role select component
	 * @param options The options to modify the roles select component
	 * @returns The role select builder
	 */
	create(options?: RoleSelectMenuComponentCreateOptions): RoleSelectMenuBuilder;

	/**
	 * Handles the response to the role select component interaction
	 * @param interaction The role select component interaction to response to
	 */
	execute(interaction: RoleSelectMenuInteraction): Promise<void>;
}
