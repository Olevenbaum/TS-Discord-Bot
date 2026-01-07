// Class & type imports
import type { SavedEventType } from "../../types";

// Data imports
import { cli } from "#application";

// External libraries imports
import { Client, Events } from "discord.js";

// Module imports
import notify from "../../modules/notification";
import { updateFiles } from "../../modules/update";

/** Client ready event handler */
const clientReady: SavedEventType = {
	once: true,
	type: Events.ClientReady,

	async execute(client: Client<true>) {
		notify(`Client logged in as '${client.user.username}'`, "SUCCESS", `I've awaken, @member!`, 6);

		updateFiles(client, ["configuration", "eventTypes"], false);

		if (cli.focusColor === "auto") {
			cli.focusColor = "auto";
		}
	},
};

export default clientReady;
