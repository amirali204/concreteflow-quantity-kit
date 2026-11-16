# Contributing

Thank you for considering an improvement to ConcreteFlow Quantity Kit.

- Open an issue describing the reproducible arithmetic or validation problem before proposing a significant API change.
- Write tests with Node's built-in test runner. Keep implementation dependency-free and decimal inputs as strings; never silently convert `kg` to `L`.
- Document every behavioral change and preserve the explicit non-industrial safety boundary.
- Do not include customer records, real plant recipes, credentials, production connection strings, proprietary assets, PLC access code, or source files from the commercial ConcreteFlow product.
- Run `npm run check` before a pull request.
- All contributions must be original or legally reusable under the MIT license in this repository.

GitHub Actions runs untrusted pull-request changes with **read-only** repository permissions and no deployment or publication secrets. Maintainers should review contributions before merging.
