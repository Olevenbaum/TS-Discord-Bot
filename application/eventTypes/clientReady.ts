// Global imports
import "../../globals/fileUpdate";
import "../../globals/notifications";

// Type imports
import { Client, Events } from "discord.js";
import { SavedEventType } from "../../types/others";

/** Client ready event handler */
const clientReady: SavedEventType = {
	once: true,
	type: Events.ClientReady,

	async execute(client: Client<true>) {
		notify("SUCCESS", `Client logged in as '${client.user.username}'`, client, `I've awaken, @member!`, 5);

		updateFiles(client, ["configuration", "eventTypes"], false);
	},
};

export default clientReady;
