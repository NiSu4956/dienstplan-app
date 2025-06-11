import { runSecurityCheck, checkFunction } from './security-check';

describe('Security Check Tests', () => {
    // Mock window object
    const originalWindow = global.window;
    
    beforeEach(() => {
        // Reset window mock before each test
        global.window = {
            ...originalWindow,
            // Add some test functions
            login: () => {},
            save: () => {},
            handleApproveRequest: () => {},
            handleRejectRequest: () => {}
        };
    });

    afterEach(() => {
        // Restore original window
        global.window = originalWindow;
    });

    test('checkFunction detects existing functions', () => {
        expect(checkFunction('login')).toBe(true);
        expect(checkFunction('save')).toBe(true);
    });

    test('checkFunction detects missing functions', () => {
        expect(checkFunction('nonexistent')).toBe(false);
    });

    test('runSecurityCheck returns correct results', () => {
        const results = runSecurityCheck();
        expect(Array.isArray(results)).toBe(true);
        expect(results.length).toBeGreaterThan(0);
        
        // Check that results contain expected properties
        results.forEach(result => {
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('exists');
        });
    });
}); 