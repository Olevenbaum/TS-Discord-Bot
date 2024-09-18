// Type imports
import { Client } from "discord.js";
import { Interface } from "readline";
import { Configuration } from "../../../types/configuration";
import { ConsoleCommand } from "../../../types/others";

/**
 * Template for console command
 */
const consoleCommand: ConsoleCommand = {
    description: "",
    name: "",
    execute(configuration: Configuration, client: Client<true>, rlInterface: Interface) {},
};

export default consoleCommand;
