// Global imports
import { components } from "../../globals/variables";

// Type imports
import { ActionRowBuilder, ComponentType, ModalActionRowComponentBuilder, ModalBuilder } from "discord.js";
import { SavedModalComponent } from "../../types/components";
import { SavedModal } from "../../types/modals";

/** Template for modal */
const modal: SavedModal = {
	includedComponents: [],
	name: "blockUser",

	create(options = {}) {
		/** Text input components to add to the modal */
		const createdModalActionRowComponents: ActionRowBuilder<ModalActionRowComponentBuilder>[] = [];

		for (const includedComponent of this.includedComponents) {
			/** Text input component that should be added */
			const modalComponent = components[
				ComponentType[includedComponent.type as ComponentType] as keyof typeof components
			]?.get(includedComponent.name) as SavedModalComponent | undefined;

			if (!modalComponent) {
				throw new Error(`Found no modal action row component with name '${includedComponent.name}'`);
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

	async execute(interaction) {
		interaction;
	},
};

export default modal;
