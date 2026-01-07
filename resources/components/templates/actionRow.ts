// Class & type imports
import { ActionRowCreateOptions, SavedActionRow, SavedMessageComponent, SavedModalComponent } from "../../../types";

// Data imports
import { components } from "#variables";

// External libraries imports
import { ActionRowBuilder, AnyComponentBuilder, ComponentType } from "discord.js";

/** Template for action row */
const actionRow: SavedActionRow = {
	includedComponents: [],
	name: "",
	type: ComponentType.ActionRow,

	create(options: ActionRowCreateOptions = {}) {
		/** Message components or text input components to add to the action row */
		const createdComponents: AnyComponentBuilder[] = [];

		for (const includedComponent of this.includedComponents) {
			/** Component that should be added */
			const component = components[includedComponent.type]?.get(includedComponent.name) as
				| SavedMessageComponent
				| SavedModalComponent
				| undefined;

			if (!component) {
				throw Error(`Found no component with name '${includedComponent.name}'`);
			}

			for (let counter = 0; counter < (includedComponent.count ?? 1); counter++) {
				if (!options[includedComponent.name]) {
					options[includedComponent.name] = {};
				}

				if ((includedComponent.count ?? 1) > 1) {
					options[includedComponent.name]!.customIdIndex = counter;
				}

				createdComponents.push(
					component.create({
						...options.general,
						...options[includedComponent.name],
					}),
				);
			}
		}

		return new ActionRowBuilder().setComponents(createdComponents);
	},
};

export default actionRow;
