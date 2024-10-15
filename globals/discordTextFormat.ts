// Type imports
import {
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Snowflake,
} from "discord.js";
import { NestedArray } from "types/others";

declare global {
    /**
     * Builds a string that prints a bold text on Discord
     * @param text The text to print
     * @returns The bold text
     */
    function bold(text: boolean | number | string): `**${string}**`;

    /**
     * Builds a string that prints as a code block on Discord
     * @param text The text to print
     * @returns The code block
     */
    function code(text: string): `\`\`\`${string}\`\`\``;

    /**
     * Builds a string to mention a chat input command on Discord
     * @param interaction The chat input command interaction
     * @returns The chat input command mention
     */
    function commandMention(
        interaction: AutocompleteInteraction | ChatInputCommandInteraction
    ): `</${string}:${Snowflake}>`;

    /**
     * Builds a string to mention a chat input command on Discord
     * @param name The name of the chat input command
     * @param id The ID of the chat input command
     * @returns The chat input command mention
     */
    function commandMention(name: string, id: Snowflake): `</${string}:${Snowflake}>`;

    /**
     * Builds a string that prints as a inline code block on Discord
     * @param text The text to print
     * @returns The inline code block
     */
    function inlineCode(text: boolean | number | string): `\`${string}\``;

    /**
     * Builds a string that prints an italic text on Discord
     * @param text The text to print
     * @returns The italic text
     */
    function italic(text: boolean | number | string): `*${string}*`;

    /**
     * Builds a string that prints a list on Discord
     * @param items The items to list
     * @param ordered Whether or not the list should be ordered
     * @param indent The starting indentation of the list (used for recursion)
     * @returns The list
     */
    function list(items: NestedArray<boolean | number | string>, ordered?: boolean, indent?: number): string;

    /**
     * Builds a string that prints a masked link on Discord
     * @param text The text the link should display
     * @param url The URL the link should point to
     * @returns The masked link
     */
    function maskedLink(text: boolean | number | string, url: string): `[${string}](${string})`;

    /**
     * Builds a string that prints a spoiler on Discord
     * @param text The text to print
     * @returns The spoiler
     */
    function spoiler(text: boolean | number | string): `||${string}||`;

    /**
     * Builds a string that prints a strikethrough text on Discord
     * @param text The text to print
     * @returns The strikethrough text
     */
    function strikethrough(text: boolean | number | string): `~~${string}~~`;

    /**
     * Builds a string that prints a subtext on Discord
     * @param text The text to print
     * @returns The subtext
     */
    function subtext(text: boolean | number | string): `-# ${string}`;

    /**
     * Builds a string that prints an underlined text on Discord
     * @param text The text to print
     * @returns The underlined text
     */
    function underlined(text: boolean | number | string): `__${string}__`;
}

global.bold = function (text: boolean | number | string): `**${string}**` {
    // Return bold text
    return `**${text}**`;
};

global.code = function (text: string): `\`\`\`${string}\`\`\`` {
    // Return code block
    return `\`\`\`${text}\`\`\``;
};

global.commandMention = function (
    x: string | AutocompleteInteraction | ChatInputCommandInteraction,
    id?: Snowflake
): `</${string}:${Snowflake}>` {
    // Check wich overload was called
    if (x instanceof AutocompleteInteraction || x instanceof ChatInputCommandInteraction) {
        // Check if chat input command has subcommands
        if (
            x.command!.options.length > 0 &&
            x.command!.options.every((option) => option.type === ApplicationCommandOptionType.Subcommand)
        ) {
            // Return chat input command mention with subcommand
            return `</${x.commandName} ${x.options.getSubcommandGroup() ?? ""}${x.options.getSubcommand()}:${
                x.commandId
            }>`;
        }

        // Return chat input command mention
        return `</${x.commandName}:${x.commandId}>`;
    } else {
        // Return chat input command mention
        return `</${x}:${id}>`;
    }
};

global.inlineCode = function (text: boolean | number | string): `\`${string}\`` {
    // Return inline code block
    return `\`${text}\``;
};

global.italic = function (text: boolean | number | string): `*${string}*` {
    // Return italic text
    return `*${text}*`;
};

global.list = function (items: NestedArray<boolean | number | string>, ordered = false, indent: number = 0): string {
    // Iterate through list items
    const listItems = items.map((item, index) => {
        // Check if item is an array
        if (Array.isArray(item)) {
            // Return list item with nested list
            return list(item, ordered, indent + 1);
        }

        // Return list item
        return `${ordered ? `${index + 1}.` : "-"} ${item}`.padStart(
            2 * indent + String(item).length + (ordered ? 3 : 2)
        );
    });

    // Return list
    return listItems.join("\n");
};

global.maskedLink = function (text: boolean | number | string, url: string): `[${string}](${string})` {
    // Return masked link
    return `[${text}](${url})`;
};

global.spoiler = function (text: boolean | number | string): `||${string}||` {
    // Return spoiler
    return `||${text}||`;
};

global.strikethrough = function (text: boolean | number | string): `~~${string}~~` {
    // Return strikethrough text
    return `~~${text}~~`;
};

global.subtext = function (text: boolean | number | string): `-# ${string}` {
    // Return subtext
    return `-# ${text}`;
};

global.underlined = function (text: boolean | number | string): `__${string}__` {
    // Return underlined text
    return `__${text}__`;
};

export {};
