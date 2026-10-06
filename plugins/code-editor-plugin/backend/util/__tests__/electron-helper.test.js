import { buildMenuItems, displayNotification, emitEvent, showDialog } from '../electron-helpers';

jest.mock('../../lib/linting-server', () => ({
  LintingServer: {
    getInstance: jest.fn(() => ({
      getStatus: jest.fn(() => ({ status: 'running' }))
    }))
  }
}));

describe('electron-helper', () => {
  let mockApp;
  beforeEach(() => {
    mockApp = {
      emit: jest.fn()
    };
  });

  it('should call emitEvent correctly', () => {
    const type = 'CUSTOM_EVENT';
    const payload = { data: 'test' };

    emitEvent(mockApp, type, payload);

    expect(mockApp.emit).toHaveBeenCalledTimes(1);
    expect(mockApp.emit).toHaveBeenCalledWith('menu:action', 'emit-event', {
      type,
      payload
    });
  });

  it('should call showDialog correctly', () => {
    const options = { title: 'Confirmation', message: 'Are you sure?' };

    showDialog(mockApp, options);

    expect(mockApp.emit).toHaveBeenCalledTimes(1);
    expect(mockApp.emit).toHaveBeenCalledWith('menu:action', 'show-dialog', options);
  });

  it('should call displayNotification correctly', () => {
    const options = { title: 'Confirmation', content: 'Are you sure?' };

    displayNotification(mockApp, options);

    expect(mockApp.emit).toHaveBeenCalledTimes(1);
    expect(mockApp.emit).toHaveBeenCalledWith('menu:action', 'display-notification', options);
  });

  it('should return the correct menu items', () => {
    const menuItems = buildMenuItems(mockApp);

    expect(menuItems).toHaveLength(2);
    expect(menuItems[0].label).toBe('Toggle CodeEditor');
    expect(typeof menuItems[0].action).toBe('function');

    menuItems[0].action();
    expect(mockApp.emit).toHaveBeenCalledTimes(1);
    expect(mockApp.emit).toHaveBeenCalledWith('menu:action', 'toggleCodeEditor');

    expect(menuItems[1].label).toBe('Show Linting Server Status');
    expect(typeof menuItems[1].action).toBe('function');

    menuItems[1].action();
    expect(mockApp.emit).toHaveBeenCalledTimes(2);
    expect(mockApp.emit).toHaveBeenCalledWith('menu:action', 'emit-event', { type: 'lintingServer.status', payload: { status: 'running' } });
  });
});