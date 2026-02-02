# Copilot instructions for TS-Discord-Bot

This project is a TypeScript-based Discord bot run with `bun` and organized into small modules (application, resources, modules, classes). Use these notes to make focused, safe edits.

- **Big picture:** The entrypoint is `start.ts` which calls `main(botIndex, debugging)` exported from the `application` module. `application/application.ts` initializes `client`, `cli`, and `database` and performs startup tasks (auto-update of `eventTypes`, DB auth, bot login).

- **Runtime & developer commands:** The project uses `bun` as runtime. Use:
    - `bun .` or `npm run start` — start the bot (see `package.json` `start` script).
    - `bun temp/test.ts` — project test script (see `package.json` `test`).

- **Important import aliases:** `package.json` defines imports for `#application` and `#variables`. When editing files, prefer those aliases where present (e.g. `import main from "#application"`).

- **Configuration & secrets:** Configuration is assembled in `resources/variables.ts` from `configuration/*.json`. Tokens and regexes are stored in `configuration/discord.json` and compiled (e.g. `tokenRegex` → `RegExp`). Bot entries may be an array (`configuration.bot.botData`) or a single object; code supports rotation and iteration — be careful when changing token handling logic.

- **Database:** Database connection is optional. `application` initializes Sequelize only if `configuration.database` exists. See `configuration/database.json` and `application/application.ts` for DB lifecycle and authentication logic.

- **CLI & console commands:** The interactive console uses `classes/cli/CommandHandler.ts` and `classes/ConsoleHandler.ts`. Console commands are loaded from the filesystem using the configured path (`configuration.paths.consoleCommandsPath`). Command names are matched case-insensitively via uppercase conversion in `CommandHandler.transformInput()`; parameter parsing follows `transformParameters()` rules (quoted strings, arrays, numbers, booleans).

- **Event & interaction update flow:** On startup the app calls `updateFiles(["eventTypes"])` from `modules/update`. Many runtime resources (event types, interaction types, application commands, components, modals) are stored under `resources/` and kept in memory collections exported from `resources/variables.ts`.

- **Logging & errors:** The project uses a `modules/notification` helper (`notify`) for logging and error reporting. Use that instead of ad-hoc console output to remain consistent.

- **File loading conventions:** The codebase uses `modules/fileReader/readFiles` for dynamic loading. When adding new command/event files, follow existing templates in `resources/*/templates/` so automatic loaders pick them up.

- **Patterns to preserve when editing:**
    - Avoid changing how `configuration.bot.botData` is checked/iterated — the codebase expects both array and single-object shapes.
    - Keep `tokenRegex` usage intact when validating login tokens.
    - Use the `notify` module for user-facing messages and errors.
    - Respect `imports` alias in `package.json` when adding or moving modules.

- **Quick file references (start here when exploring):**
    - `start.ts` — small entry wrapper that calls the main app
    - `application/application.ts` — main initialization, client/DB/CLI lifecycle
    - `resources/variables.ts` — assembled configuration and in-memory collections
    - `classes/cli/CommandHandler.ts` — console command parsing & validation
    - `configuration/discord.json` — token regex and Discord-related limits
    - `modules/update` and `modules/fileReader` — update/load workflow

If anything above is unclear or you want deeper examples (typical command file, an event handler template, or how to run the app with a local DB), tell me which area to expand and I'll update this file.
