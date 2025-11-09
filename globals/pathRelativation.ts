// Module imports
import path from "path";

declare global {
	/**
	 * Creates the relative path of a file or directory or joins the two paths if the relative path is empty
	 * @param destination The path of the file or directory
	 * @param relativeTo The path of the file or directory to be relative to
	 * @param switchParameters Whether to switch the parameters
	 * @returns The relative path of the file or directory
	 */
	function relativePath(destination: string, relativeTo?: string, switchParameters?: boolean): string;

	/**
	 * Creates the relative path of a file or directory or joins the two paths
	 * @param destination The path of the file or directory
	 * @param switchParameters Whether to switch the parameters
	 * @returns The relative path of the file or directory
	 */
	function relativePath(destination: string, switchParameters?: boolean): string;
}

global.relativePath = function (destination, x?, switchParameters: boolean = false) {
	/** Relative path overload parameter */
	const relativeTo = typeof x === "string" ? x : path.resolve();

	switchParameters = typeof x === "boolean" ? x : switchParameters;

	/** Relative path of the file or directory */
	const relativePath = switchParameters
		? path.relative(relativeTo, destination)
		: path.relative(destination, relativeTo);

	if (/^[\.\/\\]*$/.test(relativePath) && !/^[..[\/\\]*]*$/.test(destination)) {
		return path.join(relativeTo, destination);
	}

	return relativePath;
};

export {};
