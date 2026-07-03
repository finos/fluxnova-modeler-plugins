import { CODE_EDITOR_CONFIG, QUIT, APP_CLIENT_READY } from '../../shared-util/constants';

jest.mock('../lib/codenarc', () => ({ lintGroovy: jest.fn() }));
jest.mock('../lib/eslint');
jest.mock('../lib/linting-server');
jest.mock('../util/electron-helpers');
jest.mock('../../shared-util/logger');

const SERVER_URL = 'ws://localhost:8080';

describe('main.js', () => {
  let mockApp, mockLintingServer;
  let LintingServer;
  let buildMenuItems, emitEvent, showDialog;
  let Logger;

  const getHandler = (event) => mockApp.on.mock.calls.find(([ e ]) => e === event)?.[1];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    mockApp = { on: jest.fn(), emit: jest.fn() };
    mockLintingServer = { start: jest.fn().mockResolvedValue(SERVER_URL) };

    ({ LintingServer } = require('../lib/linting-server'));
    ({ buildMenuItems, emitEvent, showDialog } = require('../util/electron-helpers'));
    Logger = require('../../shared-util/logger');

    jest.spyOn(LintingServer, 'getInstance').mockReturnValue(mockLintingServer);
    jest.spyOn(LintingServer, 'deleteInstance').mockResolvedValue(undefined);
    buildMenuItems.mockReturnValue([ { label: 'Test Menu' } ]);

    const main = require('../main');
    main(mockApp);
  });

  afterEach(() => jest.clearAllMocks());

  it('should register QUIT and APP_CLIENT_READY listeners', () => {
    expect(mockApp.on).toHaveBeenCalledWith(QUIT, expect.any(Function));
    expect(mockApp.on).toHaveBeenCalledWith(APP_CLIENT_READY, expect.any(Function));
  });

  it('should start linting server, emit config and build menus on APP_CLIENT_READY', async () => {
    await getHandler(APP_CLIENT_READY)();

    expect(LintingServer.getInstance).toHaveBeenCalledTimes(1);
    expect(mockLintingServer.start).toHaveBeenCalledTimes(1);
    expect(emitEvent).toHaveBeenCalledWith(mockApp, CODE_EDITOR_CONFIG, {
      lintingServerUrl: SERVER_URL,
    });
    expect(buildMenuItems).toHaveBeenCalledWith(mockApp);
    expect(Logger.info).toHaveBeenCalledWith(`Linting server ready at ${SERVER_URL}`);
  });

  it('should show error dialog when linting server fails to start', async () => {
    const error = new Error('Server failed to start');
    mockLintingServer.start.mockRejectedValue(error);

    await getHandler(APP_CLIENT_READY)();

    expect(Logger.error).toHaveBeenCalledWith('Failed to start linting server:', error);
    expect(showDialog).toHaveBeenCalledWith(mockApp, {
      title: 'Failed to start to Linting Server',
      type: 'error',
      message: 'Server failed to start',
    });
  });

  it('should stop the linting server on QUIT', async () => {
    await getHandler(QUIT)();

    expect(Logger.info).toHaveBeenCalledWith('Stopping linting server');
    expect(LintingServer.deleteInstance).toHaveBeenCalledTimes(1);
  });
});
