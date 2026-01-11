// External libraries imports
import { ComponentType, type MessageComponentType, type ModalActionRowComponentBuilder } from "discord.js";

// Internal class & type imports
import type { SavedComponent } from "./SavedComponent";
import type { ComponentCreateOptions } from "./CreateOptions";

/**
 * Represents a Discord modal component loaded from a local file. Modal components are form elements used within modal
 * dialogs to collect user input. They extend the base component with modal-specific creation capabilities.
 * @see {@linkcode SavedComponent}
 */
interface SavedModalComponent extends SavedComponent {
	/**
	 * The component type, excluding message component types since modals use different component builders.
	 * @see {@linkcode ComponentType}
	 * @see {@linkcode MessageComponentType}
	 */
	type: Omit<ComponentType, MessageComponentType>;

	/**
	 * Creates the modal component with custom options. Allows modification of the component's appearance or behavior
	 * at creation time.
	 * @param options - Optional configuration to customize the component instance.
	 * @returns The modal action row component builder with applied options.
	 * @override
	 * @see {@linkcode ModalActionRowComponentBuilder}
	 * @see {@linkcode ComponentCreateOptions}
	 */
	create(options?: ComponentCreateOptions): ModalActionRowComponentBuilder;
}
