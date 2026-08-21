## What is JSON Schema?

JSON Schema is a vocabulary that describes and validates the structure of JSON documents. It lets you declare which fields are required, what types they must have, and constraints like minimum/maximum length, allowed values, or regex patterns — all in a JSON document itself. Schemas power API request validation, form generation, config-file checks, and code generation, and they give teams a machine-readable contract that replaces scattered manual validation logic. A schema is both documentation and an executable test.

## Core Concepts

A schema is a JSON document with a `type` keyword and nested rules: `string`, `number`, `integer`, `boolean`, `object`, `array`, or `null`. Objects declare `properties` and `required`; arrays declare `items` and `minItems`/`maxItems`; strings use `minLength`, `maxLength`, `pattern`, and `format` (like `email` or `date-time`); numbers use `minimum`/`maximum`. The `$ref` keyword lets you reuse definitions, and `additionalProperties` controls whether unexpected keys are allowed. Versioned draft keywords (draft-04 through 2020-12) refine these rules, so matching the draft your validator supports matters.

## Practical Workflow

Start from a sample JSON document and generate a schema from it, then tighten the rules by hand — marking required fields, adding constraints, and defining reusable sub-schemas. Use the schema to validate API payloads in tests, to power form builders, or to check configuration files before they are consumed. Our JSON Schema generator infers a draft-07 schema from a JSON sample, and our JSON validator checks any JSON document against the rules you write — both entirely in your browser.

## Common Mistakes

The most common schema mistakes are forgetting that object properties are optional by default (you must list them in `required`), using `additionalProperties: false` too aggressively and rejecting valid extensions, and mismatching the JSON Schema draft version between authoring and validation. Test schemas with both valid and invalid samples, keep definitions reusable instead of duplicated, and validate schemas themselves before deploying them — a malformed schema is a silent source of broken requests.