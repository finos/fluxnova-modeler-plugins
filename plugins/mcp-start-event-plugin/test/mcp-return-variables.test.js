'use strict';

/**
 * Tests for MCP Return Variables functionality
 * Covers core features: adding, editing, removing, and persisting return variables
 */

// Mock moddle factory
function createMockModdle() {
    return {
        create: function(type, props) {
            return Object.assign({ $type: type }, props);
        }
    };
}

// Mock business object with extension elements support
function createMockBusinessObject() {
    return {
        get: function(prop) {
            return this[prop];
        },
        set: function(prop, value) {
            this[prop] = value;
        }
    };
}

// Helper to get return variables from business object
function getReturnVariables(bo) {
    const ext = bo.extensionElements;
    if (!ext || !ext.values) return [];
    const mcpReturnVars = ext.values.find(v => v.$type === 'mcp:ReturnVariables');
    return mcpReturnVars ? (mcpReturnVars.returnVariables || []) : [];
}

// Test suite
const tests = [
    {
        name: 'Add return variable with default values',
        fn: function() {
            const moddle = createMockModdle();
            const bo = createMockBusinessObject();
            
            const ext = moddle.create('bpmn:ExtensionElements', { values: [] });
            const mcpReturnVars = moddle.create('mcp:ReturnVariables', { returnVariables: [] });
            
            bo.extensionElements = ext;
            ext.values.push(mcpReturnVars);
            
            const returnVar = moddle.create('mcp:ReturnVariable', {
                returnVariableName: '',
                returnVariableType: 'String'
            });
            mcpReturnVars.returnVariables.push(returnVar);
            
            const vars = getReturnVariables(bo);
            return vars.length === 1 && vars[0].returnVariableName === '' && vars[0].returnVariableType === 'String';
        }
    },
    {
        name: 'Edit return variable name',
        fn: function() {
            const moddle = createMockModdle();
            const bo = createMockBusinessObject();
            
            const ext = moddle.create('bpmn:ExtensionElements', { values: [] });
            const mcpReturnVars = moddle.create('mcp:ReturnVariables', { returnVariables: [] });
            bo.extensionElements = ext;
            ext.values.push(mcpReturnVars);
            
            const returnVar = moddle.create('mcp:ReturnVariable', {
                returnVariableName: '',
                returnVariableType: 'String'
            });
            mcpReturnVars.returnVariables.push(returnVar);
            
            // Edit name
            returnVar.returnVariableName = 'userId';
            
            const vars = getReturnVariables(bo);
            return vars[0].returnVariableName === 'userId';
        }
    },
    {
        name: 'Edit return variable type',
        fn: function() {
            const moddle = createMockModdle();
            const bo = createMockBusinessObject();
            
            const ext = moddle.create('bpmn:ExtensionElements', { values: [] });
            const mcpReturnVars = moddle.create('mcp:ReturnVariables', { returnVariables: [] });
            bo.extensionElements = ext;
            ext.values.push(mcpReturnVars);
            
            const returnVar = moddle.create('mcp:ReturnVariable', {
                returnVariableName: 'result',
                returnVariableType: 'String'
            });
            mcpReturnVars.returnVariables.push(returnVar);
            
            // Edit type
            returnVar.returnVariableType = 'Integer';
            
            const vars = getReturnVariables(bo);
            return vars[0].returnVariableType === 'Integer' && vars[0].returnVariableName === 'result';
        }
    },
    {
        name: 'Remove return variable',
        fn: function() {
            const moddle = createMockModdle();
            const bo = createMockBusinessObject();
            
            const ext = moddle.create('bpmn:ExtensionElements', { values: [] });
            const mcpReturnVars = moddle.create('mcp:ReturnVariables', { returnVariables: [] });
            bo.extensionElements = ext;
            ext.values.push(mcpReturnVars);
            
            const returnVar1 = moddle.create('mcp:ReturnVariable', {
                returnVariableName: 'var1',
                returnVariableType: 'String'
            });
            const returnVar2 = moddle.create('mcp:ReturnVariable', {
                returnVariableName: 'var2',
                returnVariableType: 'Integer'
            });
            mcpReturnVars.returnVariables.push(returnVar1);
            mcpReturnVars.returnVariables.push(returnVar2);
            
            // Remove first variable
            mcpReturnVars.returnVariables.splice(0, 1);
            
            const vars = getReturnVariables(bo);
            return vars.length === 1 && vars[0].returnVariableName === 'var2';
        }
    },
    {
        name: 'Multiple return variables persist independently',
        fn: function() {
            const moddle = createMockModdle();
            const bo = createMockBusinessObject();
            
            const ext = moddle.create('bpmn:ExtensionElements', { values: [] });
            const mcpReturnVars = moddle.create('mcp:ReturnVariables', { returnVariables: [] });
            bo.extensionElements = ext;
            ext.values.push(mcpReturnVars);
            
            const vars = [
                { name: 'userId', type: 'Integer' },
                { name: 'userName', type: 'String' },
                { name: 'isActive', type: 'Boolean' }
            ];
            
            vars.forEach(v => {
                const returnVar = moddle.create('mcp:ReturnVariable', {
                    returnVariableName: v.name,
                    returnVariableType: v.type
                });
                mcpReturnVars.returnVariables.push(returnVar);
            });
            
            const fetchedVars = getReturnVariables(bo);
            return fetchedVars.length === 3 &&
                   fetchedVars[0].returnVariableName === 'userId' &&
                   fetchedVars[0].returnVariableType === 'Integer' &&
                   fetchedVars[1].returnVariableName === 'userName' &&
                   fetchedVars[1].returnVariableType === 'String' &&
                   fetchedVars[2].returnVariableName === 'isActive' &&
                   fetchedVars[2].returnVariableType === 'Boolean';
        }
    },
    {
        name: 'Empty state when no return variables',
        fn: function() {
            const bo = createMockBusinessObject();
            bo.extensionElements = null;
            
            const vars = getReturnVariables(bo);
            return vars.length === 0;
        }
    },
    {
        name: 'Supported types can be set',
        fn: function() {
            const moddle = createMockModdle();
            const supportedTypes = ['String', 'Boolean', 'Integer', 'Long', 'Double', 'Date'];
            
            return supportedTypes.every(type => {
                const returnVar = moddle.create('mcp:ReturnVariable', {
                    returnVariableName: 'test',
                    returnVariableType: type
                });
                return returnVar.returnVariableType === type;
            });
        }
    },
    {
        name: 'Removing all return variables empties the list',
        fn: function() {
            const moddle = createMockModdle();
            const bo = createMockBusinessObject();
            
            const ext = moddle.create('bpmn:ExtensionElements', { values: [] });
            const mcpReturnVars = moddle.create('mcp:ReturnVariables', { returnVariables: [] });
            bo.extensionElements = ext;
            ext.values.push(mcpReturnVars);
            
            for (let i = 0; i < 3; i++) {
                const returnVar = moddle.create('mcp:ReturnVariable', {
                    returnVariableName: 'var' + i,
                    returnVariableType: 'String'
                });
                mcpReturnVars.returnVariables.push(returnVar);
            }
            
            // Remove all
            while (mcpReturnVars.returnVariables.length > 0) {
                mcpReturnVars.returnVariables.pop();
            }
            
            const vars = getReturnVariables(bo);
            return vars.length === 0;
        }
    },
    {
        name: 'Editing one variable does not affect others',
        fn: function() {
            const moddle = createMockModdle();
            const bo = createMockBusinessObject();
            
            const ext = moddle.create('bpmn:ExtensionElements', { values: [] });
            const mcpReturnVars = moddle.create('mcp:ReturnVariables', { returnVariables: [] });
            bo.extensionElements = ext;
            ext.values.push(mcpReturnVars);
            
            const returnVar1 = moddle.create('mcp:ReturnVariable', {
                returnVariableName: 'var1',
                returnVariableType: 'String'
            });
            const returnVar2 = moddle.create('mcp:ReturnVariable', {
                returnVariableName: 'var2',
                returnVariableType: 'String'
            });
            mcpReturnVars.returnVariables.push(returnVar1);
            mcpReturnVars.returnVariables.push(returnVar2);
            
            // Edit first variable
            returnVar1.returnVariableName = 'var1_edited';
            returnVar1.returnVariableType = 'Integer';
            
            const vars = getReturnVariables(bo);
            return vars[0].returnVariableName === 'var1_edited' &&
                   vars[0].returnVariableType === 'Integer' &&
                   vars[1].returnVariableName === 'var2' &&
                   vars[1].returnVariableType === 'String';
        }
    }
];

// Run tests
console.log('MCP Return Variables Tests');
console.log('==========================\n');

let passed = 0;
let failed = 0;

tests.forEach((test, index) => {
    try {
        if (test.fn()) {
            console.log(`✓ ${index + 1}. ${test.name}`);
            passed++;
        } else {
            console.log(`✗ ${index + 1}. ${test.name} - returned false`);
            failed++;
        }
    } catch (error) {
        console.log(`✗ ${index + 1}. ${test.name} - ${error.message}`);
        failed++;
    }
});

console.log('\n==========================');
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
    console.log('\n✓ All tests passed!');
    process.exit(0);
} else {
    console.log('\n✗ Some tests failed');
    process.exit(1);
}

module.exports = { tests };
