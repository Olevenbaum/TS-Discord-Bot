// Type imports
import { Client, Events } from "discord.js";
import { Configuration, SavedEventType } from "../../types/interfaces";

/**
 * Client ready event handler
 */
const eventType: SavedEventType = {
    once: true,
    type: Events.ClientReady,

    async execute(_: Configuration, client: Client): Promise<void> {
        // Check if client is ready
        if (client.isReady()) {
            console.log(`Client logged in as ${client.user.username}`);
        }
    },
};

export { eventType };
