'use strict';

var McpUtil = require('../util/McpUtil');

/**
 * Provider for MCP Tool replacement menu entries
 */
function McpToolReplaceMenuProvider(popupMenu, modeling, translate, selection, overlays) {
    this._modeling = modeling;
    this._translate = translate;
    this._selection = selection;
    this._overlays = overlays;

    popupMenu.registerProvider('bpmn-replace', this);
}

McpToolReplaceMenuProvider.$inject = ['popupMenu', 'modeling', 'translate', 'selection', 'overlays'];

McpToolReplaceMenuProvider.prototype.getPopupMenuEntries = function(element) {
    if (element.type !== 'bpmn:StartEvent') return {};

    var modeling = this._modeling;
    var selection = this._selection;
    var translate = this._translate;
    var overlays = this._overlays;

    return {
        'replace-with-mcp-tool-start': {
            label: translate('MCP Tool Start Event'),
            className: 'bpmn-icon-mcp-tool-start',
            action: function() {
                modeling.updateProperties(element, {
                    'mcp:type': 'mcpToolStart',
                    'mcp:toolName': '',
                    'mcp:description': ''
                });
                selection.select(element);
                setTimeout(function() {
                    addAiOverlay(element, overlays);
                }, 100);
            }
        }
    };
};

function addAiOverlay(element, overlays) {
    var domify = require('domify');
    var TEMPLATES = require('../templates');

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

module.exports = McpToolReplaceMenuProvider;
