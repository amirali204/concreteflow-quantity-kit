# Security Policy

## Supported version and scope

The `0.1.0` pre-release candidate is currently the only maintained line. It is a standalone arithmetic library, **not industrial safety software**. No other ConcreteFlow product is covered by this policy.

## Confidential vulnerability reporting

This repository is public. As of **2026-11-16**, GitHub **Private Vulnerability Reporting has not been independently confirmed as enabled**.

If you see **Report a vulnerability** under [Security advisories](https://github.com/amirali204/concreteflow-quantity-kit/security/advisories), use that private GitHub form. The advisory page link alone **does not prove** that the private-reporting feature is enabled.

If that button is absent, **do not** publish vulnerability details, proofs of concept, credentials, or customer information in public issues. You may open a generic issue asking the maintainer to provide or enable a confidential reporting channel, without describing the vulnerability. No alternative confidential intake address is claimed here.

Maintainers should confirm an authorized confidential channel before soliciting sensitive details, reproduce reports only with isolated fictional fixtures, coordinate fixes and disclosure with the reporter, and update this policy after private reporting is verified. No response-time SLA is promised.

## Safe handling and design boundary

**Do not publicly disclose** credentials, private recipes, connection details, exploit payloads targeting real equipment, or personal records. Do not run this package against live equipment.

The library performs only deterministic decimal-string arithmetic. It does not authorize operations, control PLCs, authenticate users, persist data, contact servers, or validate dosing tolerances. Consumers must independently enforce engineering safety, calibration, and approvals.

Avoid adding network access, install hooks, runtime telemetry, third-party dependencies, or publish automation without separate review.
