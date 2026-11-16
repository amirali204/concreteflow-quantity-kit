# Security Policy

## Supported version

The 0.1.0 pre-release candidate is the only maintained line at this time. It is not industrial safety software.

## Reporting

Before repository publication, please communicate potential vulnerabilities directly to the project owner via a private channel they approve. Once GitHub is set up, enable GitHub **Private Vulnerability Reporting** in the repository security settings and update this section with the actual reporting link.

**Do not publicly disclose credentials, private recipes, connection details, exploit payloads targeting real equipment, or personal records.** Do not run this package against live equipment.

## Design boundary

This pure library performs only deterministic string arithmetic. It does not authorize operations, control PLCs, authenticate users, persist data, contact a server, or claim dosing tolerances. Consumers must independently enforce engineering safety, calibration and approval processes.

Avoid adding network access, install hooks, runtime telemetry, or publish automation without dedicated review.
