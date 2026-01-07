// Data imports
import { blockedUsers, configuration } from "#variables";

// Internal module imports
import updateApplicationCommandTypes from "./applicationCommandTypeUpdate";
import updateApplicationCommands from "./applicationCommandUpdate";
import updateEventTypes from "./eventTypeUpdate";
import updateInteractionTypes from "./interactionTypeUpdate";
import updateComponentTypes from "./componentTypeUpdate";
import updateModals from "./modalUpdate";

// Internal type imports
import { FileInclude } from "./types";

// Module imports
import { relativePath } from "../fileReader";
import notify from "../notification";

/**
 * Updates all changed files, adds new ones and deletes removed ones.
 * @param forceReload Whether to reload all files no matter if files were changed, added or removed (defaults to
 * `false`)
 */
export default function updateFiles(forceReload?: boolean): Promise<void>;

/**
 * Updates all changed files, adds new ones and deletes removed ones.
 * @param files Files to reload. If undefined all files are reloaded. If an object is provided, the presence of a
 * key alone indicates whether to reload the specific file type or not, a boolean value indicates whether to force
 * reload all files of the specific type or not. If include is `false`, the value of any key is ignored
 * @param exclude Whether to include (`false`) or exclude (`true`) the specified files (defaults to `false`)
 * @see {@link FileInclude}
 */
export default function updateFiles(files?: FileInclude | (keyof FileInclude)[], exclude?: boolean): Promise<void>;

export default async function updateFiles(
	x: boolean | FileInclude | (keyof FileInclude)[] = false,
	exclude: boolean = false,
) {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Files overload parameter */
	const files = typeof x === "boolean" || Object.keys(x).length === 0 ? undefined : x;

	if (!files) {
		updateApplicationCommands(forceReload);
	} else if (Array.isArray(files)) {
		if (files.includes("applicationCommands") !== exclude) {
			updateApplicationCommands();
		}
	} else if ("applicationCommands" in files) {
		if (typeof files.applicationCommands === "boolean") {
			updateApplicationCommands(files.applicationCommands);
		} else {
			updateApplicationCommands(files.applicationCommands, exclude);
		}
	}

	if (!files) {
		updateApplicationCommandTypes(forceReload);
	} else if (Array.isArray(files)) {
		if (files.includes("applicationCommandTypes") !== exclude) {
			updateApplicationCommandTypes();
		}
	} else if ("applicationCommandTypes" in files) {
		if (Array.isArray(files.applicationCommandTypes)) {
			updateApplicationCommandTypes(files.applicationCommandTypes, exclude);
		} else {
			updateApplicationCommandTypes(files.applicationCommandTypes);
		}
	}

	if (!files || (Array.isArray(files) ? files.includes("blockedUsers") : Boolean(files.blockedUsers)) !== exclude) {
		notify("Updating global blocked users...", "INFORMATION");

		const newBlockedUsers = (await import(
			relativePath(configuration.paths.blockedUsersPath)
		)) as typeof blockedUsers;

		blockedUsers.global.forEach((blockedUser, index) => {
			if (!newBlockedUsers.global.includes(blockedUser)) {
				blockedUsers.global.splice(index, 1);
			}
		});

		newBlockedUsers.global.forEach((blockedUser) => {
			if (!blockedUsers.global.includes(blockedUser)) {
				blockedUsers.global.push(blockedUser);
			}
		});

		notify("Finished updating global blocked users", "SUCCESS");
	}

	if (!files || (Array.isArray(files) ? files.includes("configuration") : Boolean(files.configuration)) !== exclude) {
		notify("Updating configuration data...", "INFORMATION");

		configuration.bot = await import(relativePath(configuration.paths.configurationPath));

		notify("Finished updating configuration data", "SUCCESS");
	}

	if (!files) {
		updateEventTypes(forceReload);
	} else if (Array.isArray(files)) {
		if (files.includes("eventTypes") !== exclude) {
			updateEventTypes();
		}
	} else if ("eventTypes" in files) {
		if (Array.isArray(files.eventTypes)) {
			updateEventTypes(files.eventTypes, exclude);
		} else {
			updateEventTypes(files.eventTypes);
		}
	}

	if (!files) {
		updateInteractionTypes(forceReload);
	} else if (Array.isArray(files)) {
		if (files.includes("interactionTypes") !== exclude) {
			updateInteractionTypes();
		}
	} else if (Array.isArray(files.interactionTypes)) {
		updateInteractionTypes(files.interactionTypes, exclude);
	}

	if (!files) {
		updateComponentTypes(forceReload);
	} else if (Array.isArray(files)) {
		if (files.includes("messageComponentTypes") !== exclude) {
			updateComponentTypes();
		}
	} else if ("messageComponentTypes" in files) {
		if (Array.isArray(files.messageComponentTypes)) {
			updateComponentTypes(files.messageComponentTypes, exclude);
		} else {
			updateComponentTypes(files.messageComponentTypes);
		}
	}

	if (!files) {
		updateModals(forceReload);
	} else if (Array.isArray(files)) {
		if (files.includes("modals") !== exclude) {
			updateModals();
		}
	} else if ("modals" in files) {
		if (Array.isArray(files.modals)) {
			updateModals(files.modals, exclude);
		} else {
			updateModals(files.modals);
		}
	}
}
