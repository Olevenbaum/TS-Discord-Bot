// Internal type imports
import { SavedMessageComponent } from ".";
import { StringSelectMenuComponentCreateOptions } from "./CreateOptions";

// Type imports
import { ComponentType, StringSelectMenuBuilder, StringSelectMenuInteraction } from "discord.js";

/** String select component imported from local file */
interface SavedStringSelectMenuComponent extends SavedMessageComponent {
	/** Options of the string select component */
	options: string[];

	/** Type of the string select component */
	type: ComponentType.StringSelect;

	/**
	 * Creates the string select component
	 * @returns The string select builder
	 */
	create(): StringSelectMenuBuilder;

	/**
	 * Creates the string select component
	 * @param options The options to modify the string select component
	 * @returns The string select builder
	 */
	create(options?: StringSelectMenuComponentCreateOptions): StringSelectMenuBuilder;

	/**
	 * Handles the response to the string select component interaction
	 * @param interaction The string select component interaction to response to
	 */
	execute(interaction: StringSelectMenuInteraction): Promise<void>;
}
