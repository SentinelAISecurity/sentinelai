/** ESLint v9+ flat config for SentinelAI monorepo.
 * Uses typescript-eslint parser for TypeScript files (no strict rules). */
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/coverage/**", "**/build/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {},
  },
);
