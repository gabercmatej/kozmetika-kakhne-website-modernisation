import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    /* Netlify's build output. Git ignores it, but eslint has its own list —
       so running `netlify build` or `netlify dev` once left 198 bundled files
       on the lint path and turned a clean run into 220 errors. */
    ".netlify/**",
    "next-env.d.ts",
    "scripts/**",
  ]),
]);

export default eslintConfig;
