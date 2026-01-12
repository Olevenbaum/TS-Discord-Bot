// Class & type imports
import type { SavedEventType } from "../../types";

// Data imports
import { cli, client } from "#application";

// External libraries imports
import { Events } from "discord.js";

// Module imports
import notify from "../../modules/notification";
import { updateFiles } from "../../modules/update";

/**
 * Client ready event handler
 * @see {@linkcode SavedEventType}
 */
const clientReady: SavedEventType = {
	once: true,
	type: Events.ClientReady,

	async execute(): Promise<void> {
		notify(`Client logged in as '${client.user!.username}'`, "SUCCESS", `I've awaken, @member!`, 6);

		updateFiles(["configuration", "eventTypes"], true);

		cli.focusColor = cli.focusColor;
	},
};

export default clientReady;
