// External libraries imports
import { ComponentType, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";

// Internal class & type imports
import type { SavedMessageComponent } from "./SavedMessageComponent";
import type { StringSelectMenuComponentCreateOptions } from "./CreateOptions";

/**
 * Represents a Discord string select menu component loaded from a local file. String select menus present a list of
 * predefined text options for user selection, allowing structured choice inputs.
 * @see {@linkcode SavedMessageComponent}
 */
interface SavedStringSelectMenuComponent extends SavedMessageComponent {
	/**
	 * Array of string options to display in the select menu. These represent the available choices users can select
	 * from when interacting with the component.
	 */
	options: string[];

	/**
	 * The component type, fixed to {@linkcode ComponentType.StringSelect} for string select menus.
	 * @see {@linkcode ComponentType.StringSelect}
	 */
	type: ComponentType.StringSelect;

	/**
	 * Creates a new instance of the string select menu component with custom options. Allows modification of the
	 * menu's appearance or behavior at creation time.
	 * @param options - Optional configuration to customize the string select menu instance.
	 * @returns The configured string select menu builder with applied options.
	 * @override
	 * @see {@linkcode StringSelectMenuBuilder}
	 * @see {@linkcode StringSelectMenuComponentCreateOptions}
	 */
	create(options?: StringSelectMenuComponentCreateOptions): StringSelectMenuBuilder;

	/**
	 * Executes the string select menu's logic when a user interacts with it. Handles the interaction and responds
	 * appropriately.
	 * @param interaction - The string select menu interaction to process.
	 * @override
	 * @see {@linkcode StringSelectMenuInteraction}
	 */
	execute(interaction: StringSelectMenuInteraction): Promise<void>;
}
