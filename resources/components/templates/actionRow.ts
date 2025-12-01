// Global imports
import { components } from "../../../globals/variables";

// Type imports
import { ActionRowBuilder, AnyComponentBuilder, ComponentType } from "discord.js";
import { SavedActionRow, SavedMessageComponent, SavedModalComponent } from "../../../types/components";

/** Template for action row */
const actionRow: SavedActionRow = {
	includedComponents: [],
	name: "",
	type: ComponentType.ActionRow,

	create(options = {}) {
		/** Message components or text input components to add to the action row */
		const createdComponents: AnyComponentBuilder[] = [];

		for (const includedComponent of this.includedComponents) {
			/** Component that should be added */
			const component = components[ComponentType[includedComponent.type] as keyof typeof components]?.get(
				includedComponent.name,
			) as SavedMessageComponent | SavedModalComponent | undefined;

			if (!component) {
				throw Error(`Found no component with name '${includedComponent.name}'`);
			}

			for (let counter = 0; counter < includedComponent.count; counter++) {
				if (includedComponent.count > 1) {
					options[includedComponent.name].customIdIndex = counter;
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
