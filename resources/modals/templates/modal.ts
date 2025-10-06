// Global imports
import { components } from "../../../globals/variables";

// Type imports
import {
	ActionRowBuilder,
	ComponentType,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	ModalSubmitInteraction,
} from "discord.js";
import { SavedModalComponent } from "../../../types/components";
import { Configuration } from "../../../types/configuration";
import { SavedModal } from "../../../types/modals";

/**
 * Template for modal
 */
const modal: SavedModal = {
	includedComponents: [],
	name: "",

	create(configuration: Configuration, options = {}): ModalBuilder {
		/**
		 * Text input components to add to the modal
		 */
		const createdModalActionRowComponents: ActionRowBuilder<ModalActionRowComponentBuilder>[] = [];

		// Iterating over text input components
		for (const includedComponent of this.includedComponents) {
			/**
			 * Text input component that should be added
			 */
			const modalComponent = components[
				ComponentType[includedComponent.type as ComponentType] as keyof typeof components
			]?.get(includedComponent.name) as SavedModalComponent | undefined;

			// Check if the component was found
			if (!modalComponent) {
				// Throw error
				throw new Error(`Found no modal action row component with name '${includedComponent.name}'`);
			}

			// Iterating over counter of text input component
			for (let counter = 0; counter < includedComponent.count; counter++) {
				// Adding text input component
				createdModalActionRowComponents.push(
					new ActionRowBuilder<ModalActionRowComponentBuilder>().setComponents(
						modalComponent.create(configuration, {
							...options.general,
							...options[includedComponent.name],
							...{ customIndex: counter },
						}),
					),
				);
			}
		}

		// Returning modal
		return new ModalBuilder()
			.setComponents(createdModalActionRowComponents)
			.setCustomId(this.name)
			.setTitle(options.title ?? this.name);
	},

	async execute(configuration: Configuration, interaction: ModalSubmitInteraction) {},
};

export default modal;
