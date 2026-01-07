// Internal imports
import { SavedComponent } from ".";
import { ComponentCreateOptions } from "../CreateOptions";

// Type imports
import { ComponentType, MessageComponentType, ModalActionRowComponentBuilder } from "discord.js";

/** Modal component imported from local file */
interface SavedModalComponent extends SavedComponent {
	/** Type of the modal */
	type: Omit<ComponentType, MessageComponentType>;

	/**
	 * Creates the modal component
	 * @returns The modal action row builder
	 */
	create(): ModalActionRowComponentBuilder;

	/**
	 * Creates the modal component
	 * @param options The options to modify the modal component
	 * @returns The modal action row builder
	 */
	create(options?: ComponentCreateOptions): ModalActionRowComponentBuilder;
}
