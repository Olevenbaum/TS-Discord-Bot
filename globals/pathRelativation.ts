// Module imports
import path from "path";

declare global {
    /**
     * Creates the relative path of a file or directory or joins the two paths if the relative path is empty
     * @param destination The path of the file or directory
     * @param relativeTo The path of the file or directory to be relative to
     * @returns The relative path of the file or directory
     */
    function relativePath(destination: string, relativeTo?: string): string;
}

global.relativePath = function (destination: string, relativeTo: string = path.resolve()): string {
    /**
     * Relative path of the file or directory
     */
    const relativePath = path.relative(destination, relativeTo);

    // Check if relative path is empty
    if (/[\.\/\\]*/.test(relativePath)) {
        return path.join(relativeTo, destination);
    }

    return relativePath;
};

export {};
