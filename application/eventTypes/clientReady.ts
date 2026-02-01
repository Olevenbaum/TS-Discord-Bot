// Class & type imports
import type { SavedEventType } from "../../types";

// Data imports
import { client } from "#application";

// External library imports
import { Events } from "discord.js";

// Module imports
import notify from "../../modules/notification";
import { updateFiles } from "../../modules/update";

/**
 * Event handler for the Discord {@linkcode Events.ClientReady} event. Triggered once when the bot successfully connects
 * to Discord. Logs the bot's login status, updates all remaining files that were not loaded before and resets the CLI
 * focus color.
 * @see {@linkcode SavedEventType}
 */
const clientReady: SavedEventType = {
	once: true,
	type: Events.ClientReady,

	async execute(): Promise<void> {
		notify(`Client logged in as '${client.user!.username}'`, "SUCCESS", `I've awaken, @member!`, 6);

		updateFiles(["configuration", "eventTypes"], true);
	},
};

export default clientReady;
