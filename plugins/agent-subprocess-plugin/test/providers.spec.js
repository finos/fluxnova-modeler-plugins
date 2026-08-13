'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const AgentCreateAppendProvider = require('../client/provider/AgentCreateAppendProvider');
const AgentReplaceMenuProvider = require('../client/provider/AgentReplaceMenuProvider');
const AgentOverlayProvider = require('../client/provider/AgentOverlayProvider');
const AgentPropertiesProvider = require('../client/provider/AgentPropertiesProvider');

const AgentUtil = require('../client/util/AgentUtil');

const {
  makeBusinessObject,
  makeBpmnFactory
} = require('./helpers/moddle-mocks');

describe('providers', function() {

  describe('registration', function() {

    it('AgentCreateAppendProvider registers for bpmn-create and bpmn-append', function() {
      const popupMenu = { registerProvider: sinon.spy() };

      new AgentCreateAppendProvider(
        popupMenu, {}, {}, makeBpmnFactory(), {}, {}, (s) => s
      );

      expect(popupMenu.registerProvider).to.have.been.calledWith('bpmn-create');
      expect(popupMenu.registerProvider).to.have.been.calledWith('bpmn-append');
    });

    it('AgentReplaceMenuProvider registers for bpmn-replace', function() {
      const popupMenu = { registerProvider: sinon.spy() };

      new AgentReplaceMenuProvider(popupMenu, {}, makeBpmnFactory(), {});

      expect(popupMenu.registerProvider).to.have.been.calledWith('bpmn-replace');
    });

    it('AgentOverlayProvider subscribes to the relevant lifecycle events', function() {
      const eventBus = { on: sinon.spy() };

      new AgentOverlayProvider(eventBus, {}, { getAll: () => [] });

      const events = eventBus.on.getCalls().map((c) => c.args[0]);
      expect(events).to.include('import.done');
      expect(events).to.include('element.changed');
      expect(events).to.include('elements.changed');
    });

    it('AgentPropertiesProvider subscribes to propertiesPanel.updated', function() {
      const eventBus = { on: sinon.spy() };

      new AgentPropertiesProvider(eventBus, {}, {});

      expect(eventBus.on).to.have.been.calledWith('propertiesPanel.updated');
    });
  });

  describe('AgentCreateAppendProvider#getPopupMenuEntries', function() {

    let provider, popupMenu, create, autoPlace, elementFactory, bpmnFactory;

    beforeEach(function() {
      popupMenu = { registerProvider: sinon.spy(), close: sinon.spy() };
      create = { start: sinon.spy() };
      autoPlace = { append: sinon.spy() };
      bpmnFactory = makeBpmnFactory();
      elementFactory = {
        createShape: () => ({
          type: 'bpmn:AdHocSubProcess',
          businessObject: makeBusinessObject('bpmn:AdHocSubProcess')
        })
      };

      provider = new AgentCreateAppendProvider(
        popupMenu, create, elementFactory, bpmnFactory, autoPlace,
        { getLastMoveEvent: () => ({}) },
        (s) => s
      );
    });

    it('exposes a single "Agentic Sub-process" entry under the Sub-processes group', function() {
      const entries = provider.getPopupMenuEntries({ /* root: no parent */ });
      const entry = entries['create-agentic-subprocess'];

      expect(entry).to.exist;
      expect(entry.label).to.equal('Agentic Sub-process');
      expect(entry.group.id).to.equal('subprocess');
    });

    it('starts a manual create interaction when target has no parent (palette)', function() {
      const entries = provider.getPopupMenuEntries({ /* no parent */ });

      entries['create-agentic-subprocess'].action.click({ /* mouse event */ });

      expect(popupMenu.close).to.have.been.called;
      expect(create.start).to.have.been.calledOnce;

      const shape = create.start.firstCall.args[1];
      expect(AgentUtil.isAgenticSubprocess(shape.businessObject)).to.equal(true);
    });

    it('auto-places next to the source when appending (target has a parent)', function() {
      const source = { parent: {}, businessObject: makeBusinessObject() };

      const entries = provider.getPopupMenuEntries(source);
      entries['create-agentic-subprocess'].action.click();

      expect(autoPlace.append).to.have.been.calledOnce;

      const [ appendSource, shape ] = autoPlace.append.firstCall.args;
      expect(appendSource).to.equal(source);
      expect(AgentUtil.isAgenticSubprocess(shape.businessObject)).to.equal(true);
    });
  });

  describe('AgentReplaceMenuProvider#getPopupMenuEntries', function() {

    let provider;

    beforeEach(function() {
      provider = new AgentReplaceMenuProvider(
        { registerProvider: sinon.spy() }, {}, makeBpmnFactory(), {}
      );
    });

    it('offers no entries for non-subprocess elements', function() {
      const element = {
        type: 'bpmn:Task',
        businessObject: makeBusinessObject('bpmn:Task')
      };

      expect(provider.getPopupMenuEntries(element)).to.deep.equal({});
    });

    it('offers "promote to agentic" for a plain SubProcess', function() {
      const element = {
        type: 'bpmn:SubProcess',
        businessObject: makeBusinessObject('bpmn:SubProcess')
      };

      const entries = provider.getPopupMenuEntries(element);

      expect(entries).to.have.property('replace-with-agentic-subprocess');
    });

    it('offers "revert to ad-hoc" for an agentic AdHocSubProcess', function() {
      const bo = makeBusinessObject('bpmn:AdHocSubProcess');
      AgentUtil.addAgentExtensions(bo, makeBpmnFactory());

      const entries = provider.getPopupMenuEntries({
        type: 'bpmn:AdHocSubProcess',
        businessObject: bo
      });

      expect(entries).to.have.property('replace-with-adhoc-subprocess');
    });

    it('offers "promote to agentic" for an AdHocSubProcess without agent extensions', function() {
      const entries = provider.getPopupMenuEntries({
        type: 'bpmn:AdHocSubProcess',
        businessObject: makeBusinessObject('bpmn:AdHocSubProcess')
      });

      expect(entries).to.have.property('replace-with-agentic-subprocess');
    });
  });

  describe('AgentOverlayProvider overlay syncing', function() {

    let overlays, handlers;

    beforeEach(function() {
      overlays = { add: sinon.spy(), remove: sinon.spy() };
      handlers = {};

      const eventBus = {
        on: (event, fn) => {
          handlers[event] = fn;
        }
      };

      new AgentOverlayProvider(eventBus, overlays, { getAll: () => [] });
    });

    it('adds the AI badge overlay for an agentic AdHocSubProcess', function() {
      const bo = makeBusinessObject('bpmn:AdHocSubProcess');
      AgentUtil.addAgentExtensions(bo, makeBpmnFactory());

      handlers['element.changed']({
        element: { id: 'Activity_1', type: 'bpmn:AdHocSubProcess', businessObject: bo }
      });

      expect(overlays.add).to.have.been.calledOnce;
      expect(overlays.add.firstCall.args[1]).to.equal('agent-ai-badge');
    });

    it('removes the overlay for a non-agentic AdHocSubProcess', function() {
      handlers['element.changed']({
        element: {
          id: 'Activity_2',
          type: 'bpmn:AdHocSubProcess',
          businessObject: makeBusinessObject('bpmn:AdHocSubProcess')
        }
      });

      expect(overlays.add).to.not.have.been.called;
      expect(overlays.remove).to.have.been.called;
    });

    it('ignores elements that are not AdHocSubProcesses', function() {
      handlers['element.changed']({
        element: { id: 'Task_1', type: 'bpmn:Task', businessObject: makeBusinessObject('bpmn:Task') }
      });

      expect(overlays.add).to.not.have.been.called;
      expect(overlays.remove).to.not.have.been.called;
    });
  });
});
