// Internal class & type imports
import type { SavedChannelSelectMenuComponent } from "./SavedChannelSelectMenuComponent";
import type { SavedMentionableSelectMenuComponent } from "./SavedMentionableSelectMenuComponent";
import type { SavedStringSelectMenuComponent } from "./SavedStringSelectMenuComponent";
import type { SavedRoleSelectMenuComponent } from "./SavedRoleSelectMenuComponent";

/**
 * Union type representing all Discord select menu component types loaded from local files. Select menus allow users
 * to choose one or more options from a dropdown list. This type encompasses all specific select menu variants.
 * @see {@linkcode SavedChannelSelectMenuComponent}
 * @see {@linkcode SavedMentionableSelectMenuComponent}
 * @see {@linkcode SavedStringSelectMenuComponent}
 * @see {@linkcode SavedRoleSelectMenuComponent}
 */
export type SavedSelectMenuComponent =
	| SavedChannelSelectMenuComponent
	| SavedMentionableSelectMenuComponent
	| SavedStringSelectMenuComponent
	| SavedRoleSelectMenuComponent;
