export default [
  {
    ignores: [".next/**", "dist/**", "node_modules/**", "storybook-static/**", "public/**"],
  },
  {
    files: ["packages/tooling/scripts/**/*.mjs", "packages/tooling/tests/**/*.mjs", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        Buffer: "readonly",
        console: "readonly",
        process: "readonly",
        URL: "readonly",
      },
    },
    rules: {
      "no-constant-binary-expression": "error",
      "no-debugger": "error",
      "no-dupe-keys": "error",
      "no-duplicate-imports": "error",
      "no-fallthrough": "error",
      "no-unreachable": "error",
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "caughtErrorsIgnorePattern": "^_" }],
    },
  },
];
