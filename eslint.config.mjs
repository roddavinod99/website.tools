import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import noNestedCard from "./eslint-rules/no-nested-card-elements.cjs";
import noHardcodedColors from "./eslint-rules/no-hardcoded-colors.cjs";
import noRoundedLg from "./eslint-rules/no-rounded-lg-in-content.cjs";

const localPlugin = {
  name: "local",
  rules: {
    "no-nested-card-elements": noNestedCard,
    "no-hardcoded-colors": noHardcodedColors,
    "no-rounded-lg-in-content": noRoundedLg
  }
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { local: localPlugin },
    rules: {
      "local/no-nested-card-elements": "error",
      "local/no-hardcoded-colors": "warn",
      "local/no-rounded-lg-in-content": "error"
    }
  },
  {
    files: ["eslint-rules/**", "eslint.config.mjs"],
    rules: {
      "local/no-hardcoded-colors": "off",
      "local/no-rounded-lg-in-content": "off"
    }
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "_reference/**",
    // Auto-generated test artifacts:
    "playwright-report/**",
    "test-results/**",
    // WASM generated types:
    "wasm/pkg/**",
    "src/lib/wasm/pkg/**",
    // Agent/skills and docs (not part of app lint)
    ".agents/**",
    ".claude/**",
    "docs/**",
  ]),
]);

export default eslintConfig;
