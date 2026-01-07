// Internal type imports
import { SavedMessageComponent } from ".";
import { ChannelSelectMenuComponentCreateOptions } from "./CreateOptions";

// Type imports
import { ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ComponentType } from "discord.js";

/** Channel select component imported from local file */
interface SavedChannelSelectMenuComponent extends SavedMessageComponent {
	/** Type of the channel select component */
	type: ComponentType.ChannelSelect;

	/**
	 * Creates the channel select component
	 * @returns The channel select builder
	 */
	create(): ChannelSelectMenuBuilder;

	/**
	 * Creates the channel select component
	 * @param options The options that modify the channel select component
	 * @returns The channel select builder
	 */
	create(options?: ChannelSelectMenuComponentCreateOptions): ChannelSelectMenuBuilder;

	/**
	 * Handles the response to the channel select component interaction
	 * @param interaction The channel select component interaction to response to
	 */
	execute(interaction: ChannelSelectMenuInteraction): Promise<void>;
}
