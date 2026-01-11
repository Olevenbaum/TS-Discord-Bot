// External libraries imports
import { ActionRowBuilder, ComponentType } from "discord.js";

// Internal class & type imports
import type { SavedComponent } from "./SavedComponent";
import type { ActionRowCreateOptions } from "./CreateOptions";

/**
 * Represents a Discord action row component loaded from a local file. Action rows are containers that hold multiple
 * components in a horizontal layout, organizing interactive elements within messages or modals.
 * @see {@linkcode SavedComponent}
 */
interface SavedActionRow extends SavedComponent {
	/**
	 * List of components inside the action row. Either only message components **or** only modal components can be
	 * added. In case of message components, the number of elements must not exceed five. For modal components this
	 * number is reduced to one. Each item contains the name, number and the type of component to add.
	 */
	includedComponents: {
		/**
		 * The number of times the component is added to the action row
		 * @defaultValue `1`
		 */
		count?: number;

		/** Name of the component */
		name: string;

		/**
		 * The component type.
		 * @see {@linkcode ComponentType}
		 */
		type: ComponentType;
	}[];

	/**
	 * The component type, fixed to {@linkcode ComponentType.ActionRow} for action row components.
	 * @see {@linkcode ComponentType.ActionRow}
	 */
	type: ComponentType.ActionRow;

	/**
	 * Creates a new instance of the action row component with custom options. Builds the action row including the
	 * components listed in {@linkcode includedComponents} and passes the options to the matching included components.
	 * @param options - Configuration to customize the action row and its included components.
	 * @returns The configured action row builder with applied options.
	 * @override
	 * @see {@linkcode ActionRowBuilder}
	 * @see {@linkcode ActionRowCreateOptions}
	 */
	create(options: ActionRowCreateOptions): ActionRowBuilder;
}
