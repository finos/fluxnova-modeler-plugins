# Code Editor Plugin

![Plugin Type](https://img.shields.io/badge/Plugin_Type-React_Plugin-orange.svg) ![Plugin Type](https://img.shields.io/badge/Plugin_Type-BPMN_Plugin-orange.svg)

This plugin targets any inline script for any element that can accept inline tasks (script tasks, inputs, outputs, connectors, etc.) and launches a powerful code editor experience in the modeler.

It offers:

- Syntax Highlighting (JavaScript & Groovy)
- Linting for JavaScript (ESLint) & Groovy (CodeNarc)
- Auto-completion & Intellisense for JavaScript (via Monaco Editor)

## Demo

![Code Editor Plugin Demo](demo.gif)

## Development Setup

1. Clone this repo
2. Install all dependencies `npm install`
3. Build the plugin `npm run build` (or `npm run dev` to build on file changes)
4. Copy the `dist` folder contents to Modeler plugins folder (/path-to-modeler/resources/plugins/code-editor-plugin)

**Note**: For the first time, you will need to create the resources/plugins folders manually:\
`mkdir -p /path-to-modeler/resources/plugins`

You can use `./build.sh` to automate the above steps.
You will need to provide permissions to whatever app/IDE you're using to run those scripts (System Settings -> Privacy & Security -> App Management)

**Note**: `./build.sh` script creates a symlink from the plugin to the modeler, so it only needs to be run once.

## How to run test cases

1. run  `npm run test` command for headless (used on pipeline) | or `npm run test:auto` to run tests automatically on any code change | or `npm test:auto-silent` to run automatically (Preventing console messages from being printed)
2. check console or results in folder `coverage`

## ESLint Configuration

The plugin uses ESLint for JavaScript linting. Configure rules by editing the `eslint.config.js` file in the plugin's `backend/config/` folder.

**Config Location:** `path-to-modeler/resources/plugins/code-editor-plugin/backend/config/eslint.config.js`

### Config Structure

The config file exports an object with the following properties:

```javascript
module.exports = {
  files: [ '**/*.js' ],
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'script'
  },
  rules: {
    'no-console': 'warn',
    'custom/my-rule': 'error'
  },
  customRules: {
    'my-rule': { /* rule definition */ }
  }
};
```

### Adding/Removing Standard Rules

```javascript
rules: {
  'no-console': 'warn',        // warn on console usage
  'no-var': 'off',             // turn off no-var rule (or remove the line)
  'semi': ['error', 'always'], // require semicolons
}
```

### Creating Custom Rules

1. Define your custom rule in `customRules` following the ESLint custom rule format:

```javascript
customRules: {
  'todo-comment': {
    meta: {
      type: 'suggestion',
      docs: { description: 'Warn about TODO comments in code' },
      messages: { foundTodo: 'TODO comment found: consider creating a task' },
      schema: []
    },
    create(context) {
      return {
        Program() {
          const comments = context.getSourceCode().getAllComments();
          comments.forEach(comment => {
            if (/TODO/i.test(comment.value)) {
              context.report({ node: comment, messageId: 'foundTodo' });
            }
          });
        }
      };
    }
  }
}
```

1. Enable it in `rules` with the `custom/` prefix:

```javascript
rules: {
  'custom/todo-comment': 'warn'
}
```

### Advanced Example: Banning Specific Functions

This example shows a configurable rule that bans specific function calls:

```javascript
customRules: {
  'no-banned-functions': {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow specific function calls' },
      messages: { banned: 'Function "{{name}}" is not allowed' },
      schema: [{ type: 'array', items: { type: 'string' } }]
    },
    create(context) {
      const bannedFunctions = context.options[0] || [];
      return {
        CallExpression(node) {
          const name = node.callee.name || node.callee.property?.name;
          if (bannedFunctions.includes(name)) {
            context.report({ node, messageId: 'banned', data: { name } });
          }
        }
      };
    }
  }
},
rules: {
  'custom/no-banned-functions': [ 'error', [ 'eval', 'setTimeout', 'setInterval' ] ]
}
```

**Note:** The Modeler is reading this config file on each linting request, so changes will take effect immediately without needing to restart the Modeler (May need to close and reopen Code Editor).

## npm-groovy-lint Configuration

The plugin uses `npm-groovy-lint` for Groovy linting and translates its configuration to CodeNarc.

### Key behavior

- The `rulesets` key takes higher precedence; when it is provided, other config entries do not apply.
- The `rulesets` key can take multiple files separated by commas.
- In this implementation, **you must provide absolute paths to `.groovy` ruleset files**.

### Custom rules

To implement custom rules, follow CodeNarc's structure for creating rules and rulesets:

- <https://codenarc.org/codenarc-creating-rule.html>
- <https://codenarc.org/codenarc-creating-ruleset.html>

In this implementation, **the custom rule and the ruleset must be defined in the same `.groovy` file**.
Example:

```groovy
import org.codenarc.rule.AbstractRule
import org.codenarc.source.SourceCode

/**
 * Custom rule: MyStaticFieldRule
 * - Flags any static field declarations in classes.
 */
class MyStaticFieldRule extends AbstractRule {
    String name = 'MyStaticField'
    int priority = 2

    void applyTo(SourceCode sourceCode, List violations) {
        sourceCode.ast.classes.each { clazz ->
            clazz.fields.each { fieldNode ->
                if (fieldNode.static) {
                    violations << createViolation(sourceCode, fieldNode, "The field ${fieldNode.name} is static")
                }
            }
        }
    }
}

ruleset {
    description 'Custom ruleset including a MyStaticField custom rule and the standard basic ruleset'
    rule(MyStaticFieldRule)

    ruleset('rulesets/basic.xml')
}
```

### Config format

For the config format & inline rule disable comments, refer to the library documentation:

- <https://github.com/nvuillam/npm-groovy-lint>

**Note:** The Modeler is reading this config file on each linting request, so changes will take effect immediately without needing to restart the Modeler (May need to close and reopen Code Editor).

## Resources

- [Camunda Modeler plugins documentation](https://docs.camunda.io/docs/components/modeler/desktop-modeler/plugins/)
- [ESLint Rules Reference](https://eslint.org/docs/latest/rules/)
- [ESLint Custom Rule Tutorial](https://eslint.org/docs/latest/extend/custom-rule-tutorial)
- [npm-groovy-lint README](https://github.com/nvuillam/npm-groovy-lint)
- [CodeNarc Custom Rule Creation](https://codenarc.org/codenarc-creating-rule.html)
- [CodeNarc Custom RuleSet Creation](https://codenarc.org/codenarc-creating-ruleset.html)
