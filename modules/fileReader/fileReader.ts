// Class & type imports
import type { Task } from "../../types";

// Internal module imports
import relativePath from "./pathRelativation";

// External libraries imports
import { readdirSync } from "fs";
import { basename, extname, join } from "path";

// Module imports
import notify from "../notification";

/**
 * Asynchronously reads all TypeScript and JavaScript files from one or multiple directories and returns their default
 * exports if existing. Files are read in parallel for better performance. To load the files, {@link relativePath} is
 * used to build the relative path between the working directory and each desired directories.
 * @param directories - One or more paths of directories to read files from
 * @returns The default export of each TypeScript and JavaScript file if existing
 */
export default async function readFiles<FileType>(directories: string | string[]): Promise<FileType[]>;

export default async function readFiles<FileType>(directories: string | string[]) {
	if (!Array.isArray(directories)) {
		directories = [directories];
	}

	/** Array of tasks, that return promises upon execution */
	const tasks: Task<FileType | undefined>[] = [];

	for (const directory of directories) {
		/** Relative path between the current working directory and the directory of the files */
		const newPath = relativePath(directory);

		try {
			tasks.push(
				...readdirSync(newPath)
					.filter(
						(fileName) =>
							(extname(fileName) === ".ts" && extname(basename(fileName, ".ts")) !== ".d") ||
							extname(fileName) === ".js",
					)
					.map((fileName) =>
						extname(fileName) === ".ts" ? basename(fileName, ".ts") : basename(fileName, ".js"),
					)
					.map(
						(moduleName) => async () =>
							(await import(join(newPath, moduleName))).default as FileType | undefined,
					),
			);
		} catch (error) {
			/** Error raised by the file system */
			const errno = error as NodeJS.ErrnoException;

			if (errno && errno.code === "ENOENT") {
				notify(
					`Found no directory at ${errno.path ? relativePath(errno.path, true) : "unknown path"}`,
					"WARNING",
				);
			} else {
				throw error;
			}
		}
	}

	return (await Promise.all(tasks.map((task) => task()))).filter((module) => typeof module !== "undefined");
}
