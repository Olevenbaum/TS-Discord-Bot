// Module imports
import { main } from "./application/application";

// Type imports
import { GatewayIntentBits } from "discord.js";

/** Gateway intents your bot needs */
const gatewayIntents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent];

// Start bot
main(0, gatewayIntents);
