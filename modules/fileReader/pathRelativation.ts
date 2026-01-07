// External libraries imports
import { join, relative, resolve } from "path";

/**
 * Creates the relative path of a file or directory. If the relative path would only consist of dots and
 * (back)slashes, the two paths are joined.
 * @param destination - The path of given file or directory
 * @param relativeTo - The path of the file or directory to return the relative path to, defaults to the current working
 * directory.
 * @returns The relative path of the file or directory
 */
export default function relativePath(destination: string, relativeTo?: string): string;

/**
 * Creates the relative path of a file or directory compared to the current working directory. If the relative path
 * would only consist of dots and (back)slashes, the two paths are joined.
 * @param destination - The path of given file or directory
 * @param switchParameters - Whether to switch the parameters
 * @returns The relative path of the file or directory
 */
export default function relativePath(destination: string, switchParameters: boolean): string;

/**
 * Creates the relative path of a file or directory. If the relative path would only consist of dots and
 * (back)slashes, the two paths are joined.
 * @param destination - The path of given file or directory
 * @param relativeTo - The path of the file or directory to return the relative path to
 * @param switchParameters - Whether to switch the parameters
 * @returns The relative path of the file or directory
 */
export default function relativePath(destination: string, relativeTo: string, switchParameters: boolean): string;

export default function relativePath(destination: string, x?: string | boolean, switchParameters: boolean = false) {
	/** Relative path overload parameter */
	const relativeTo = typeof x === "string" ? x : resolve();

	switchParameters = typeof x === "boolean" ? x : switchParameters;

	/** Relative path of the file or directory */
	const relativePath = switchParameters ? relative(relativeTo, destination) : relative(destination, relativeTo);

	if (/^[\.\/\\]*$/.test(relativePath) && !/^[..[\/\\]*]*$/.test(destination)) {
		return join(relativeTo, destination);
	}

	return relativePath;
}
