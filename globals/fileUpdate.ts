// Global imports
import "./applicationCommandTypeUpdate";
import "./applicationCommandUpdate";
import "./eventTypeUpdate";
import "./interactionTypeUpdate";
import "./messageComponentTypeUpdate";
import "./modalUpdate";
import "./notifications";
import "./pathRelativation";
import { blockedUsers, configuration } from "./variables";

// Type imports
import { Client } from "discord.js";
import { FileInclude } from "../types/others";

declare global {
	/**
	 * Updates all changed files, adds new ones and deletes removed ones.
	 *
	 * **Note**: Only globally blocked users are reloaded, since blocked users of a guild should not be changed in the
	 * file directly
	 * @param client The Discord bot client
	 * @param forceReload Whether to reload all files no matter if files were changed, added or removed
	 * @see {@link Client}
	 */
	function updateFiles(client?: Client, forceReload?: boolean): Promise<void>;

	/**
	 * Updates all changed files, adds new ones and deletes removed ones.
	 *
	 * **Note**: Only globally blocked users are reloaded, since blocked users of a guild should not be changed in the
	 * file directly
	 * @param client The Discord bot client
	 * @param files Files to reload. If undefined all files are reloaded. If an object is provided, the presence of a
	 * key alone indicates whether to reload the specific file type or not, a boolean value indicates whether to force
	 * reload all files of the specific type or not. If include is `false`, the value of any key is ignored
	 * @param include Whether to include (`true`) or exclude (`false`) the specified files. Defaults to `true`
	 * @see {@link Client} | {@link FileInclude}
	 */
	function updateFiles(
		client?: Client,
		files?: FileInclude | (keyof FileInclude)[],
		include?: boolean,
	): Promise<void>;
}

global.updateFiles = async function (
	client?: Client,
	x: boolean | FileInclude | (keyof FileInclude)[] = false,
	include: boolean = true,
) {
	/** Force reload overload parameter */
	const forceReload = typeof x === "boolean" ? x : false;

	/** Files overload parameter */
	const files = typeof x === "boolean" || Object.keys(x).length === 0 ? undefined : x;

	if (!files) {
		updateApplicationCommands(client?.isReady() ? client : undefined, forceReload);
	} else if (Array.isArray(files)) {
		if (files.includes("applicationCommands") === include) {
			updateApplicationCommands(client?.isReady() ? client : undefined);
		}
	} else if ("applicationCommands" in files) {
		if (typeof files.applicationCommands !== "boolean") {
			updateApplicationCommands(client?.isReady() ? client : undefined, files.applicationCommands, include);
		} else {
			updateApplicationCommands(client?.isReady() ? client : undefined, files.applicationCommands);
		}
	}

	if (!files) {
		updateApplicationCommandTypes(forceReload);
	} else if (Array.isArray(files)) {
		if (files.includes("applicationCommandTypes") === include) {
			updateApplicationCommandTypes();
		}
	} else if ("applicationCommandTypes" in files) {
		if (Array.isArray(files.applicationCommandTypes)) {
			updateApplicationCommandTypes(files.applicationCommandTypes, include);
		} else {
			updateApplicationCommandTypes(files.applicationCommandTypes);
		}
	}

	if (!files || (Array.isArray(files) ? files.includes("blockedUsers") : Boolean(files.blockedUsers)) === include) {
		notify("INFO", "Updating global blocked users...");

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

		notify("SUCCESS", "Finished updating global blocked users");
	}

	if (!files || (Array.isArray(files) ? files.includes("configuration") : Boolean(files.configuration)) === include) {
		notify("INFO", "Updating configuration data...");

		configuration.bot = await import(relativePath(configuration.paths.configurationPath));

		notify("SUCCESS", "Finished updating configuration data");
	}

	if (client) {
		if (!files) {
			updateEventTypes(client, forceReload);
		} else if (Array.isArray(files)) {
			if (files.includes("eventTypes") === include) {
				updateEventTypes(client);
			}
		} else if ("eventTypes" in files) {
			if (Array.isArray(files.eventTypes)) {
				updateEventTypes(client, files.eventTypes, include);
			} else {
				updateEventTypes(client, files.eventTypes);
			}
		}
	}

	if (!files) {
		updateInteractionTypes(forceReload);
	} else if (Array.isArray(files)) {
		if (files.includes("interactionTypes") === include) {
			updateInteractionTypes();
		}
	} else if (Array.isArray(files.interactionTypes)) {
		updateInteractionTypes(files.interactionTypes, include);
	}

	if (!files) {
		updateMessageComponentTypes(forceReload);
	} else if (Array.isArray(files)) {
		if (files.includes("messageComponentTypes") === include) {
			updateMessageComponentTypes();
		}
	} else if ("messageComponentTypes" in files) {
		if (Array.isArray(files.messageComponentTypes)) {
			updateMessageComponentTypes(files.messageComponentTypes, include);
		} else {
			updateMessageComponentTypes(files.messageComponentTypes);
		}
	}

	if (!files) {
		updateModals(forceReload);
	} else if (Array.isArray(files)) {
		if (files.includes("modals") === include) {
			updateModals();
		}
	} else if ("modals" in files) {
		if (Array.isArray(files.modals)) {
			updateModals(files.modals, include);
		} else {
			updateModals(files.modals);
		}
	}
};

export {};
