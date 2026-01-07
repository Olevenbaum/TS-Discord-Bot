// Internal type imports
import { ModalCreateOptions } from "./CreateOptions";

// Type imports
import { ComponentType, MessageComponentType, ModalBuilder, ModalSubmitInteraction } from "discord.js";

/** Modal imported from local file */
interface SavedModal {
	/** The time any or a specific user has to wait to submit the same modal again */
	cooldown?: CooldownObject;

	/** Modal action row components that are included in the modal */
	includedComponents: {
		/** Number of components included in the action row */
		count: number;

		/** Name of the component */
		name: string;

		/** Type of the component */
		type: Omit<ComponentType, MessageComponentType>;
	}[];

	/** Name of the modal */
	name: string;

	/**
	 * Creates the modal
	 * @param options The options to modify the modal
	 * @returns The modal builder
	 */
	create(options: ModalCreateOptions): ModalBuilder;

	/**
	 * Handles the response to the modal submit interaction
	 * @param interaction The modal submit interaction to response to
	 */
	execute(interaction: ModalSubmitInteraction): Promise<void>;
}
