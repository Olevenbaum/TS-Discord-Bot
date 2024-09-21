// Type imports
import { Client } from "discord.js";
import { Interface } from "readline";
import { Configuration } from "../../../types/configuration";
import { ConsoleCommand, NestedArray } from "../../../types/others";

/**
 * Template for console command
 */
const consoleCommand: ConsoleCommand = {
    description: "",
    name: "",
    execute(
        configuration: Configuration,
        client: Client<true>,
        rlInterface: Interface,
        ...values: NestedArray<boolean | number | string>
    ) {},
};

export default consoleCommand;
