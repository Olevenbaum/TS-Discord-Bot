// External libraries imports
import { ComponentBuilder, ComponentType } from "discord.js";

// Internal class & type imports
import type { ComponentCreateOptions } from "./CreateOptions";

/**
 * Represents a Discord message component loaded from a local file. Message components are interactive elements like
 * buttons, select menus, and text inputs that can be attached to messages. This interface defines the structure for
 * component definitions that can be instantiated with various options.
 */
interface SavedComponent {
	/**
	 * A unique identifier for the component, used for registration and lookup. Should be descriptive and unique within
	 * the component collection.
	 */
	name: string;

	/**
	 * The type of Discord component this represents. Determines the component's behavior and available customization
	 * options.
	 * @see {@linkcode ComponentType}
	 */
	type: ComponentType;

	/**
	 * Creates a new instance of the component with custom options. Allows modification of the component's appearance
	 * or behavior at creation time.
	 * @param options - Optional configuration to customize the component instance.
	 * @returns The configured component builder with applied options.
	 * @see {@linkcode ComponentBuilder}
	 * @see {@linkcode ComponentCreateOptions}
	 */
	create(options?: ComponentCreateOptions): ComponentBuilder;
}
