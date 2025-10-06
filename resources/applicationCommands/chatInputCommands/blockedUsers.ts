// Global imports
import "../../../globals/discordTextFormat";
import "../../../globals/notifications";
import "../../../globals/pathRelativation";
import { blockedUsers } from "../../../globals/variables";

// Module imports
import fs from "fs";

// Type imports
import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	PermissionFlagsBits,
	SlashCommandBuilder,
	Team,
	User,
	userMention,
} from "discord.js";
import { SavedChatInputCommand } from "../../../types/applicationCommands";
import { Configuration } from "../../../types/configuration";

/**
 * Template for chat input command
 */
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

	async execute(configuration: Configuration, interaction: ChatInputCommandInteraction) {
		// Fetch owner(s) of the bot
		await interaction.client.application.fetch();

		// Check if user is allowed to use this command
		if (
			!(
				(interaction.inGuild() && interaction.options.getSubcommand().toUpperCase() !== "ENABLE") ||
				(interaction.client.application.owner instanceof User &&
					interaction.user.id === interaction.client.application.owner.id) ||
				(interaction.client.application.owner instanceof Team &&
					!(interaction.user.id in interaction.client.application.owner.members.keys()))
			)
		) {
			interaction.reply({
				content: `You don't have permission to use this command${
					interaction.options.getSubcommand().toUpperCase() === "ENABLE" ? "" : " in DMs"
				}.`,
				ephemeral: interaction.inGuild(),
			});

			return;
		}

		switch (interaction.options.getSubcommand().toUpperCase()) {
			case "BLOCK":
				/**
				 * User to add to blocked users
				 */
				const userToBlock = interaction.options.getUser("user", true);

				// Check if user is owner
				if (
					(interaction.client.application.owner instanceof User &&
						interaction.client.application.owner?.id === userToBlock.id) ||
					(interaction.client.application.owner instanceof Team &&
						interaction.client.application.owner?.members.some((member) => member.id === userToBlock.id))
				) {
					interaction.reply({
						content: `You can't block ${
							interaction.client.application.owner instanceof User ? "the" : "an"
						} owner of this bot!`,
						ephemeral: interaction.inGuild(),
					});

					notify(
						configuration,
						"WARNING",
						interaction.client,
						`${userMention(interaction.user.id)} tried to block ${
							interaction.client.application.owner instanceof User ? "you" : userMention(userToBlock.id)
						} from interacting with me.`,
						1,
					);

					return;
				} else if (interaction.client.user.id === userToBlock.id) {
					interaction.reply({
						content: `How the hell would I interact with myself...?! You can't block me!`,
						ephemeral: interaction.inGuild(),
					});

					return;
				}

				// Block user from interacting with bot
				if (interaction.inGuild()) {
					if (
						interaction.guildId in blockedUsers.guilds &&
						blockedUsers.guilds[interaction.guildId]!.includes(userToBlock.id)
					) {
						interaction.reply({
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

						interaction.reply({
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

						interaction.reply(`${userMention(userToBlock.id)} has been blocked from interacting with me.`);
					}
				}

				break;

			case "CLEAR":
				// Check if interaction was on a server
				if (interaction.inGuild()) {
					// Clear blocked users
					blockedUsers.guilds[interaction.guildId] = [];
				} else {
					// Clear blocked users
					blockedUsers.global = [];
				}

				// Interaction response
				interaction.reply({
					content: `All users have been unblocked from interacting with me${
						interaction.inGuild() ? " on this server" : ""
					}.`,
					ephemeral: interaction.inGuild(),
				});

				// Break switch
				break;

			case "ENABLE":
				// Update configuration
				configuration.bot.enableBlockedUsers =
					interaction.options.getBoolean("enable") ??
					typeof configuration.bot.enableBlockedUsers === "undefined"
						? false
						: !configuration.bot.enableBlockedUsers;

				// Interaction response
				interaction.reply({
					content: `Blocked users have been ${
						configuration.bot.enableBlockedUsers ? "enabled" : "disabled"
					}.`,
					ephemeral: interaction.inGuild(),
				});

				// Update configuration file
				fs.writeFileSync(
					relativePath(configuration.project.configurationPath),
					JSON.stringify(configuration.bot, undefined, 4),
				);

				// Break switch
				break;

			case "LIST":
				// Check if interaction was on a server
				if (interaction.inGuild()) {
					// Check if no users are blocked
					if (
						interaction.guildId in blockedUsers.guilds &&
						blockedUsers.guilds[interaction.guildId]!.length !== 0
					) {
						// Interaction response
						interaction.reply(
							list(blockedUsers.guilds[interaction.guildId]!.map((userId) => userMention(userId))),
						);
					} else {
						// Interaction response
						interaction.reply({
							content: "No users are currently blocked from interacting with me on this server.",
							ephemeral: true,
						});
					}
				} else {
					// Check if no users are blocked
					if (blockedUsers.global.length === 0) {
						// Interaction response
						interaction.reply("No users are currently blocked from interacting with me.");
					} else {
						// Interaction response
						interaction.reply(list(blockedUsers.global.map((userId) => userMention(userId))));
					}
				}

				// Break switch
				break;

			case "UNBLOCK":
				/**
				 * User to add to blocked users
				 */
				const userToUnblock = interaction.options.getUser("user", true);

				// Check if interaction was on a server
				if (interaction.inGuild()) {
					// Check if user is already blocked
					if (
						interaction.guildId in blockedUsers.guilds &&
						blockedUsers.guilds[interaction.guildId]!.includes(userToUnblock.id)
					) {
						// Remove user from blocked users
						blockedUsers.guilds[interaction.guildId]!.splice(
							blockedUsers.guilds[interaction.guildId]!.indexOf(userToUnblock.id),
							1,
						);

						// Sort blocked users
						blockedUsers.guilds[interaction.guildId]!.sort();

						// Interaction response
						interaction.reply({
							content: `${userMention(
								userToUnblock.id,
							)} has been unblocked from interacting with me on this server.`,
							ephemeral: true,
						});
					} else {
						// Interaction response
						interaction.reply({
							content: `${userMention(
								userToUnblock.id,
							)} is not blocked from interacting with me on this server and therefore can't be unblocked.`,
							ephemeral: true,
						});
					}
				} else {
					// Check if user is already blocked
					if (blockedUsers.global.includes(userToUnblock.id)) {
						// Remove user from blocked users
						blockedUsers.global.splice(blockedUsers.global.indexOf(userToUnblock.id), 1);

						// Sort blocked users
						blockedUsers.global.sort();

						// Interaction response
						interaction.reply(
							`${userMention(userToUnblock.id)} has been unblocked from interacting with me.`,
						);
					} else {
						// Interaction response
						interaction.reply(
							`${userMention(
								userToUnblock.id,
							)} is not blocked from interacting with me and therefore can't be unblocked.`,
						);
					}
				}

				// Break switch
				break;
		}

		// Check if blocked users file needs to be updated
		if (["BLOCK", "CLEAR", "UNBLOCK"].includes(interaction.options.getSubcommand().toUpperCase())) {
			// Update blocked users file
			fs.writeFileSync(
				relativePath(configuration.project.blockedUsersPath),
				JSON.stringify(blockedUsers, undefined, 4),
			);
		}

		// Check if blocked users are enabled
		if (configuration.bot.enableBlockedUsers ?? true) {
			// Interaction follow up message
			interaction.followUp({
				content: "Please note, that blocked users are currently disabled.",
				ephemeral: interaction.inGuild(),
			});
		}
	},
};

export default chatInputCommand;
