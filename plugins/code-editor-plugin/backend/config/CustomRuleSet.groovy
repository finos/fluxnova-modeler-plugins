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
