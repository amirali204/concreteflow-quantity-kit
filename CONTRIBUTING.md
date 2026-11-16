# Contributing and maintenance

Thank you for considering an improvement to ConcreteFlow Quantity Kit. This is a small, independent, pre-release JavaScript package, not an industrial control or certified concrete-design system.

## Before opening an issue

- Search existing issues and describe one reproducible problem or proposal at a time.
- For bugs, provide the Node.js version, expected and actual **decimal-string** outputs, and a minimal **fictional** input.
- Do not include customer records, real plant recipes, credentials, production connection strings, proprietary assets, PLC access code, or source files from the commercial ConcreteFlow product.
- For suspected vulnerabilities, follow [SECURITY.md](SECURITY.md). Do **not** publish exploit details in an issue, discussion, or pull request.

## Pull requests

1. Discuss significant API or behavior changes in an issue before implementation.
2. Keep changes narrowly scoped; retain the dependency-free design and string inputs. Never silently convert `kg` to `L`, use binary floats for exact quantities, or infer engineering approval.
3. Add or update tests with Node's built-in test runner, including invalid inputs and unit boundaries.
4. Update user documentation and [CHANGELOG.md](CHANGELOG.md) when behavior changes. Keep fictional example data and the non-industrial safety disclaimer.
5. Run `npm run check` and `npm pack --dry-run --json`. In the PR description, state what changed, the tests run, limitations, and any security considerations.
6. Use only original or legally reusable contributions compatible with this repository's MIT license. Do not copy private ConcreteFlow assets or history.

GitHub Actions runs untrusted pull-request code with **read-only** repository permissions and without deployment or publication secrets. A green CI result is necessary but not sufficient for maintainer review.

## Maintainer triage

- Review reported defects for a minimal reproduction, exact arithmetic, unit safety, and affected supported Node versions.
- Prioritize security and unintended behavior before enhancements. Keep sensitive disclosures out of public issues.
- Ask for missing reproduction steps without inventing usage or claiming external adoption.
- Review patches for tests, documentation, release allowlist changes, license compatibility, and isolation from the commercial product.
- Close or defer issues with a written rationale. Response and release timelines are **not guaranteed**.

## Releases and compatibility

- The only documented candidate is `0.1.0`. No npm publication or adoption is claimed.
- A future release requires an explicit maintainer decision, passing CI, the `npm run audit:release` allowlist, a reviewed package tarball preview, and a changelog entry.
- Treat exported API, validation behavior, and unit semantics as compatibility contracts; document breaking changes and select a suitable version.
- Never turn on automatic publishing, install scripts, network access, analytics, or equipment integration without a separate security review.
