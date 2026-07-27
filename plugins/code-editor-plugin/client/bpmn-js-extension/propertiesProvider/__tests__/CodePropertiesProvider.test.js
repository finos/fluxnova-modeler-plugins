import { isTextFieldEntryEdited } from '@bpmn-io/properties-panel';

import CodePropertiesProvider, { decorateGroup } from '../CodePropertiesProvider';
import { CODE_EDITOR_FLAG, TOGGLE_CODE_EDITOR_FLAG } from '../../../../shared-util/constants';
import * as ScriptProps from '../props/ScriptProps';
import * as ConditionalProps from '../props/ConditionalProps';

describe('CodePropertiesProvider', () => {
  let propertiesPanelMock, injectorMock, editorActionsMock, eventBusMock, provider;

  const mockFn = jest.fn();

  beforeEach(() => {

    // reset all mock
    jest.resetAllMocks();

    propertiesPanelMock = {
      registerProvider: mockFn
    };

    eventBusMock = {
      fire: mockFn,
      on: mockFn
    };

    injectorMock = {
      get: jest.fn((service) => {
        if (service === 'eventBus') {
          return eventBusMock;
        }
        return null;
      }),
    };

    editorActionsMock = {
      register: jest.fn((actions) => {
        if (actions.toggleCodeEditor) {
          actions.toggleCodeEditor = actions.toggleCodeEditor.bind(provider);
        }
      })
    };

    // script props
    jest.spyOn(ScriptProps, 'getScriptType').mockReturnValue(null);
    jest.spyOn(ScriptProps, 'getScriptFormat').mockReturnValue(undefined);

    // conditional props
    jest.spyOn(ConditionalProps, 'getScriptType').mockReturnValue(null);
    jest.spyOn(ConditionalProps, 'getScriptLanguage').mockReturnValue(undefined);

    jest.spyOn({ decorateGroup }, 'decorateGroup');


    // instantiate CodePropertiesProvider
    provider = new CodePropertiesProvider(
      propertiesPanelMock, injectorMock, editorActionsMock
    );

  });

  it('should instantiate CodePropertiesProvider and register all events and handlers', () => {
    expect(provider).toBeDefined();
    expect(provider.isEnabled).toBeTruthy();
    expect(injectorMock.get).toHaveBeenCalledWith('eventBus');
    expect(editorActionsMock.register).toHaveBeenCalledWith({ 'toggleCodeEditor': expect.any(Function) });
    expect(propertiesPanelMock.registerProvider).toHaveBeenCalledWith(200, provider);
  });

  it('should listen to feature flag events', () => {
    expect(eventBusMock.on).toHaveBeenCalledWith(CODE_EDITOR_FLAG, expect.any(Function));
    const toggleCallback = eventBusMock.on.mock.calls.find(call => call[0] === CODE_EDITOR_FLAG)[1];

    toggleCallback({ enabled: false });
    expect(provider.isEnabled).toBe(false);

    toggleCallback({ enabled: true });
    expect(provider.isEnabled).toBe(true);
  });

  it('should toggle feature flag when toggleEditorAction is called from menu', () => {
    expect(provider.isEnabled).toBe(true);

    const toggleCodeEditor = editorActionsMock.register.mock.calls[0][0].toggleCodeEditor;
    toggleCodeEditor();

    expect(provider.isEnabled).toBe(false);
    expect(eventBusMock.fire).toHaveBeenCalledWith(TOGGLE_CODE_EDITOR_FLAG, { enabled: false });

    toggleCodeEditor();

    expect(provider.isEnabled).toBe(true);
    expect(eventBusMock.fire).toHaveBeenCalledWith(TOGGLE_CODE_EDITOR_FLAG, { enabled: true });
  });

  describe('getGroups', () => {
    let element, businessObject;
    let groups, scriptGroup, conditionGroup, taskListenerGroup, execListenerGroup, inputGroup, outputGroup;

    beforeEach(() => {

      // mock a BPMN element with a businessObject
      businessObject = {};
      element = { businessObject };

      scriptGroup = { id: 'CamundaPlatform__Script', entries: [] };
      conditionGroup = { id: 'CamundaPlatform__Condition', entries: [] };
      taskListenerGroup = { id: 'CamundaPlatform__TaskListener', items: [] };
      execListenerGroup = { id: 'CamundaPlatform__ExecutionListener', items: [] };
      inputGroup = { id: 'CamundaPlatform__Input', items: [] };
      outputGroup = { id: 'CamundaPlatform__Output', items: [] };

      groups = [
        scriptGroup,
        conditionGroup,
        taskListenerGroup,
        execListenerGroup,
        inputGroup,
        outputGroup,
      ];

    });

    it('should return a groups-middleware function', () => {
      const result = provider.getGroups(element);
      expect(typeof result).toBe('function');
    });

    it('should return groups unmodified if code editor is disabled', () => {
      expect(provider.isEnabled).toBe(true);

      provider.isEnabled = false;
      expect(provider.isEnabled).toBe(false);

      const getGroupsFn = provider.getGroups(element);
      const newGroups = getGroupsFn(groups);
      expect(newGroups).toEqual(groups);
    });

    describe('CamundaPlatform__Script group', () => {
      beforeEach(()=> {
        scriptGroup.entries.push({
          id: 'scriptValue'
        });
      });

      it('should decorate scriptValue if script type + supported scriptFormat', () => {

        // force is-script scenario
        ScriptProps.getScriptType.mockReturnValue('script');
        ScriptProps.getScriptFormat.mockReturnValue('javascript');

        // call getGroups => returns a func => call the func with groups
        const middleware = provider.getGroups(element);
        const returnedGroups = middleware(groups);

        expect(returnedGroups).toBe(groups); // sanity check

        // verify entry has been decorated
        const scriptValueEntry = scriptGroup.entries.find(e => e.id === 'scriptValue');
        expect(scriptValueEntry.component).toBe(ScriptProps.Script);
        expect(scriptValueEntry.isEdited).toBe(isTextFieldEntryEdited);
      });

      it('should decorate scriptValue if script type + supported scriptFormat (case insensitive)', () => {
        ScriptProps.getScriptType.mockReturnValue('script');
        ScriptProps.getScriptFormat.mockReturnValue('JAVASCRIPT');

        // call getGroups => returns a func => call the func with groups
        const middleware = provider.getGroups(element);
        const returnedGroups = middleware(groups);
        expect(returnedGroups).toBe(groups); // sanity check

        // verify entry has been decorated
        const scriptValueEntry = scriptGroup.entries.find(e => e.id === 'scriptValue');
        expect(scriptValueEntry.component).toBe(ScriptProps.Script);
        expect(scriptValueEntry.isEdited).toBe(isTextFieldEntryEdited);
      });

      it('should NOT decorate scriptValue if scriptFormat is not in the supported list', () => {
        ScriptProps.getScriptType.mockReturnValue('script');
        ScriptProps.getScriptFormat.mockReturnValue('cobol');

        provider.getGroups(element)(groups);

        const scriptValueEntry = scriptGroup.entries.find(e => e.id === 'scriptValue');
        expect(scriptValueEntry.component).toBeUndefined();
        expect(scriptValueEntry.isEdited).toBeUndefined();

      });

      it('should do nothing if getScriptType !== script (external resource)', () => {
        ScriptProps.getScriptType.mockReturnValue('resource');

        provider.getGroups(element)(groups);

        const scriptValueEntry = scriptGroup.entries.find(e => e.id === 'scriptValue');
        expect(scriptValueEntry.component).toBeUndefined();
        expect(scriptValueEntry.isEdited).toBeUndefined();
      });
    });

    describe('CamundaPlatform__Condition group', () => {
      beforeEach(()=> {
        conditionGroup.entries.push({
          id: 'conditionScriptValue',
        });
      });

      it('should decorate conditionScriptValue if script type + supported language', () => {

        // force is-script scenario
        ConditionalProps.getScriptType.mockReturnValue('script');
        ConditionalProps.getScriptLanguage.mockReturnValue('groovy');

        // call getGroups => returns a func => call the func with groups
        provider.getGroups(element)(groups);

        // verify entry has been decorated
        const conditionScript = conditionGroup.entries.find(e => e.id === 'conditionScriptValue');
        expect(conditionScript.component).toBe(ConditionalProps.ConditionalScript);
        expect(conditionScript.isEdited).toBe(isTextFieldEntryEdited);
      });

      it('should decorate conditionScriptValue if script type + supported language (case insensitive)', () => {
        ConditionalProps.getScriptType.mockReturnValue('script');
        ConditionalProps.getScriptLanguage.mockReturnValue('grOOvy');

        // call getGroups => returns a func => call the func with groups
        provider.getGroups(element)(groups);

        // verify entry has been decorated
        const conditionScript = conditionGroup.entries.find(e => e.id === 'conditionScriptValue');
        expect(conditionScript.component).toBe(ConditionalProps.ConditionalScript);
        expect(conditionScript.isEdited).toBe(isTextFieldEntryEdited);
      });

      it('should NOT decorate if language is not supported', ()=> {
        ConditionalProps.getScriptType.mockReturnValue('script');
        ConditionalProps.getScriptLanguage.mockReturnValue('lisp');

        provider.getGroups(element)(groups);

        const conditionScript = conditionGroup.entries.find(e => e.id === 'conditionScriptValue');
        expect(conditionScript.component).toBeUndefined();
      });

      it('should do nothing if getScriptType !== script (external resource)', () => {
        ConditionalProps.getScriptType.mockReturnValue('resource');

        provider.getGroups(element)(groups);

        const conditionScript = conditionGroup.entries.find(e => e.id === 'conditionScriptValue');
        expect(conditionScript.component).toBeUndefined();
        expect(conditionScript.isEdited).toBeUndefined();
      });
    });

    describe('decorateGroup', () => {
      it('should call decorateGroup for CamundaPlatform__TaskListener', () => {

        // add an entry to the taskListenerGroup
        taskListenerGroup.items.push({
          entries: [
            { id: 'scriptValue', script: { get: () => 'javascript' } }
          ]
        });

        const middleware = provider.getGroups(element);
        middleware(groups);


        const scriptEntry = taskListenerGroup.items[0].entries.find(e => e.id === 'scriptValue');
        expect(scriptEntry.component).toBe(ScriptProps.Script);
        expect(scriptEntry.isEdited).toBe(isTextFieldEntryEdited);
      });

      it('should call decorateGroup for CamundaPlatform__ExecutionListener', () => {

        // add an entry to the execListenerGroup
        execListenerGroup.items.push({
          entries: [
            { id: 'scriptValue', script: { get: () => 'groovy' } }
          ]
        });

        const middleware = provider.getGroups(element);
        middleware(groups);


        const scriptEntry = execListenerGroup.items[0].entries.find(e => e.id === 'scriptValue');
        expect(scriptEntry.component).toBe(ScriptProps.Script);
        expect(scriptEntry.isEdited).toBe(isTextFieldEntryEdited);
      });

      it('should call decorateGroup for CamundaPlatform__Input', () => {

        // add an entry to the inputGroup
        inputGroup.items.push({
          entries: [
            { id: 'scriptValue', script: { get: () => 'javascript' } }
          ]
        });

        const middleware = provider.getGroups(element);
        middleware(groups);


        const scriptEntry = inputGroup.items[0].entries.find(e => e.id === 'scriptValue');
        expect(scriptEntry.component).toBe(ScriptProps.Script);
        expect(scriptEntry.isEdited).toBe(isTextFieldEntryEdited);
      });

      it('should call decorateGroup for CamundaPlatform__Output', () => {

        // add an entry to the outputGroup
        outputGroup.items.push({
          entries: [
            { id: 'scriptValue', script: { get: () => 'javascript' } }
          ]
        });

        const middleware = provider.getGroups(element);
        middleware(groups);


        const scriptEntry = outputGroup.items[0].entries.find(e => e.id === 'scriptValue');
        expect(scriptEntry.component).toBe(ScriptProps.Script);
        expect(scriptEntry.isEdited).toBe(isTextFieldEntryEdited);
      });

      it('should decorate entries for all group types with case insensitive script formats', () => {
        const groupsTobeDecorated = [
          { group: taskListenerGroup, script: 'JavaScript' },
          { group: execListenerGroup, script: 'GroovY' },
          { group: inputGroup, script: 'JAVAscript' },
          { group: outputGroup, script: 'gROOVy' }
        ];

        groupsTobeDecorated.forEach(({ group, script }) => {
          group.items.push({
            entries: [ { id: 'scriptValue', script: { get: () => script } } ]
          });
        });

        const middleware = provider.getGroups(element);
        middleware(groups);

        groupsTobeDecorated.forEach(({ group }) => {
          const scriptEntry = group.items[0].entries.find(e => e.id === 'scriptValue');
          expect(scriptEntry.component).toBe(ScriptProps.Script);
          expect(scriptEntry.isEdited).toBe(isTextFieldEntryEdited);
        });
      });

      it('should NOT decorate entries with unsupported script formats', () => {

        // add entries with unsupported script languages
        taskListenerGroup.items.push({
          entries: [
            { id: 'scriptValue', script: { get: () => 'python' } }
          ]
        });

        inputGroup.items.push({
          entries: [
            { id: 'scriptValue', script: { get: () => 'ruby' } }
          ]
        });

        const middleware = provider.getGroups(element);
        middleware(groups);

        const unsupportedScriptEntry = taskListenerGroup.items[0].entries.find(e => e.id === 'scriptValue');
        const anotherScriptEntry = inputGroup.items[0].entries.find(e => e.id === 'scriptValue');

        expect(unsupportedScriptEntry.component).toBeUndefined();
        expect(anotherScriptEntry.component).toBeUndefined();
      });
    });
  });
});