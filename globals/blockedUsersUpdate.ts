// Data imports
import newBlockedUsers from "../resources/blockedUsers.json";

// Global imports
import "./notifications";
import { blockedUsers } from "./variables";

// Type imports
import { Configuration } from "../types/configuration";

declare global {
    /**
     * Updates the blocked users of the bot
     * @param configuration The configuration of the project and bot
     */
    function updateBlockedUsers(configuration: Configuration): void;
}

global.updateBlockedUsers = function (configuration: Configuration) {
    // Iterate through blocked users
    blockedUsers.forEach((blockedUser, index) => {
        // Check if blocked user is still blocked
        if (!(blockedUser in newBlockedUsers)) {
            // Remove blocked user
            blockedUsers.splice(index, 1);
        }
    });

    // Iterate through new blocked users
    newBlockedUsers.forEach((blockedUser) => {
        // Check if blocked user is not already blocked
        if (!(blockedUser in blockedUsers)) {
            // Add blocked user
            blockedUsers.push(blockedUser);
        }
    });

    // Notification
    notify(configuration, "info", "Updated all blocked users");
};
