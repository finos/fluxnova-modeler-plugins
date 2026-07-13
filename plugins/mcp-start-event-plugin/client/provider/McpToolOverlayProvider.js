'use strict';

var domify = require('domify');
var McpUtil = require('../util/McpUtil');
var TEMPLATES = require('../templates');

/**
 * Provider for MCP Tool AI badge overlays
 */
function McpToolOverlayProvider(eventBus, overlays, elementRegistry) {
    this._overlays = overlays;

    eventBus.on(['import.done', 'element.changed'], function(e) {
        var element = e.element || null;
        if (!element || element.type !== 'bpmn:StartEvent') return;

        var bo = element.businessObject;
        if (McpUtil.hasMcpType(bo)) {
            removeAiOverlay(element, overlays);
            setTimeout(function() { addAiOverlay(element, overlays); }, 50);
        }
    });

    eventBus.on('import.done', function() {
        setTimeout(function() {
            elementRegistry.getAll().forEach(function(el) {
                if (el.type === 'bpmn:StartEvent' && McpUtil.hasMcpType(el.businessObject)) {
                    addAiOverlay(el, overlays);
                }
            });
        }, 200);
    });
}

McpToolOverlayProvider.$inject = ['eventBus', 'overlays', 'elementRegistry'];

function addAiOverlay(element, overlays) {
    if (!overlays) return;

    try {
        removeAiOverlay(element, overlays);
        var badge = domify(TEMPLATES.aiBadge);

        overlays.add(element, 'mcp-ai-badge', {
            position: { top: 0, left: 0 },
            html: badge
        });
    } catch (err) {
        console.log('[MCP Tool Plugin] Error adding overlay:', err.message);
    }
}

function removeAiOverlay(element, overlays) {
    if (!overlays) return;
    try {
        overlays.remove({ element: element, type: 'mcp-ai-badge' });
    } catch (err) {}
}

module.exports = McpToolOverlayProvider;
