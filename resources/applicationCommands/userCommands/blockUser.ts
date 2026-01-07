// Class & type imports
import { SavedUserCommand } from "../../../types";

// Data imports
import { blockedUsers, configuration } from "#variables";

// External libraries imports
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	ContextMenuCommandBuilder,
	InteractionContextType,
	PermissionFlagsBits,
	Team,
	User,
	userMention,
} from "discord.js";

// Module imports
import fs from "fs";
import { relativePath } from "../../../modules/fileReader";
import notify from "../../../modules/notification";

/** Block user command */
const userCommand: SavedUserCommand = {
	data: new ContextMenuCommandBuilder()
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
		.setName("Block User"),

	type: ApplicationCommandType.User,

	async execute(interaction) {
		if (interaction.client.user.id === interaction.targetId) {
			await interaction.reply({
				content: `How the hell would I interact with myself...?! You can't block me!`,
				ephemeral: interaction.inGuild(),
			});

			return;
		} else if (interaction.targetId === interaction.user.id) {
			await interaction.reply({
				content: "Are you serious...? You can't block yourself.",
				ephemeral: true,
			});

			return;
		}

		if (
			(interaction.client.application.owner instanceof User &&
				interaction.targetId === interaction.client.application.owner.id) ||
			(interaction.client.application.owner instanceof Team &&
				interaction.client.application.owner.members.some((member) => member.id === interaction.targetId))
		) {
			await interaction.reply({
				content: `You can't block ${
					interaction.client.application.owner instanceof User ? "the" : "an"
				} owner of this bot!`,
				ephemeral: interaction.inGuild(),
			});

			notify(
				`'${interaction.user.username}' tried to block '${interaction.targetUser.username}' without permission`,
				"WARNING",
				`${userMention(interaction.user.id)} tried to block ${
					interaction.client.application.owner instanceof User ? "you" : userMention(interaction.targetId)
				} from interacting with me.`,

				3,
			);

			return;
		}

		if (interaction.guildId! in blockedUsers.guilds) {
			if (blockedUsers.guilds[interaction.guildId!]!.includes(interaction.targetId)) {
			}
			blockedUsers.guilds[interaction.guildId!]!.push(interaction.targetId);

			blockedUsers.guilds[interaction.guildId!]!.sort();
		} else {
			blockedUsers.guilds[interaction.guildId!]! = [interaction.targetId];
		}

		fs.writeFileSync(
			relativePath(configuration.paths.blockedUsersPath),
			JSON.stringify(blockedUsers, undefined, 4),
		);
	},
};

userCommand.data.setType(userCommand.type);

export default userCommand;
