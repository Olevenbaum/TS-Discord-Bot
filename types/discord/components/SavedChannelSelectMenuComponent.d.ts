// External libraries imports
import { ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ComponentType } from "discord.js";

// Internal class & type imports
import type { SavedMessageComponent } from "./SavedMessageComponent";
import type { ChannelSelectMenuComponentCreateOptions } from "./CreateOptions";

/**
 * Represents a Discord channel select menu component loaded from a local file. Channel select menus allow users to
 * choose from available channels in a guild, facilitating channel-specific interactions.
 * @see {@linkcode SavedMessageComponent}
 */
interface SavedChannelSelectMenuComponent extends SavedMessageComponent {
	/**
	 * The component type, fixed to {@linkcode ComponentType.ChannelSelect} for channel select menus.
	 * @see {@linkcode ComponentType.ChannelSelect}
	 */
	type: ComponentType.ChannelSelect;

	/**
	 * Creates a new instance of the channel select menu component with custom options. Allows modification of the
	 * menu's appearance or behavior at creation time.
	 * @param options - Optional configuration to customize the channel select menu instance.
	 * @returns The configured channel select menu builder with applied options.
	 * @override
	 * @see {@linkcode ChannelSelectMenuBuilder}
	 * @see {@linkcode ChannelSelectMenuComponentCreateOptions}
	 */
	create(options?: ChannelSelectMenuComponentCreateOptions): ChannelSelectMenuBuilder;

	/**
	 * Executes the channel select menu's logic when a user interacts with it. Handles the interaction and responds
	 * appropriately.
	 * @param interaction - The channel select menu interaction to process.
	 * @override
	 * @see {@linkcode ChannelSelectMenuInteraction}
	 */
	execute(interaction: ChannelSelectMenuInteraction): Promise<void>;
}
