// Global imports
import "../../../globals/discordTextFormat";
import "../../../globals/notifications";
import "../../../globals/pathRelativation";
import { blockedUsers, configuration } from "../../../globals/variables";

// Module imports
import fs from "fs";

// Type imports
import { ApplicationCommandType, PermissionFlagsBits, SlashCommandBuilder, Team, User, userMention } from "discord.js";
import { SavedChatInputCommand } from "../../../types/applicationCommands";

/** Chat input command to manage blocked users */
const chatInputCommand: SavedChatInputCommand = {
	data: new SlashCommandBuilder()
		.addSubcommand((subcommand) =>
			subcommand
				.setDescription("Blocks a user from interacting with me")
				.setName("block")
				.addUserOption((option) =>
					option.setDescription("The user to block").setName("user").setRequired(true),
				),
		)
		.addSubcommand((subcommand) => subcommand.setDescription("Clears the list of blocked users").setName("clear"))
		.addSubcommand((subcommand) =>
			subcommand
				.setDescription("Enables or disables blocked users (toggle without specifying enable or disable)")
				.setName("enable")
				.addBooleanOption((option) =>
					option.setDescription("Whether to enable or disable blocked users").setName("enable"),
				),
		)
		.addSubcommand((subcommand) => subcommand.setDescription("Lists all blocked users").setName("list"))
		.addSubcommand((subcommand) =>
			subcommand
				.setDescription("Unblockes a user from interacting with me")
				.setName("unblock")
				.addUserOption((option) =>
					option.setDescription("The user to unblock").setName("user").setRequired(true),
				),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription("Manages users blocked from interacting with me")
		.setName("blocked_users"),

	type: ApplicationCommandType.ChatInput,

	async execute(interaction) {
		await interaction.client.application.fetch();

		// Block interaction if user has no permission to use it
		if (
			!(
				(interaction.inGuild() && interaction.options.getSubcommand().toUpperCase() !== "ENABLE") ||
				(interaction.client.application.owner instanceof User &&
					interaction.user.id === interaction.client.application.owner.id) ||
				(interaction.client.application.owner instanceof Team &&
					!interaction.client.application.owner.members.some((member) => member.id === interaction.user.id))
			)
		) {
			await interaction.reply({
				content: `You don't have permission to use this command${
					interaction.options.getSubcommand().toUpperCase() === "ENABLE" ? "" : " in DMs"
				}.`,
				ephemeral: interaction.inGuild(),
			});

			return;
		}

		switch (interaction.options.getSubcommand().toUpperCase()) {
			case "BLOCK":
				/** User to add to blocked users */
				const userToBlock = interaction.options.getUser("user", true);

				// Prevent blocking the owner(s), the bot itself or the user themself
				if (
					(interaction.client.application.owner instanceof User &&
						interaction.client.application.owner.id === userToBlock.id) ||
					(interaction.client.application.owner instanceof Team &&
						interaction.client.application.owner.members.some((member) => member.id === userToBlock.id))
				) {
					await interaction.reply({
						content: `You can't block ${
							interaction.client.application.owner instanceof User ? "the" : "an"
						} owner of this bot!`,
						ephemeral: interaction.inGuild(),
					});

					notify(
						"WARNING",
						interaction.client,
						`${userMention(interaction.user.id)} tried to block ${
							interaction.client.application.owner instanceof User ? "you" : userMention(userToBlock.id)
						} from interacting with me.`,
						1,
					);

					return;
				} else if (interaction.client.user.id === userToBlock.id) {
					await interaction.reply({
						content: `How the hell would I interact with myself...?! You can't block me!`,
						ephemeral: interaction.inGuild(),
					});

					return;
				} else if (interaction.user.id === userToBlock.id) {
					await interaction.reply({
						content: "Are you serious...? You can't block yourself.",
						ephemeral: true,
					});

					return;
				}

				// Block user from interacting with the bot if not already blocked
				if (interaction.inGuild()) {
					if (
						interaction.guildId in blockedUsers.guilds &&
						blockedUsers.guilds[interaction.guildId]!.includes(userToBlock.id)
					) {
						await interaction.reply({
							content: `${userMention(
								userToBlock.id,
							)} is already blocked from interacting with me on this server.`,
							ephemeral: true,
						});
					} else {
						if (!(interaction.guildId in blockedUsers.guilds)) {
							blockedUsers.guilds[interaction.guildId] = [];
						}

						blockedUsers.guilds[interaction.guildId]!.push(userToBlock.id);

						blockedUsers.guilds[interaction.guildId]!.sort();

						await interaction.reply({
							content: `${userMention(
								userToBlock.id,
							)} has been blocked from interacting with me on this server.`,
							ephemeral: true,
						});
					}
				} else {
					if (blockedUsers.global.includes(userToBlock.id)) {
						interaction.reply(
							`${userMention(userToBlock.id)} is already blocked from interacting with me.`,
						);
					} else {
						blockedUsers.global.push(userToBlock.id);

						blockedUsers.global.sort();

						await interaction.reply(
							`${userMention(userToBlock.id)} has been blocked from interacting with me.`,
						);
					}
				}

				break;

			case "CLEAR":
				// Clear blocked users
				if (interaction.inGuild()) {
					blockedUsers.guilds[interaction.guildId] = [];
				} else {
					blockedUsers.global = [];
				}

				await interaction.reply({
					content: `All users have been unblocked from interacting with me${
						interaction.inGuild() ? " on this server" : ""
					}.`,
					ephemeral: interaction.inGuild(),
				});

				break;

			case "ENABLE":
				configuration.bot.enableBlockedUsers =
					interaction.options.getBoolean("enable") ??
					(typeof configuration.bot.enableBlockedUsers === "undefined"
						? false
						: !configuration.bot.enableBlockedUsers);

				await interaction.reply({
					content: `Blocked users have been ${
						configuration.bot.enableBlockedUsers ? "enabled" : "disabled"
					}.`,
					ephemeral: interaction.inGuild(),
				});

				fs.writeFileSync(
					relativePath(configuration.paths.configurationPath),
					JSON.stringify(configuration.bot, undefined, 4),
				);

				break;

			case "LIST":
				if (configuration.bot.enableBlockedUsers === false) {
					await interaction.reply({
						content: "Blocked users are currently disabled.",
						ephemeral: interaction.inGuild(),
					});
				} else if (interaction.inGuild()) {
					if (
						interaction.guildId in blockedUsers.guilds &&
						blockedUsers.guilds[interaction.guildId]!.length !== 0
					) {
						await interaction.reply(
							list(blockedUsers.guilds[interaction.guildId]!.map((userId) => userMention(userId))),
						);
					} else {
						await interaction.reply({
							content: "No users are currently blocked from interacting with me on this server.",
							ephemeral: true,
						});
					}
				} else {
					if (blockedUsers.global.length === 0) {
						await interaction.reply("No users are currently blocked from interacting with me.");
					} else {
						await interaction.reply(list(blockedUsers.global.map((userId) => userMention(userId))));
					}
				}

				break;

			case "UNBLOCK":
				/** User to remove from blocked users */
				const userToUnblock = interaction.options.getUser("user", true);

				if (interaction.inGuild()) {
					if (
						interaction.guildId in blockedUsers.guilds &&
						blockedUsers.guilds[interaction.guildId]!.includes(userToUnblock.id)
					) {
						blockedUsers.guilds[interaction.guildId]!.splice(
							blockedUsers.guilds[interaction.guildId]!.indexOf(userToUnblock.id),
							1,
						);

						blockedUsers.guilds[interaction.guildId]!.sort();

						await interaction.reply({
							content: `${userMention(
								userToUnblock.id,
							)} has been unblocked from interacting with me on this server.`,
							ephemeral: true,
						});
					} else {
						await interaction.reply({
							content: `${userMention(
								userToUnblock.id,
							)} is not blocked from interacting with me on this server and therefore can't be unblocked.`,
							ephemeral: true,
						});
					}
				} else {
					if (blockedUsers.global.includes(userToUnblock.id)) {
						blockedUsers.global.splice(blockedUsers.global.indexOf(userToUnblock.id), 1);

						blockedUsers.global.sort();

						await interaction.reply(
							`${userMention(userToUnblock.id)} has been unblocked from interacting with me.`,
						);
					} else {
						await interaction.reply(
							`${userMention(
								userToUnblock.id,
							)} is not blocked from interacting with me and therefore can't be unblocked.`,
						);
					}
				}

				break;

			default:
				await interaction.reply({
					content: `The subcommand '${interaction.options.getSubcommand()}' does not exist.`,
					ephemeral: true,
				});

				notify(
					"ERROR",
					`Unknown subcommand '${interaction.options.getSubcommand()}' used with 'blocked_users' chat input command`,
					interaction.client,
					`${userMention(
						interaction.user.id,
					)} used an unknown subcommand '${interaction.options.getSubcommand()}' with ${commandMention(
						interaction,
					)}.`,
					2,
				);

				return;
		}

		// Update blocked users file if a change was made
		if (["BLOCK", "CLEAR", "UNBLOCK"].includes(interaction.options.getSubcommand().toUpperCase())) {
			fs.writeFileSync(
				relativePath(configuration.paths.blockedUsersPath),
				JSON.stringify(blockedUsers, undefined, 4),
			);
		}

		if (!(configuration.bot.enableBlockedUsers ?? true)) {
			interaction.followUp({
				content: "Please note, that blocked users are currently disabled.",
				ephemeral: interaction.inGuild(),
			});
		}
	},
};

export default chatInputCommand;
