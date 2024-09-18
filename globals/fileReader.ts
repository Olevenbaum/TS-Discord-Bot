// Global imports
import "./notifications";
import "./pathRelativation";

// Module imports
import fs from "fs";
import path from "path";

// Type imports
import { Configuration } from "../types/configuration";

declare global {
    /**
     * Reads all JavaScript and TypeScript files of a given directory
     * @param configuration The configuration of the project and bot
     * @param directory The path to read the files from
     * @returns The default export of each file if existing of every TypeScript
     * and JavaScript file
     */
    function readFiles<FileType>(configuration: Configuration, directory: string): Promise<FileType[]>;
}

global.readFiles = async function <FileType>(configuration: Configuration, directory: string): Promise<FileType[]> {
    /**
     * Relative path to directory
     */
    const newPath = relativePath(directory);

    // Try to read files in directory
    try {
        // Return all imported relevant files in the directory
        return (
            await Promise.all(
                fs
                    .readdirSync(newPath)
                    .filter(
                        (fileName) =>
                            (path.extname(fileName) === ".ts" &&
                                path.extname(path.basename(fileName, ".ts")) !== ".d") ||
                            path.extname(fileName) === ".js"
                    )
                    .map((fileName) =>
                        path.extname(fileName) === ".ts"
                            ? path.basename(fileName, ".ts")
                            : path.basename(fileName, ".js")
                    )
                    .map(
                        async (moduleName) =>
                            (
                                await import(path.join(newPath, moduleName))
                            ).default as FileType | undefined
                    )
            )
        ).filter((module) => typeof module !== "undefined");
    } catch (error) {
        // Check if directory was found
        if (error instanceof Error && "code" in error && error.code === "ENOENT") {
            // Notification
            notify(configuration, "warning", `Found no directory at ${path.relative(newPath, path.resolve())}`);

            // Return empty array
            return [];
        }

        // Forward error
        throw error;
    }
};

export {};
