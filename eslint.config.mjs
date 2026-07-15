/** ESLint v9+ flat config for SentinelAI monorepo. */
export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/coverage/**", "**/build/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {},
  },
];
