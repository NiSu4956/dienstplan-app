// Security Check Script
const criticalFunctions = [
    'urlaubsanzeige', 'vacation', 'holiday', 
    'login', 'save', 'load', 'submit',
    'handleApproveRequest', 'handleRejectRequest',
    'onSubmitRequest', 'createShift', 'updateShift'
];

// Erweiterte Überprüfungsfunktion
function checkFunction(func) {
    try {
        if (typeof window[func] === 'function') {
            console.log(`✅ ${func} exists`);
            return true;
        } else {
            console.error(`❌ ${func} MISSING!`);
            return false;
        }
    } catch (error) {
        console.error(`⚠️ Error checking ${func}:`, error);
        return false;
    }
}

// Überprüfe alle kritischen Funktionen
function runSecurityCheck() {
    console.log('🔍 Starting Security Check...');
    console.log('----------------------------------------');
    
    const results = criticalFunctions.map(func => ({
        name: func,
        exists: checkFunction(func)
    }));
    
    console.log('----------------------------------------');
    const missingFunctions = results.filter(r => !r.exists);
    
    if (missingFunctions.length === 0) {
        console.log('🎉 All critical functions are present!');
    } else {
        console.warn(`⚠️ Missing ${missingFunctions.length} critical functions:`);
        missingFunctions.forEach(f => console.warn(`   - ${f.name}`));
    }
    
    return results;
}

// Export für manuelle Tests
export { runSecurityCheck, checkFunction };

// Automatische Ausführung nur im Browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('load', () => {
        console.log('🛡️ Running security check on page load...');
        runSecurityCheck();
    });
} 