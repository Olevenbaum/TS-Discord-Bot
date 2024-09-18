// Global imports
import { components } from "../../../globals/variables";

// Type imports
import { ActionRowBuilder, AnyComponentBuilder, ComponentType } from "discord.js";
import {
    ActionRowCreateOptions,
    SavedActionRow,
    SavedMessageComponent,
    SavedModalComponent,
} from "../../../types/components";
import { Configuration } from "../../../types/configuration";

/**
 * Template for action row
 */
const actionRow: SavedActionRow = {
    includedComponents: [],
    name: "",
    type: ComponentType.ActionRow,

    create(configuration: Configuration, options: ActionRowCreateOptions = {}): ActionRowBuilder {
        /**
         * Message components or text input components to add to the action row
         */
        const createdComponents: AnyComponentBuilder[] = [];

        // Iterate over included components
        for (const includedComponent of this.includedComponents) {
            // TODO: Inherited type (ask Tony)
            /**
             * Component that should be added
             */
            const component = components[includedComponent.type].get(includedComponent.name) as
                | SavedMessageComponent
                | SavedModalComponent
                | undefined;

            // Check if the component was found
            if (!component) {
                // Throw error
                throw new Error(`Found no component with name '${includedComponent.name}'`);
            }

            // Iterate through number of single component
            for (let counter = 0; counter < includedComponent.count; counter++) {
                // Check if custom ID index is needed
                if (includedComponent.count > 1) {
                    // Set index of component
                    options[includedComponent.name].customIdIndex = counter;
                }

                // Add message component to array
                createdComponents.push(
                    component.create(configuration, {
                        ...options.general,
                        ...options[includedComponent.name],
                    })
                );
            }
        }

        // Return action row
        return new ActionRowBuilder().setComponents(createdComponents);
    },
};

export default actionRow;
