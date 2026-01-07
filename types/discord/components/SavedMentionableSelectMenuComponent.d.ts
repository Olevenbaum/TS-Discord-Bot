// Internal type imports
import { SavedMessageComponent } from ".";
import { MentionableSelectMenuComponentCreateOptions } from "../CreateOptions";

// Type imports
import { ComponentType, MentionableSelectMenuBuilder, MentionableSelectMenuInteraction } from "discord.js";

/** Mentionable select component imported from local file */
interface SavedMentionableSelectMenuComponent extends SavedMessageComponent {
	/** Type of the mentionable select component */
	type: ComponentType.MentionableSelect;

	/**
	 * Creates the mentionable select component
	 * @returns The mentionable select builder
	 */
	create(): MentionableSelectMenuBuilder;

	/**
	 * Creates the mentionable select component
	 * @param options The options that modify the mentionable select component
	 * @returns The mentionable select builder
	 */
	create(options?: MentionableSelectComponentMenuCreateOptions): MentionableSelectMenuBuilder;

	/**
	 * Handles the response to the mentionable select component interaction.
	 * @param interaction The mentionable select component interaction to respond to
	 */
	execute(interaction: MentionableSelectMenuInteraction): Promise<void>;
}
