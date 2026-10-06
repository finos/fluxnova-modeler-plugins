# Installing Fluxnova Modeler Plugins

This guide explains how to manually install a Fluxnova Modeler plugin and verify that it loads successfully.

Before following the platform-specific installation steps, make sure you have a plugin build ready. See the Plugin Build Sources section for CI artifacts, releases, and local build options.

## Overview

Fluxnova Modeler discovers plugins by scanning the `resources/plugins` directory when the application starts.

Each plugin must:

- Reside in its own folder under `resources/plugins`
- Contain an `index.js` entry point
- Be copied into the plugin directory before the Modeler is launched

Expected directory structure:

```text
resources/
└── plugins/
    └── my-plugin/
        ├── index.js
        ├── package.json
        └── ...
```

Example `index.js` entry point:

```js
"use strict";

module.exports = {
  script: "./dist/client.js",
  style: "./dist/style.css",
  menu: "./dist/backend/main.js",
  name: "Code Editor Plugin",
};
```

In this example, `script` loads frontend behavior, `style` loads plugin CSS, `menu` loads backend/menu integration, and `name` is the display name.

## Prerequisites

Before installing a plugin:

- Have a plugin build ready.
- Verify the plugin folder contains an `index.js` file.
- Close any running instance of Fluxnova Modeler.

## Plugin Build Sources

You can obtain plugin builds from CI artifacts, GitHub Releases, or by building locally when CI coverage is unavailable.

Prebuilt plugin builds are published in two places:

- Development builds are available as artifacts from individual [CI workflow runs](https://github.com/finos/fluxnova-modeler-plugins/actions/workflows/ci.yml)
- Released builds are available in [GitHub Releases](https://github.com/finos/fluxnova-modeler-plugins/releases)

Use CI run artifacts for short-lived validation and testing, and use GitHub Releases for stable installation targets and long-term retrieval.

Note: CI artifacts are ephemeral and may expire based on repository retention settings.

If [CI does not support automated builds](https://github.com/finos/fluxnova-modeler-plugins/issues/17) for the plugin you need, build it locally from source.

Example local build flow for `code-editor-plugin`:

```sh
git clone https://github.com/finos/fluxnova-modeler-plugins.git
cd fluxnova-modeler-plugins/plugins/code-editor-plugin
npm install
npm run build
```

After building, plugin output is available in the `dist` directory. To install manually, create a `code-editor-plugin` folder in the Modeler plugins directory and copy:

- `code-editor-plugin/dist`
- `code-editor-plugin/index.js`

Expected structure in the Modeler installation:

```text
resources/
└── plugins/
    └── code-editor-plugin/
        ├── index.js
        └── dist/
```

---

## Installation Paths

Use the plugin directory that matches your Fluxnova Modeler installation:

- macOS: `/Applications/Fluxnova Modeler.app/Contents/MacOS/resources/plugins`
- Windows: `C:\Program Files\Fluxnova Modeler\resources\plugins`

## Install the Plugin

### Step 1: Locate the Plugins Directory

Find the appropriate `resources/plugins` directory for your platform.

### Step 2: Create the Plugins Directory

If the `plugins` directory does not already exist, create it under `resources`.

Expected layout:

```text
resources/
└── plugins/
```

### Step 3: Copy the Plugin

Copy the plugin into the `plugins` directory so that `index.js` is a direct child of the plugin folder.

Example:

```text
resources/
└── plugins/
    └── my-plugin/
        └── index.js
```

### Step 4: Restart Fluxnova Modeler

Close and reopen the application.

---

## Verifying Installation

After restarting Fluxnova Modeler, verify the plugin was loaded successfully.

### Verify Expected Functionality

Depending on the plugin, you may observe:

- Additional menu items
- New toolbar buttons
- BPMN palette extensions
- Custom property panels
- Validation or linting enhancements
- Other UI components

### Verify the Plugin Directory

Confirm the plugin exists directly beneath the `plugins` folder:

```text
resources/
└── plugins/
    └── my-plugin/
        └── index.js
```

Correct:

```text
plugins/
└── my-plugin/
    └── index.js
```

Incorrect:

```text
plugins/
└── my-plugin-main/
    └── my-plugin/
        └── index.js
```

The folder containing `index.js` must be a direct child of `plugins`.

---

## Troubleshooting

### Plugin Does Not Appear

Verify that:

- The plugin folder was copied into `resources/plugins`.
- The plugin contains an `index.js` file.
- The plugin directory structure is correct.
- Fluxnova Modeler was restarted after installation.

### Plugin Causes Startup Errors

If the application fails to start after installing a plugin:

1. Remove the plugin folder from `resources/plugins`.
2. Restart Fluxnova Modeler.
3. Verify the application starts normally.
4. Review plugin logs or console output for errors.

---

## Example Final Structure

```text
Fluxnova Modeler/
└── resources/
    └── plugins/
        ├── plugin-a/
        │   └── index.js
        └── plugin-b/
            └── index.js
```

On startup, Fluxnova Modeler scans the `resources/plugins` directory and loads all valid plugins that contain an `index.js` entry point.