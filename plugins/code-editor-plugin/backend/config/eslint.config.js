module.exports = {
  files: [ '**/*.js' ],
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'script',
    globals: {
      execution: 'readonly'
    }
  },
  rules: {
    'no-unused-vars': 'warn',
    'custom/todo-comment': 'warn',
  },
  customRules: {
    'todo-comment': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Warn about TODO comments in code',
          category: 'Best Practices',
        },
        messages: {
          foundTodo: 'TODO comment found: consider creating a task',
        },
        schema: [],
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
          },
        };
      },
    }
  },
};