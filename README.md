# ConcreteFlow Quantity Kit

A small, independent, **MIT-licensed** JavaScript library for exact decimal-string calculations of illustrative material quantities. It is a standalone open-source extraction *inspired by general measurement requirements* of the private commercial ConcreteFlow project. Its implementation is authored separately, contains no commercial source files, and has no dependency on the ConcreteFlow server, database, user accounts, or factory devices.

**Project status:** independent pre-release 0.1.0 candidate (2026-11-16). No claim of production adoption, external users, release downloads, or industrial certification.

## Why this exists

JavaScript numbers use binary floating-point. A declared dose such as `0.2` multiplied by a batch volume `0.1` should give an exact string `0.02`, without floating-point artifacts. This module uses `BigInt` internally and keeps mass and volume units distinct.

## Quick start

Requires Node.js 20 or later; no runtime dependencies.

```js
import { calculateBatchQuantities } from "./src/index.mjs";

const calculation = calculateBatchQuantities({
  volumeM3: "7.25",
  materials: [
    { id: "illustrative-powder", ratePerM3: "320.5", unit: "kg/m3" },
    { id: "illustrative-liquid", ratePerM3: "182.125", unit: "L/m3" }
  ]
});

console.log(calculation.materials);
// [
//   { id: "illustrative-powder", ratePerM3: "320.5", unit: "kg/m3", total: "2323.625", totalUnit: "kg" },
//   { id: "illustrative-liquid", ratePerM3: "182.125", unit: "L/m3", total: "1320.40625", totalUnit: "L" }
// ]
```

All inputs in this example are **fictional**, not a certified concrete mix formula or a production recommendation.

## Contract and limitations

- Inputs must be decimal **strings**, with at most 12 integer and 6 fractional digits, strictly greater than zero. No scientific notation, localized separators, commas, signs, leading zeroes, or whitespace.
- Output is a normalized decimal **string**. Multiplication is exact (up to 12 fractional places); **no rounding**, tolerance, batching setpoint or material loss factor is implied.
- Volume is in `m3`. Rates are strictly `kg/m3` or `L/m3` and outputs are `kg` or `L` respectively. Mass and liquid volumes are never added or converted to one another.
- Material IDs are 1–64 ASCII characters (letters/digits followed by letters/digits, period, underscore, or hyphen), and must be unique ignoring ASCII case. One to 256 materials are accepted.
- Calculations are arithmetic only, returned with `status: "calculation_only_not_an_instruction"`. The package does **not** authenticate inputs, check engineering tolerances, validate mixes, approve recipes, control PLCs, or interface with any equipment.
- Host applications remain responsible for dosage rounding policy, calibrations, humidity, waste, legal compliance, equipment safety, quality control and operator approval.

## Verify locally

```bash
npm test
npm run audit:release
npm run check
node examples/basic.mjs
npm pack --dry-run --json
```

`npm pack --dry-run` **does not publish** to npm. This project has no installation hooks, secrets, network dependency, or remote API calls. The GitHub Actions workflow runs read-only Node tests and local release audit, without repository write permissions or deployment credentials.

## Contributing, vulnerability reports and roadmap

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md) and [CHANGELOG.md](CHANGELOG.md). Potential enhancements include additional exact-decimal operations, formal input schemas, and consumer compatibility tests; no feature is promised.

## Licensing and boundary

Copyright for newly authored code in **this independent package only** is offered under [MIT](LICENSE). This does **not** license, publish or grant rights to any other ConcreteFlow product code, design, private documentation, customer data, credentials or assets. The commercial repository is not a dependency and must never be copied into this project.

## Open-source program disclosure

This is a new package, not an established widely adopted project. OpenAI's Codex for Open Source program makes independent decisions using signals such as real usage, ecosystem impact and ongoing maintainer activity. A public repository alone is **not** a guarantee of eligibility or of ChatGPT Pro.

Documentation in Persian: [README.fa.md](README.fa.md).
