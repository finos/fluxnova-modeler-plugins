'use strict';

const { expect } = require('chai');
const sinon = require('sinon');

const AgentUtil = require('../client/util/AgentUtil');

const {
  makeBusinessObject,
  makeBpmnFactory
} = require('./helpers/moddle-mocks');

describe('AgentUtil', function() {

  let bo, bpmnFactory;

  beforeEach(function() {
    bo = makeBusinessObject('bpmn:AdHocSubProcess');
    bpmnFactory = makeBpmnFactory();
  });

  describe('#getAgentConfig / #getAgentContext', function() {

    it('should return null when there are no extension elements', function() {
      expect(AgentUtil.getAgentConfig(bo)).to.equal(null);
      expect(AgentUtil.getAgentContext(bo)).to.equal(null);
    });

    it('should return the agent:Config / agent:Context once added', function() {
      AgentUtil.addAgentExtensions(bo, bpmnFactory);

      const config = AgentUtil.getAgentConfig(bo);
      const context = AgentUtil.getAgentContext(bo);

      expect(config).to.exist;
      expect(config.$type).to.equal('agent:Config');
      expect(context).to.exist;
      expect(context.$type).to.equal('agent:Context');
    });
  });

  describe('#isAgenticSubprocess', function() {

    it('should be false for a plain subprocess', function() {
      expect(AgentUtil.isAgenticSubprocess(bo)).to.equal(false);
    });

    it('should be true once agent extensions are attached', function() {
      AgentUtil.addAgentExtensions(bo, bpmnFactory);

      expect(AgentUtil.isAgenticSubprocess(bo)).to.equal(true);
    });
  });

  describe('#addAgentExtensions', function() {

    it('should create an extensionElements container holding config + context', function() {
      AgentUtil.addAgentExtensions(bo, bpmnFactory);

      const extensionElements = bo.get('extensionElements');

      expect(extensionElements).to.exist;
      expect(extensionElements.$type).to.equal('bpmn:ExtensionElements');
      expect(extensionElements.$parent).to.equal(bo);

      const types = extensionElements.get('values').map((v) => v.$type);
      expect(types).to.include('agent:Config');
      expect(types).to.include('agent:Context');
    });

    it('should seed agent:Config with empty provider/model/systemPrompt', function() {
      AgentUtil.addAgentExtensions(bo, bpmnFactory);

      const config = AgentUtil.getAgentConfig(bo);

      expect(config.provider).to.equal('');
      expect(config.model).to.equal('');
      expect(config.systemPrompt).to.equal('');
    });

    it('should be idempotent (no duplicate config/context on repeat calls)', function() {
      AgentUtil.addAgentExtensions(bo, bpmnFactory);
      AgentUtil.addAgentExtensions(bo, bpmnFactory);

      const values = bo.get('extensionElements').get('values');

      expect(values).to.have.lengthOf(2);
    });

    it('should reuse an existing extensionElements container', function() {
      AgentUtil.addAgentExtensions(bo, bpmnFactory);
      const first = bo.get('extensionElements');

      AgentUtil.addAgentExtensions(bo, bpmnFactory);

      expect(bo.get('extensionElements')).to.equal(first);
    });
  });

  describe('#removeAgentExtensions', function() {

    it('should strip agent:Config and agent:Context', function() {
      AgentUtil.addAgentExtensions(bo, bpmnFactory);

      AgentUtil.removeAgentExtensions(bo);

      expect(AgentUtil.isAgenticSubprocess(bo)).to.equal(false);
      expect(bo.get('extensionElements').get('values')).to.have.lengthOf(0);
    });

    it('should preserve non-agent extension values', function() {
      AgentUtil.addAgentExtensions(bo, bpmnFactory);

      const other = { $type: 'zeebe:TaskDefinition' };
      bo.get('extensionElements').get('values').push(other);

      AgentUtil.removeAgentExtensions(bo);

      const values = bo.get('extensionElements').get('values');
      expect(values).to.have.lengthOf(1);
      expect(values[0]).to.equal(other);
    });

    it('should be a no-op when there are no extension elements', function() {
      expect(() => AgentUtil.removeAgentExtensions(bo)).to.not.throw();
    });
  });

  describe('#getContextVariables', function() {

    it('should return an empty array when no context exists', function() {
      expect(AgentUtil.getContextVariables(bo)).to.deep.equal([]);
    });

    it('should return the context variables when present', function() {
      AgentUtil.addAgentExtensions(bo, bpmnFactory);

      const variable = { $type: 'agent:Variable', name: 'orderId' };
      AgentUtil.getAgentContext(bo).variables.push(variable);

      expect(AgentUtil.getContextVariables(bo)).to.deep.equal([ variable ]);
    });
  });

  describe('#updateModdle', function() {

    it('should call modeling.updateModdleProperties with the extension elements', function() {
      AgentUtil.addAgentExtensions(bo, bpmnFactory);

      const modeling = { updateModdleProperties: sinon.spy() };
      const element = { businessObject: bo };

      AgentUtil.updateModdle(element, bo, modeling);

      expect(modeling.updateModdleProperties).to.have.been.calledOnce;

      const [ passedElement, passedBo, props ] = modeling.updateModdleProperties.firstCall.args;
      expect(passedElement).to.equal(element);
      expect(passedBo).to.equal(bo);
      expect(props.extensionElements).to.equal(bo.get('extensionElements'));
    });
  });
});
