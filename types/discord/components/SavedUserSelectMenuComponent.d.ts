// External libraries imports
import { ComponentType, UserSelectMenuBuilder, UserSelectMenuInteraction } from "discord.js";

// Internal class & type imports
import type { SavedMessageComponent } from "./SavedMessageComponent";
import type { UserSelectMenuComponentCreateOptions } from "./CreateOptions";

/**
 * Represents a Discord user select menu component loaded from a local file. User select menus allow selecting Discord
 * users from the current context, enabling user-targeted interactions.
 * @see {@linkcode SavedMessageComponent}
 */
interface SavedUserSelectMenuComponent extends SavedMessageComponent {
	/**
	 * The component type, fixed to {@linkcode ComponentType.UserSelect} for user select menus.
	 * @see {@linkcode ComponentType.UserSelect}
	 */
	type: ComponentType.UserSelect;

	/**
	 * Creates a new instance of the user select menu component with custom options. Allows modification of the
	 * menu's appearance or behavior at creation time.
	 * @param options - Optional configuration to customize the user select menu instance.
	 * @returns The configured user select menu builder with applied options.
	 * @override
	 * @see {@linkcode UserSelectMenuBuilder}
	 * @see {@linkcode UserSelectMenuComponentCreateOptions}
	 */
	create(options?: UserSelectMenuComponentCreateOptions): UserSelectMenuBuilder;

	/**
	 * Executes the user select menu's logic when a user interacts with it. Handles the interaction and responds
	 * appropriately.
	 * @param interaction - The user select menu interaction to process.
	 * @override
	 * @see {@linkcode UserSelectMenuInteraction}
	 */
	execute(interaction: UserSelectMenuInteraction): Promise<void>;
}
