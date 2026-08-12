import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = new URL("../../", import.meta.url);
const EXTS = ["", ".ts", ".tsx", ".mjs", ".js", "/index.ts", "/index.tsx"];

function firstExisting(baseUrl) {
  for (const ext of EXTS) {
    const candidate = new URL(baseUrl.href + ext);
    if (existsSync(fileURLToPath(candidate))) return candidate.href;
  }
  return null;
}

/** Bundlers import JSON without an attribute; Node needs one supplied. */
const withJsonAttribute = (url, context) =>
  url.endsWith(".json")
    ? { ...context, importAttributes: { ...context.importAttributes, type: "json" } }
    : context;

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const found = firstExisting(new URL(specifier.slice(2), ROOT));
    if (found) {
      return { url: found, shortCircuit: true, importAttributes: withJsonAttribute(found, context).importAttributes };
    }
  }
  if (specifier.startsWith("./") || specifier.startsWith("../")) {
    const parent = context.parentURL ? new URL(context.parentURL) : ROOT;
    const found = firstExisting(new URL(specifier, parent));
    if (found) {
      return { url: found, shortCircuit: true, importAttributes: withJsonAttribute(found, context).importAttributes };
    }
  }
  return nextResolve(specifier, context);
}

export { pathToFileURL };
