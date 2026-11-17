# Roadmap — ConcreteFlow Quantity Kit

**Status:** public, independent open-source pre-release candidate `0.1.0`.

**Last reviewed:** 2026-11-17.

**Scope:** this MIT-licensed JavaScript decimal-string quantity library **only**, not the private ConcreteFlow ERP.

This roadmap describes priorities, not delivery promises. Items are advanced only when actual code, tests and documentation land in GitHub. Dates, external users, adoption, releases and production readiness are **not** implied. Priorities may change following security review and real contributor feedback.

## Available today — independently verified baseline

- [x] Exact decimal-string batch volume × declared material rate using `BigInt`.
- [x] Separate `kg/m3 → kg` and `L/m3 → L` calculations without silent conversion or rounding.
- [x] Strict input validation, declared error/operation boundaries, and 16 Node.js automated tests.
- [x] Read-only GitHub Actions checks on Node.js 20, 22 and 24; release-file allowlist.
- [x] MIT license, Persian and English README files, contribution and security-policy documentation.

The checklist describes existing source and checks, **not** an npm publication or certification.

## Near term — documentation and assurance (planned)

- [ ] Add a compact, reproducible table of input/output edge cases, exact units and limitations in the public docs.
- [ ] Add explicit regression cases for boundary values and invalid input combinations without changing existing behavior.
- [ ] Review the public CI, branch rules, dependency/security settings and private vulnerability reporting; document only verified configuration.
- [ ] Keep change records, reviewed pull requests and reproducible CI evidence for **actual** modifications.

**Exit criteria:** documented behavior, passing Node 20/22/24 checks and no widening of the public file/security boundary without review.

## Next — consumer ergonomics (proposed, not committed)

- [ ] Evaluate a small, versioned error-code reference and TypeScript consumer examples.
- [ ] Assess consumer-facing compatibility tests in an isolated public fixture; retain dependency-free behavior unless justified.
- [ ] Consider additional exact-decimal operations **only** with precise requirements, independently reviewed semantics, and tests.
- [ ] Document compatibility and versioning rules before proposing a stable release.

**Exit criteria:** scoped issues, accepted design, complete tests, public release audit and maintainer review. None of these items authorizes a release by itself.

## Later — community-driven (ideas only)

- [ ] Triage reproducible issues and independent contributions when they actually arrive.
- [ ] Consider an npm release only after a separate package/security audit and explicit maintainer decision.
- [ ] Revisit priorities using real evidence of usefulness rather than assumed users, downloads or stars.

## Explicitly out of scope

- Commercial ERP backend, customer data, private recipes, plant configuration, authorization, licenses and internal roadmaps.
- PLC/equipment control, batch setpoints, engineering tolerance or concrete quality certification.
- Claims of adoption, guaranteed release dates or automatic publication to npm.

## How progress is recorded

Use focused GitHub Issues and Pull Requests to record motivations, reviewed changes, checks and limitations. A checked item requires a linked, verified implementation or documentation change; do not mark it complete merely because a roadmap says so. For proposed enhancements, open an issue before promising a version or date.

**Reference:** [README](README.md) · [Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) · [Changelog](CHANGELOG.md)
