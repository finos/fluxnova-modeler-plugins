[![FINOS - Incubating](https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-incubating.svg)](https://community.finos.org/docs/governance/lifecycle-stages/incubating)

# Fluxnova Modeler Plugins

This repository contains installable plugins, plugin source code, and supporting resources for extending Fluxnova Modeler.

## Installing Plugins

The complete install guide lives in [docs/installing-plugins.md](docs/installing-plugins.md).

Use that guide for:

- Platform-specific installation steps for macOS, Windows, and Linux
- CI artifact and release download guidance
- Local build instructions for plugins that are not produced by CI
- Verification and troubleshooting steps

Quick path for local testing of `code-editor-plugin`:

```sh
cd plugins/code-editor-plugin
npm install
npm run build
```

Then copy the built plugin folder contents into the appropriate `resources/plugins` directory for your Fluxnova Modeler installation.

## Development setup

Install dependencies and build the plugin you want to work on.

```sh
cd plugins/code-editor-plugin
npm install
npm run build
```

Run tests from the relevant plugin directory as needed.

## Contributing

For any questions, bugs or feature requests please open an [issue](https://github.com/finos/fluxnova-modeler-plugins/issues)
For anything else please send an email to {project mailing list}.

To submit a contribution:

1. Fork it (<https://github.com/finos/fluxnova-modeler-plugins/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Read our [contribution guidelines](CONTRIBUTING.md) and [Community Code of Conduct](https://www.finos.org/code-of-conduct)
4. Commit your changes (`git commit -am 'Add some fooBar'`)
5. Push to the branch (`git push origin feature/fooBar`)
6. Create a new Pull Request

*Questions about CLA, DCO, or EasyCLA? Email [help@finos.org](mailto:help@finos.org)*

## License

Copyright 2026 FINOS

Distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).

SPDX-License-Identifier: [Apache-2.0](https://spdx.org/licenses/Apache-2.0)
