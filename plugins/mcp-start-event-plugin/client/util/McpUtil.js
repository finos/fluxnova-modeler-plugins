'use strict';

/**
 * Get MCP property from business object
 */
function getMcpProperty(bo, prop) {
    return bo.get(prop);
}

/**
 * Check if element has MCP type
 */
function hasMcpType(bo) {
    return getMcpProperty(bo, 'mcp:type') === 'mcpToolStart';
}

/**
 * Get extension elements from business object
 */
function getExtensionElements(bo) {
    return bo.get('extensionElements');
}

/**
 * Get MCP parameters from business object
 */
function getMcpParameters(bo) {
    var extensionElements = getExtensionElements(bo);
    if (!extensionElements) return null;

    var values = extensionElements.get('values');
    return values ? values.find(function(v) { return v.$type === 'mcp:Parameters'; }) : null;
}

/**
 * Get parameters array from business object
 */
function getParameters(bo) {
    var mcpParams = getMcpParameters(bo);
    return mcpParams ? (mcpParams.get('parameters') || []) : [];
}

/**
 * Get MCP return variables from business object
 */
function getMcpReturnVariables(bo) {
    var extensionElements = getExtensionElements(bo);
    if (!extensionElements) return null;

    var values = extensionElements.get('values');
    return values ? values.find(function(v) { return v.$type === 'mcp:ReturnVariables'; }) : null;
}

/**
 * Get return variables array from business object
 */
function getReturnVariables(bo) {
    var mcpReturnVars = getMcpReturnVariables(bo);
    return mcpReturnVars ? (mcpReturnVars.get('returnVariables') || []) : [];
}

/**
 * Update moddle properties
 */
function updateModdle(element, bo, modeling) {
    modeling.updateModdleProperties(element, bo, {
        extensionElements: getExtensionElements(bo)
    });
}

module.exports = {
    getExtensionElements: getExtensionElements,
    getMcpParameters: getMcpParameters,
    getMcpProperty: getMcpProperty,
    getMcpReturnVariables: getMcpReturnVariables,
    getParameters: getParameters,
    getReturnVariables: getReturnVariables,
    hasMcpType: hasMcpType,
    updateModdle: updateModdle
};
