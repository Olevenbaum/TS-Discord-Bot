// Global imports
import "./notifications";
import "./pathRelativation";

// Module imports
import fs from "fs";
import path from "path";

// Type imports
import { Task } from "../types/others";

declare global {
	/**
	 * Reads all JavaScript and TypeScript files of a given directory
	 * @param directories One or more paths of directories to read files from
	 * @returns The default export of each file if existing of every TypeScript and JavaScript file
	 * @see {@link FileType}
	 */
	function readFiles<FileType>(directories: string | string[]): Promise<FileType[]>;
}

global.readFiles = async function <FileType>(directories: string | string[]) {
	if (!Array.isArray(directories)) {
		directories = [directories];
	}

	/** Array of tasks, that return promises if executed */
	const tasks: Task<FileType | undefined>[] = [];

	for (const directory of directories) {
		/** Relative path to directory */
		const newPath = relativePath(directory);

		try {
			tasks.push(
				...fs
					.readdirSync(newPath)
					.filter(
						(fileName) =>
							(path.extname(fileName) === ".ts" &&
								path.extname(path.basename(fileName, ".ts")) !== ".d") ||
							path.extname(fileName) === ".js",
					)
					.map((fileName) =>
						path.extname(fileName) === ".ts"
							? path.basename(fileName, ".ts")
							: path.basename(fileName, ".js"),
					)
					.map(
						(moduleName) => async () =>
							(await import(path.join(newPath, moduleName))).default as FileType | undefined,
					),
			);
		} catch (error) {
			/** Error raised by the file system */
			const errno = error as NodeJS.ErrnoException;

			if (errno && errno.code === "ENOENT") {
				notify(
					"WARNING",
					`Found no directory at ${errno.path ? relativePath(errno.path, true) : "unknown path"}`,
				);
			} else {
				throw error;
			}
		}
	}

	return (await Promise.all(tasks.map((task) => task()))).filter((module) => typeof module !== "undefined");
};

export {};
