// Internal type imports
import { ComponentCreateOptions } from "./CreateOptions";

// Type imports
import { ComponentBuilder, ComponentType } from "discord.js";

/** Component imported from local file */
interface SavedComponent {
	/** Name of the component */
	name: string;

	/** Type of the component */
	type: ComponentType;

	/**
	 * Creates the component
	 * @returns The component builder
	 */
	create(): ComponentBuilder;

	/**
	 * Creates the component
	 * @param options The options to modify the component
	 * @returns The component builder
	 */
	create(options?: ComponentCreateOptions): ComponentBuilder;
}
