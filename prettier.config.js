/** @type {import('prettier').Config & import("@ianvs/prettier-plugin-sort-imports").PluginConfig & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  tailwindFunctions: ["cn"],
  bracketSameLine: true,
  quoteProps: "consistent",
  importOrder: [
    "<BUILTIN_MODULES>",
    "",
    "<TYPES>",
    "^react$",
    "^next/(.*)$",
    "<THIRD_PARTY_MODULES>",
    "",
    "<TYPES>^~/(.*)$",
    "^~/(.*)$",
    "<TYPES>^[./]",
    "^[./]",
  ],
  importOrderTypeScriptVersion: "5.5.3",
};

export default config;
