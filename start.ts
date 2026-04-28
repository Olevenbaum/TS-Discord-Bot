// Class & type imports
import { DebuggingState } from "./classes";

// Module imports
import main from "#application";

/** Index of the bot intended to start */
const botIndex = 0;

/** Whether to run the application in debugging mode */
const debugging = DebuggingState.NONE;

// Start bot
main(botIndex, debugging);
