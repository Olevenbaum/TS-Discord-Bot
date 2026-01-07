// Internal type imports
import {
	SavedChannelSelectMenuComponent,
	SavedMentionableSelectMenuComponent,
	SavedStringSelectMenuComponent,
	SavedRoleSelectMenuComponent,
} from "./";

/** Select menu component imported from local file */
export type SavedSelectMenuComponent =
	| SavedChannelSelectMenuComponent
	| SavedMentionableSelectMenuComponent
	| SavedStringSelectMenuComponent
	| SavedRoleSelectMenuComponent;
