// Global imports
import "../../globals/fileUpdate";
import "../../globals/notifications";

// Type imports
import { Client, Events } from "discord.js";
import { Configuration } from "../../types/configuration";
import { SavedEventType } from "../../types/others";

/**
 * Client ready event handler
 */
const clientReady: SavedEventType = {
    once: true,
    type: Events.ClientReady,

    async execute(configuration: Configuration, client: Client<true>, reload: boolean = false) {
        // Check if bot was restarted
        if (reload) {
            updateFiles(configuration, client, true);
        } else {
            notify(
				configuration,
				"SUCCESS",
				`Client logged in as '${client.user.username}'`,
				client,
				`I've awaken, @member!`,
				5,
			);

            updateFiles(configuration, client, ["configuration", "eventTypes"], true);
        }
    },
};

export default clientReady;
