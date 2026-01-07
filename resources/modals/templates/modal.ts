// Class & type imports
import { SavedModal, SavedModalComponent } from "../../../types";

// Data imports
import { components } from "#variables";

// External libraries imports
import { ActionRowBuilder, ComponentType, ModalActionRowComponentBuilder, ModalBuilder } from "discord.js";

/** Template for modal */
const modal: SavedModal = {
	includedComponents: [],
	name: "",

	create(options = {}) {
		/** Text input components to add to the modal */
		const createdModalActionRowComponents: ActionRowBuilder<ModalActionRowComponentBuilder>[] = [];

		for (const includedComponent of this.includedComponents) {
			/** Text input component that should be added */
			const modalComponent = components[includedComponent.type as ComponentType]?.get(includedComponent.name) as
				| SavedModalComponent
				| undefined;

			if (!modalComponent) {
				throw Error(`Found no modal action row component with name '${includedComponent.name}'`);
			}

			for (let counter = 0; counter < includedComponent.count; counter++) {
				createdModalActionRowComponents.push(
					new ActionRowBuilder<ModalActionRowComponentBuilder>().setComponents(
						modalComponent.create({
							...options.general,
							...options[includedComponent.name],
							...{ customIndex: counter },
						}),
					),
				);
			}
		}

		return new ModalBuilder()
			.setComponents(createdModalActionRowComponents)
			.setCustomId(this.name)
			.setTitle(options.title ?? this.name);
	},

	async execute(interaction) {},
};

export default modal;
