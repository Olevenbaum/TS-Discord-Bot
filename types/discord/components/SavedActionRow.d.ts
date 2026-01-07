// Internal type imports
import { SavedComponent } from "./";
import { ActionRowCreateOptions } from "./CreateOptions";

// Module imports
import readFiles from "../../../modules/fileReader";

// Type imports
import { ActionRowBuilder, ComponentType } from "discord.js";

/** Action row component imported from local file */
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
		 * Type of the component
		 * @see {@linkcode ComponentType}
		 */
		type: ComponentType;
	}[];

	/** Type of component */
	type: ComponentType.ActionRow;

	/**
	 * Creates an action row including the components listed in
	 * {@linkcode SavedActionRow.includedComponents | includedComponents}.
	 * @returns The action row builder
	 * @override
	 */
	create(): ActionRowBuilder;

	/**
	 * Creates an action row including the components listed in
	 * {@linkcode SavedActionRow.includedComponents | includedComponents} and passes the options to the matching
	 * included components.
	 * @param options Options that modify the included components
	 * @returns The action row builder
	 * @override
	 */
	create(options: ActionRowCreateOptions): ActionRowBuilder;
}
