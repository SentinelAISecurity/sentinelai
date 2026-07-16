/** ESLint v9+ flat config for SentinelAI monorepo. */
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/coverage/**", "**/build/**"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [tseslint.configs.recommended],
    rules: {},
  },
);
