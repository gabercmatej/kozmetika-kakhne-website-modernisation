/**
 * Lets plain `node` run the app's lib modules directly, so pure logic
 * (filters, routine building, formatting) can be exercised from the command
 * line without a browser. Resolves the "@/" alias and extensionless imports
 * the same way the bundler does.
 *
 * Usage: node --import ./scripts/lib/ts-loader.mjs some-check.mjs
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./ts-loader-hooks.mjs", import.meta.url);
export const ROOT = pathToFileURL(new URL("../../", import.meta.url).pathname).href;
