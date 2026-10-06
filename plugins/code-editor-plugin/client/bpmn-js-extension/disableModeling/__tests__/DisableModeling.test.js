import DisableModeling from '../DisableModeling';
import { OPEN_CODE_EDITOR, SAVE_CODE_EDITOR } from '../../../../shared-util/constants';

describe('DisableModeling', () => {
  let eventBus,
      canvas,
      contextPad,
      dragging,
      directEditing,
      editorActions,
      modeling,
      palette,
      moveCanvas;

  let disableModelingInstance;

  let originalContextPadOpen,
      originalDraggingInit,
      originalDirectEditingActivate,
      originalMoveCanvasHandleStart,
      originalMoveCanvasHandleMove,
      originalMoveCanvasHandleEnd,
      originalEditorActionsTrigger;


  const mockFn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // mock event bus
    eventBus = {
      on: jest.fn()
    };

    // mock canvas
    const canvasContainer = document.createElement('div');
    const containerParent = document.createElement('div');
    containerParent.appendChild(canvasContainer);

    canvas = {
      getContainer: () => canvasContainer
    };

    // mock rest of tools/actions
    contextPad = {
      open: mockFn,
      close: mockFn
    };

    dragging = {
      cancel: mockFn,
      init: mockFn
    };
    directEditing = {
      cancel: mockFn,
      activate: mockFn
    };
    editorActions = {
      trigger: mockFn
    };
    modeling = {
      moveShape: mockFn,
      updateAttachment: mockFn,
      moveElements: mockFn,
      moveConnection: mockFn,
      layoutConnection: mockFn,
      createConnection: mockFn,
      createShape: mockFn,
      createLabel: mockFn,
      appendShape: mockFn,
      removeElements: mockFn,
      distributeElements: mockFn,
      removeShape: mockFn,
      removeConnection: mockFn,
      replaceShape: mockFn,
      pasteElements: mockFn,
      alignElements: mockFn,
      createSpace: mockFn,
      updateWaypoints: mockFn,
      reconnectStart: mockFn,
      reconnectEnd: mockFn,
    };
    palette = {
      _update: mockFn
    };
    moveCanvas = {
      handleStart: mockFn,
      handleMove: mockFn,
      handleEnd: mockFn
    };

    // create references to the original mock functions (before they get modified by the plugin)
    originalContextPadOpen = contextPad.open;
    originalDraggingInit = dragging.init;
    originalDirectEditingActivate = directEditing.activate;
    originalMoveCanvasHandleStart = moveCanvas.handleStart;
    originalMoveCanvasHandleMove = moveCanvas.handleMove;
    originalMoveCanvasHandleEnd = moveCanvas.handleEnd;
    originalEditorActionsTrigger = editorActions.trigger;

    // instantiate DisableModeling
    disableModelingInstance = new DisableModeling(
      eventBus,
      canvas,
      contextPad,
      dragging,
      directEditing,
      editorActions,
      modeling,
      palette,
      moveCanvas
    );
  });

  it('should register event handlers on construction', () => {

    // verify eventBus.on has been called for the events we care about
    expect(eventBus.on).toHaveBeenCalledWith('import.done', expect.any(Function));
    expect(eventBus.on).toHaveBeenCalledWith(OPEN_CODE_EDITOR, 10005, expect.any(Function));
    expect(eventBus.on).toHaveBeenCalledWith(SAVE_CODE_EDITOR, 10005, expect.any(Function));
  });

  describe('import.done event', () => {
    it('should set canvasParent and palette on import.done', () => {

      // mimic the eventBus import.done callback
      const importDoneCallback = eventBus.on.mock.calls.find(call => call[0] === 'import.done')[1];

      importDoneCallback();

      expect(disableModelingInstance.canvasParent).toBe(canvas.getContainer().parentNode);
      expect(disableModelingInstance.palette).toBeNull(); // because query('.djs-palette') wont find anything
    });
  });

  describe('OPEN_CODE_EDITOR event', () => {
    let openCodeEditorCallback, importDoneCallback;

    beforeEach(() => {
      const container = disableModelingInstance._canvas.getContainer();
      const paletteEl = document.createElement('div');
      paletteEl.classList.add('djs-palette');
      container.appendChild(paletteEl);

      // mimic the eventBus OPEN_CODE_EDITOR callback
      openCodeEditorCallback = eventBus.on.mock.calls
        .find(call => call[0] === OPEN_CODE_EDITOR)[2]; // [0] => event name, [1] => priority, [2] => handler

      importDoneCallback = eventBus.on.mock.calls.find(call => call[0] === 'import.done')[1];
      importDoneCallback();
    });

    it('should set modelingDisabled to true and disable editing', () => {
      openCodeEditorCallback();

      expect(disableModelingInstance.modelingDisabled).toBe(true);
      expect(directEditing.cancel).toHaveBeenCalled();
      expect(contextPad.close).toHaveBeenCalled();
      expect(dragging.cancel).toHaveBeenCalled();
    });

    it('should add exportMode and hidden classes', () => {
      openCodeEditorCallback();

      expect(disableModelingInstance.canvasParent.classList.contains('exportMode')).toBe(true);
      expect(disableModelingInstance.palette.classList.contains('hidden')).toBe(true);
    });

    it('should call palette._update()', () => {
      openCodeEditorCallback();
      expect(palette._update).toHaveBeenCalled();
    });
  });

  describe('SAVE_CODE_EDITOR event', () => {
    let saveCodeEditorCallback, importDoneCallback;

    beforeEach(() => {
      const container = disableModelingInstance._canvas.getContainer();
      const paletteEl = document.createElement('div');
      paletteEl.classList.add('djs-palette');
      container.appendChild(paletteEl);

      // mimic the eventBus SAVE_CODE_EDITOR callback
      saveCodeEditorCallback = eventBus.on.mock.calls
        .find(call => call[0] === SAVE_CODE_EDITOR)[2]; // [0] => event name, [1] => priority, [2] => handler

      // assume modeling is disabled beforehand
      disableModelingInstance.modelingDisabled = true;

      importDoneCallback = eventBus.on.mock.calls.find(call => call[0] === 'import.done')[1];
      importDoneCallback();
    });

    it('should set modelingDisabled to false', () => {
      saveCodeEditorCallback();
      expect(disableModelingInstance.modelingDisabled).toBe(false);
    });

    it('should remove exportMode and hidden classes', () => {
      saveCodeEditorCallback();

      expect(disableModelingInstance.canvasParent.classList.contains('exportMode')).toBe(false);
      expect(disableModelingInstance.palette.classList.contains('hidden')).toBe(false);
    });

    it('should call palette._update()', () => {
      saveCodeEditorCallback();
      expect(palette._update).toHaveBeenCalled();
    });
  });

  describe('Intercept events to ignore or throw when modeling is disabled', () => {
    beforeEach(() => {

      // mark modeling as disabled
      disableModelingInstance.modelingDisabled = true;
    });

    // all ignoreIfModelingDisabled calls
    it('should ignore calls to contextPad.open when disabled', () => {
      contextPad.open();
      expect(originalContextPadOpen).not.toHaveBeenCalled();
    });

    it('should ignore calls to dragging.init when disabled', () => {
      dragging.init();
      expect(originalDraggingInit).not.toHaveBeenCalled();
    });

    it('should ignore calls to directEditing.activate when disabled', () => {
      directEditing.activate();
      expect(originalDirectEditingActivate).not.toHaveBeenCalled();
    });

    it('should ignore calls to moveCanvas.handleStart, handleMove, handleEnd when disabled', () => {
      moveCanvas.handleStart();
      moveCanvas.handleMove();
      moveCanvas.handleEnd();

      expect(originalMoveCanvasHandleStart).not.toHaveBeenCalled();
      expect(originalMoveCanvasHandleMove).not.toHaveBeenCalled();
      expect(originalMoveCanvasHandleEnd).not.toHaveBeenCalled();
    });

    // all throwIfModelingDisabled calls
    const throwEvents = [
      'moveShape',
      'updateAttachment',
      'moveElements',
      'moveConnection',
      'layoutConnection',
      'createConnection',
      'createShape',
      'createLabel',
      'appendShape',
      'removeElements',
      'distributeElements',
      'removeShape',
      'removeConnection',
      'replaceShape',
      'pasteElements',
      'alignElements',
      'createSpace',
      'updateWaypoints',
      'reconnectStart',
      'reconnectEnd'
    ];

    test.each(throwEvents)('should throw error on %s when disabled', (event) => {
      expect(() => {
        modeling[event]();
      }).toThrow('Model unsaved - please close the Script Editor and save the model first. Your work will not be lost');
    });

    // Editor actions
    const editorActionsIgnoreEvents = [
      'undo',
      'redo',
      'copy',
      'paste',
      'removeSelection',
      'spaceTool',
      'lassoTool',
      'globalConnectTool',
      'distributeElements',
      'alignElements',
      'directEditing',
      'activateHandtool',
      'toggleTokenSimulation',
      'resetTokenSimulation',
      'toggleTokenSimulationLog',
      'togglePauseTokenSimulation'
    ];

    test.each(editorActionsIgnoreEvents)('should ignore editorActions.%s when disabled', (action) => {
      editorActions.trigger(action);
      expect(originalEditorActionsTrigger).not.toHaveReturned();
    });

    it('should allow editorActions not in the blocked list', () => {
      editorActions.trigger('someAction');
      editorActions.trigger('someOtherAction');
      expect(originalEditorActionsTrigger).toHaveReturnedTimes(2);
    });
  });
});