// External libraries imports
import { join, relative, resolve } from "path";
import type { Path } from "typescript";

/**
 * Creates the relative path of a file or directory. If the relative path would only consist of dots and
 * (back)slashes, the two paths are joined.
 * @param destination - The path of given file or directory
 * @param relativeTo - The path of the file or directory to return the relative path to, defaults to the current working
 * directory.
 * @returns - The relative path of the file or directory.
 * @see {@linkcode Path}
 */
export function relativePath(destination: Path, relativeTo?: Path): Path;

/**
 * Creates the relative path of a file or directory compared to the current working directory. If the relative path
 * would only consist of dots and (back)slashes, the two paths are joined.
 * @param destination - The path of given file or directory.
 * @param switchParameters - Whether to switch the parameters.
 * @returns - The relative path of the file or directory.
 * @see {@linkcode Path}
 */
export function relativePath(destination: Path, switchParameters: boolean): Path;

/**
 * Creates the relative path of a file or directory. If the relative path would only consist of dots and
 * (back)slashes, the two paths are joined.
 * @param destination - The path of given file or directory.
 * @param relativeTo - The path of the file or directory to return the relative path to.
 * @param switchParameters - Whether to switch the parameters.
 * @returns - The relative path of the file or directory.
 * @see {@linkcode Path}
 */
export function relativePath(destination: Path, relativeTo: Path, switchParameters: boolean): Path;

export function relativePath(destination: Path, x?: Path | boolean, switchParameters: boolean = false) {
	/** Relative path overload parameter */
	const relativeTo = typeof x === "string" ? x : resolve();

	switchParameters = typeof x === "boolean" ? x : switchParameters;

	/**
	 * Relative path of the file or directory
	 * @see {@linkcode Path}
	 */
	const relativePath = switchParameters
		? (relative(relativeTo, destination) as Path)
		: (relative(destination, relativeTo) as Path);

	if (/^[\.\/\\]*$/.test(relativePath) && !/^[..[\/\\]*]*$/.test(destination)) {
		return join(relativeTo, destination) as Path;
	}

	return relativePath;
}
