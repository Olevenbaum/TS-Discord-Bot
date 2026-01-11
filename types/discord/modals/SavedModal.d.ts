// Class & type imports
import type { CooldownObject } from "../../others";

// External libraries imports
import { ComponentType, type MessageComponentType, ModalBuilder, ModalSubmitInteraction } from "discord.js";

// Internal class & type imports
import type { ModalCreateOptions } from "./CreateOptions";

/**
 * Represents a Discord modal dialog loaded from a local file. Modals are popup forms that collect user input through
 * text fields and other components. They are triggered by interactions and allow structured data collection.
 */
interface SavedModal {
	/**
	 * Cooldown configuration for the modal to prevent spam submissions. Can specify global cooldowns or per-user
	 * cooldowns with custom durations.
	 * @see {@linkcode CooldownObject}
	 */
	cooldown?: CooldownObject;

	/**
	 * Definition of the components included in the modal's action rows. Specifies which components are part of the
	 * modal and their configuration. Used to validate and build the modal structure.
	 */
	includedComponents: {
		/** Number of instances of this component type in the action row. */
		count: number;

		/** Unique name identifier for the component. */
		name: string;

		/**
		 * The component type, excluding message component types.
		 * @see {@linkcode ComponentType}
		 * @see {@linkcode MessageComponentType}
		 */
		type: Omit<ComponentType, MessageComponentType>;
	}[];

	/**
	 * A unique identifier for the modal, used for registration and lookup. Should be descriptive and unique within the
	 * modal collection.
	 */
	name: string;

	/**
	 * Creates a new instance of the modal with the specified options. Builds the modal structure with components and
	 * applies customizations.
	 * @param options - Configuration options to customize the modal instance.
	 * @returns The configured modal builder ready for display.
	 * @see {@linkcode ModalBuilder}
	 * @see {@linkcode ModalCreateOptions}
	 */
	create(options?: ModalCreateOptions): ModalBuilder;

	/**
	 * Executes the modal's logic when a user submits it. Processes the submitted data and handles the response.
	 * @param interaction - The modal submit interaction containing form data.
	 * @see {@linkcode ModalSubmitInteraction}
	 */
	execute(interaction: ModalSubmitInteraction): Promise<void>;
}
