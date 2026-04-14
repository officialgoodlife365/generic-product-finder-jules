const SourceModuleManager = require('../../src/services/source_modules/SourceModuleManager');
const db = require('../../src/db');

// Mock the DB module
jest.mock('../../src/db', () => ({
  query: jest.fn()
}));

describe('SourceModuleManager', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should load enabled modules from DB and execute tier 1', async () => {
    // Mock DB response
    db.query.mockResolvedValueOnce({
      rows: [
        { module_name: 'reddit', category: 'community_voice', tier: 1, enabled: true, config_json: {} }
      ]
    });

    const mockScanResult = [{ signal_id: '1', problem_name: 'test' }];

    // We mock the generic run mechanism.
    // The SourceModuleManager dynamically instantiates modules.
    const modules = await SourceModuleManager.getEnabledModules();
    expect(modules.length).toBe(1);
    expect(modules[0].moduleName).toBe('reddit');

    // To test runDiscoveryPhase1A, we inject a spy into the loaded module
    jest.spyOn(modules[0], 'scan').mockResolvedValue(mockScanResult);

    // We have to mock getEnabledModules to return our spied instances
    jest.spyOn(SourceModuleManager, 'getEnabledModules').mockResolvedValue(modules);

    db.query.mockResolvedValueOnce({}); // Mock the update query

    const results = await SourceModuleManager.runDiscoveryPhase1A(['test'], { frustration: ['test'] }, null);

    expect(results).toEqual(mockScanResult);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE source_registry'), expect.any(Array));
  });
});
