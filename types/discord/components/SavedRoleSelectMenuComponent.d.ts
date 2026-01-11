// Internal class & type imports
import type { SavedMessageComponent } from "./SavedMessageComponent";
import type { RoleSelectMenuComponentCreateOptions } from "./CreateOptions";

// External libraries imports
import { ComponentType, RoleSelectMenuBuilder, RoleSelectMenuInteraction } from "discord.js";

/**
 * Represents a Discord role select menu component loaded from a local file. Role select menus allow users to choose
 * from available roles in a guild, enabling role-based interactions and selections.
 * @see {@linkcode SavedMessageComponent}
 */
interface SavedRoleSelectMenuComponent extends SavedMessageComponent {
	/**
	 * The component type, fixed to {@linkcode ComponentType.RoleSelect} for role select menus.
	 * @see {@linkcode ComponentType.RoleSelect}
	 */
	type: ComponentType.RoleSelect;

	/**
	 * Creates a new instance of the role select menu component with custom options. Allows modification of the
	 * menu's appearance or behavior at creation time.
	 * @param options - Optional configuration to customize the role select menu instance.
	 * @returns The configured role select menu builder with applied options.
	 * @override
	 * @see {@linkcode RoleSelectMenuBuilder}
	 * @see {@linkcode RoleSelectMenuComponentCreateOptions}
	 */
	create(options?: RoleSelectMenuComponentCreateOptions): RoleSelectMenuBuilder;

	/**
	 * Executes the role select menu's logic when a user interacts with it. Handles the interaction and responds
	 * appropriately.
	 * @param interaction - The role select menu interaction to process.
	 * @override
	 * @see {@linkcode RoleSelectMenuInteraction}
	 */
	execute(interaction: RoleSelectMenuInteraction): Promise<void>;
}
