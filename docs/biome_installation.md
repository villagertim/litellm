# Technical Reference Note: Biome Installation & Remediation

This reference note documents the local installation of `@biomejs/biome` inside the `ui/litellm-dashboard` directory and the subsequent configuration adjustments required to achieve an operational environment.

## 1. Context & Rationale
Biome (an ultra-fast, Rust-based linter and formatter) was introduced to the React/Next.js/TypeScript dashboard project (`ui/litellm-dashboard`) to replace/supplement ESLint and Prettier. It was installed locally as a `devDependency` to ensure consistency across developer workspaces, IDEs, and CI/CD pipelines.

---

## 2. Configuration Issues & Remediation Actions

During the initial execution of `npm run biome:check`, several errors were encountered and resolved:

### A. Deprecated Formatting Properties (`indentSize` vs. `indentWidth`)
* **Problem**: The Biome CLI threw a deprecation warning:
  > *`! The property indentSize is deprecated. Use formatter.indentWidth instead.`*
* **Remediation**: Updated `biome.json` under `formatter` to replace `indentSize: 2` with `indentWidth: 2`.

### B. Invalid Schema Layout (`linter.recommended`)
* **Problem**: The linter failed to start due to a layout format error:
  > *`× Found an unknown key 'recommended'. Known keys: enabled, rules, ignore, include`*
* **Remediation**: Moved `"recommended": true` from the root of `"linter"` to inside the nested `"rules"` block.

### C. Large-scale Codebase Impact & Diagnostic Errors
* **Behavior**: Biome successfully scanned **1,172 files in 8 seconds**, automatically formatting and organizing imports on **1,097 files**.
* **Remediation**: The check exited with code `1` due to pre-existing TypeScript/React syntax issues that cannot be safely auto-fixed (e.g., usage of explicit `any` types and `delete` operators on test mocks). These diagnostics are now fully visible and can be addressed via manual refactoring.

---

## 3. Added Scripts in `package.json`

The following scripts were appended to the `scripts` section of `ui/litellm-dashboard/package.json` to ease daily usage:

* **`npm run biome:format`**: Runs Biome's formatter and safely formats all JS/TS/JSX/TSX files in-place.
  ```bash
  biome format --write .
  ```
* **`npm run biome:lint`**: Runs the linter to verify code structure and style guidelines.
  ```bash
  biome lint --write .
  ```
* **`npm run biome:check`**: Combines formatting, import organization, and linting in one fast check.
  ```bash
  biome check --write .
  ```

---

## 4. Current Configuration (`biome.json`)
The fully remediated and functional configuration located at `ui/litellm-dashboard/biome.json` is:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.8.3/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "warn"
      },
      "style": {
        "noNonNullAssertion": "off"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "trailingCommas": "all"
    }
  },
  "files": {
    "ignore": [
      ".next",
      "node_modules",
      "out",
      "dist",
      "build",
      "coverage"
    ]
  }
}
```
