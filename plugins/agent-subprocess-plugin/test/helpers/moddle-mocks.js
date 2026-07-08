'use strict';

/**
 * Lightweight stand-ins for bpmn-moddle business objects and the bpmnFactory.
 *
 * Real moddle objects expose a `get(name)` accessor that reads a same-named
 * property, and are created through `bpmnFactory.create(type, props)`. These
 * mocks reproduce just enough of that contract for AgentUtil and the providers,
 * without pulling in bpmn-js.
 */

function makeModdleElement(type, props = {}) {
  const el = Object.assign({ $type: type }, props);

  el.get = (name) => el[name];
  el.set = (name, value) => {
    el[name] = value;
  };

  return el;
}

function makeBusinessObject(type = 'bpmn:AdHocSubProcess', props = {}) {
  return makeModdleElement(type, props);
}

function makeBpmnFactory() {
  return {
    create(type, props = {}) {
      return makeModdleElement(type, props);
    }
  };
}

module.exports = {
  makeModdleElement,
  makeBusinessObject,
  makeBpmnFactory
};
