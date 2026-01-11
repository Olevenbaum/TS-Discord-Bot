// External libraries imports
import { ComponentType, MentionableSelectMenuBuilder, MentionableSelectMenuInteraction } from "discord.js";

// Internal class & type imports
import type { SavedMessageComponent } from "./SavedMessageComponent";
import type { MentionableSelectMenuComponentCreateOptions } from "./CreateOptions";

/**
 * Represents a Discord mentionable select menu component loaded from a local file. Mentionable select menus allow
 * users to select users, roles, or both that can be mentioned, facilitating targeted interactions.
 * @see {@linkcode SavedMessageComponent}
 */
interface SavedMentionableSelectMenuComponent extends SavedMessageComponent {
	/**
	 * The component type, fixed to {@linkcode ComponentType.MentionableSelect} for mentionable select menus.
	 * @see {@linkcode ComponentType.MentionableSelect}
	 */
	type: ComponentType.MentionableSelect;

	/**
	 * Creates a new instance of the mentionable select menu component with custom options. Allows modification of the
	 * menu's appearance or behavior at creation time.
	 * @param options - Optional configuration to customize the mentionable select menu instance.
	 * @returns The configured mentionable select menu builder with applied options.
	 * @override
	 * @see {@linkcode MentionableSelectMenuBuilder}
	 * @see {@linkcode MentionableSelectMenuComponentCreateOptions}
	 */
	create(options?: MentionableSelectMenuComponentCreateOptions): MentionableSelectMenuBuilder;

	/**
	 * Executes the mentionable select menu's logic when a user interacts with it. Handles the interaction and responds
	 * appropriately.
	 * @param interaction - The mentionable select menu interaction to process.
	 * @override
	 * @see {@linkcode MentionableSelectMenuInteraction}
	 */
	execute(interaction: MentionableSelectMenuInteraction): Promise<void>;
}
