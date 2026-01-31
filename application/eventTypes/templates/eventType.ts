// Class & type imports
import type { SavedEventType } from "../../../types";

// External library imports
import { Events } from "discord.js";

/**
 * Template for Discord event handlers. Copy this file, implement the {@linkcode SavedEventType.execute} method for your
 * specific event and modify the {@linkcode SavedEventType.type} field to specify which Discord.js event this handler
 * responds to. The {@linkcode SavedEventType.once} flag determines if the handler should fire only once or repeatedly
 * for the same event.
 * @see {@linkcode SavedEventType}
 */
const eventType: SavedEventType = {
	type:
		Events.ApplicationCommandPermissionsUpdate,

	async execute(): Promise<void> {},
};

export default eventType;
