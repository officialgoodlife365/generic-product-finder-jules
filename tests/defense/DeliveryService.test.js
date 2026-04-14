const DeliveryService = require('../../src/services/defense/DeliveryService');

describe('DeliveryService', () => {

  describe('hasTierAccess', () => {
    it('grants access if user tier is greater than or equal to required tier', () => {
      expect(DeliveryService.hasTierAccess('subscription', 'OTO1')).toBe(true);
      expect(DeliveryService.hasTierAccess('OTO1', 'OTO1')).toBe(true);
      expect(DeliveryService.hasTierAccess('OTO1', 'FE')).toBe(true);
    });

    it('denies access if user tier is lower than required tier', () => {
      expect(DeliveryService.hasTierAccess('FE', 'OTO1')).toBe(false);
      expect(DeliveryService.hasTierAccess('OTO2', 'subscription')).toBe(false);
    });

    it('handles unknown tiers safely', () => {
      expect(DeliveryService.hasTierAccess('UNKNOWN', 'FE')).toBe(false);
    });
  });

  describe('calculateDripAccess', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2023-10-15T00:00:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('unlocks only core content on day 0', () => {
      const access = DeliveryService.calculateDripAccess('2023-10-15T00:00:00Z');
      expect(access.core).toBe(true);
      expect(access.bonus).toBe(false);
      expect(access.advanced).toBe(false);
    });

    it('unlocks core and bonus on day 3', () => {
      const access = DeliveryService.calculateDripAccess('2023-10-12T00:00:00Z');
      expect(access.bonus).toBe(true);
      expect(access.advanced).toBe(false);
    });

    it('unlocks all on day 15', () => {
      const access = DeliveryService.calculateDripAccess('2023-10-01T00:00:00Z');
      expect(access.core).toBe(true);
      expect(access.premium).toBe(true);
    });

    it('returns false for everything if no date provided', () => {
      const access = DeliveryService.calculateDripAccess(null);
      expect(access.core).toBe(false);
    });
  });

  describe('generateWatermarkStamp', () => {
    it('generates a string with email and txn', () => {
      const stamp = DeliveryService.generateWatermarkStamp('test@test.com', 'txn_123');
      expect(stamp).toContain('test@test.com');
      expect(stamp).toContain('txn_123');
    });

    it('returns null if arguments are missing', () => {
      expect(DeliveryService.generateWatermarkStamp()).toBeNull();
    });
  });

});
