// Module imports
import path from "path";

declare global {
    /**
     * Returns the path of a file or directory relative to another file or directory.
     *
     * @param destination The path of the file or directory
     * @param relativeTo The path of the file or directory to be relative to
     * @returns The relative path of the file or directory
     */
    function relativePath(destination: string, relativeTo?: string): string;
}

global.relativePath = function (
    destination: string,
    relativeTo: string = path.resolve()
): string {
    const relativePath = path.relative(destination, relativeTo);
    if (/[\.\/\\]*/.test(relativePath)) {
        return path.join(relativeTo, destination);
    }
    return relativePath;
};

export {};
