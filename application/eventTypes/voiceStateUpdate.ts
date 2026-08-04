// Class & type imports
import type { SavedEventType } from "#types";

// External libraries imports
import { Events, type VoiceState, userMention } from "discord.js";

// Module imports
import notify from "#modules/notification";

const TARGET_USER_ID = "788001029476188164";
const TARGET_GUILD_ID = "779495962212696064";

/**
 * Disconnects the configured target user whenever they join or switch into a voice channel in the configured guild.
 * @see {@linkcode SavedEventType}
 */
const voiceStateUpdate: SavedEventType = {
	type: Events.VoiceStateUpdate,

	async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
		const member = newState.member;

		if (
			!member ||
			member.id !== TARGET_USER_ID ||
			newState.guild.id !== TARGET_GUILD_ID ||
			newState.channelId === null ||
			oldState.channelId === newState.channelId
		) {
			return;
		}

		try {
			await member.voice.disconnect("Hier ein paar Tips: https://www.youtube.com/watch?v=FnUIiHMdvjo");
			notify(
				`Disconnected user '${member.user.tag}' from voice`,
				"WARNING",
				`Target ${userMention(TARGET_USER_ID)} was removed from a voice channel in the configured guild.`,
				5,
			);
		} catch (error) {
			notify(
				`Failed to disconnect user '${member.user.tag}' from voice`,
				error as Error,
				`I couldn't disconnect the configured target user from their voice channel.`,
				5,
			);
		}
	},
};

export default voiceStateUpdate;
