'use strict';

var registerBpmnJSPlugin = require('camunda-modeler-plugin-helpers').registerBpmnJSPlugin;
var registerBpmnJSModdleExtension = require('camunda-modeler-plugin-helpers').registerBpmnJSModdleExtension;

var McpToolReplaceMenuProvider = require('./provider/McpToolReplaceMenuProvider');
var McpToolOverlayProvider = require('./provider/McpToolOverlayProvider');
var McpToolPropertiesProvider = require('./provider/McpToolPropertiesProvider');

console.log('[MCP Tool Plugin] client.js loaded');

// ============================================
// MODDLE EXTENSION
// ============================================
registerBpmnJSModdleExtension({
  name: 'mcp',
  prefix: 'mcp',
  uri: 'http://fluxnova.finos.org/schema/1.0/ai/mcp',
  xml: { tagAlias: 'lowerCase' },
  types: [
    {
      name: 'McpProperties',
      isAbstract: true,
      extends: ['bpmn:StartEvent'],
      properties: [
        { name: 'type', isAttr: true, type: 'String' },
        { name: 'toolName', isAttr: true, type: 'String' },
        { name: 'description', isAttr: true, type: 'String' },
        { name: 'propagateBusinessKey', isAttr: true, type: 'Boolean', default: true }
      ]
    },
    {
      name: 'Parameters',
      superClass: ['Element'],
      properties: [{ name: 'parameters', type: 'mcp:Parameter', isMany: true }]
    },
    {
      name: 'Parameter',
      superClass: ['Element'],
      properties: [
        { name: 'paramName', isAttr: true, type: 'String' },
        { name: 'paramType', isAttr: true, type: 'String' }
      ]
    },
    {
      name: 'ReturnVariables',
      superClass: ['Element'],
      properties: [{ name: 'returnVariables', type: 'mcp:ReturnVariable', isMany: true }]
    },
    {
      name: 'ReturnVariable',
      superClass: ['Element'],
      properties: [
        { name: 'returnVariableName', isAttr: true, type: 'String' },
        { name: 'returnVariableType', isAttr: true, type: 'String' }
      ]
    }
  ]
});

// ============================================
// MODULE REGISTRATION
// ============================================
registerBpmnJSPlugin({
  __init__: ['mcpToolReplaceMenuProvider', 'mcpToolPropertiesProvider', 'mcpToolOverlayProvider'],
  mcpToolReplaceMenuProvider: ['type', McpToolReplaceMenuProvider],
  mcpToolPropertiesProvider: ['type', McpToolPropertiesProvider],
  mcpToolOverlayProvider: ['type', McpToolOverlayProvider]
});

console.log('[MCP Tool Plugin] Plugin registered');
