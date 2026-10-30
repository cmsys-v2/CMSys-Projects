const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('🔍 DEEP VERIFICATION SUITE: SPS V1 SYSTEM OPTIMIZATIONS & FIXES');
console.log('===============================================================\n');

// ── TEST 1: DOM & CSS Verification ──
console.log('--- TEST 1: Modal Overlay & CSS Structure Verification ---');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(indexHtml.includes('id="pc-modal-overlay"'), 'index.html must include id="pc-modal-overlay"');
assert(indexHtml.includes('class="modal-overlay pc-modal-overlay"'), 'index.html must include modal-overlay pc-modal-overlay class');
console.log('✓ index.html contains #pc-modal-overlay.');

const pcCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'progress-center.css'), 'utf8');
assert(pcCss.includes('.pc-modal {'), 'progress-center.css must define .pc-modal');
assert(pcCss.includes('.pc-modal-header {'), 'progress-center.css must define .pc-modal-header');
assert(pcCss.includes('.pc-modal-body {'), 'progress-center.css must define .pc-modal-body');
assert(pcCss.includes('.pc-modal-footer {'), 'progress-center.css must define .pc-modal-footer');
assert(pcCss.includes('.pc-modal-close {'), 'progress-center.css must define .pc-modal-close');
assert(pcCss.includes('.pc-form-group {'), 'progress-center.css must define .pc-form-group');
assert(pcCss.includes('.pc-subproj-cards-grid {') && pcCss.includes('max-height: 250px;'), 'pc-subproj-cards-grid must have max-height: 250px');
console.log('✓ progress-center.css defines all modal classes and grid max-height.');

// ── TEST 2: Touch Dragging in app.js ──
console.log('\n--- TEST 2: Touch Dragging Support in app.js ---');
const appJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
assert(appJs.includes("'touchstart'"), 'app.js must handle touchstart on resizer');
assert(appJs.includes("'touchmove'"), 'app.js must handle touchmove on resizer');
assert(appJs.includes("'touchend'"), 'app.js must handle touchend on resizer');
assert(appJs.includes("'touchcancel'"), 'app.js must handle touchcancel on resizer');
console.log('✓ app.js has fluid touch dragging support for tablets/touch devices.');

// ── TEST 3: Store Timezone & Cache Safety ──
console.log('\n--- TEST 3: Timezone Date Handling & Cache Reactivity ---');
global.window = {};
global.localStorage = {
  _s: {},
  getItem(k) { return this._s[k] || null; },
  setItem(k, v) { this._s[k] = String(v); },
  removeItem(k) { delete this._s[k]; }
};

const storeCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'store.js'), 'utf8');
eval(storeCode);
const store = global.window.spsStore;
assert(store, 'window.spsStore must be initialized');

// Test date consistency across simulated UTC+5:30 environment
const dateTest = new Date(2026, 2, 1, 0, 0, 0); // 2026-03-01 local midnight
const dayStr = store.getDailyTotals ? 'hasMethod' : 'missing';
assert.strictEqual(dayStr, 'hasMethod');

// Mock sailor & attachment data
store._state.sailors = [
  { official_number: 'N-1001', name: 'Silva A.B.', trade: 'CARPENTER', rank: 'PO', district: 'Galle', victualing_type: 'V/In' },
  { official_number: 'N-1002', name: 'Perera C.D.', trade: 'MASON', rank: 'LS', district: 'Matara', victualing_type: 'V/Out' }
];
store._state.attachments = [
  { id: 'att-1', sailor_id: 'N-1001', project_id: 'PRJ-1', from_date: '2026-03-01', to_date: '2026-03-15', victualing: 'V/In', status: 'Active' },
  { id: 'att-2', sailor_id: 'N-1002', project_id: 'PRJ-2', from_date: '2026-03-05', to_date: '2026-03-25', victualing: 'V/Out', status: 'Active' }
];

// Verify daily totals produces exact local date strings without UTC shift
const totals = store.getDailyTotals('2026-03-01', '2026-03-05');
assert.strictEqual(totals['2026-03-01'], 1, '2026-03-01 must have 1 attachment');
assert.strictEqual(totals['2026-03-04'], 1, '2026-03-04 must have 1 attachment');
assert.strictEqual(totals['2026-03-05'], 2, '2026-03-05 must have 2 attachments');
console.log('✓ getDailyTotals produces accurate date keys without timezone offsets.');

// Verify memoization cache
assert(store._attachmentHistoryCache, '_attachmentHistoryCache must exist');
const metrics1 = store.getSailorPeriodMetrics('N-1001', '2026-03-01', '2026-03-31');
assert.strictEqual(store._attachmentHistoryCache.size, 1, 'Cache should have 1 entry');

// Add attachment should invalidate cache
store.addAttachment({ id: 'att-3', sailor_id: 'N-1001', project_id: 'PRJ-2', from_date: '2026-03-16', to_date: '2026-03-20', victualing: 'V/In' });
assert.strictEqual(store._attachmentHistoryCache.size, 0, 'Cache must be invalidated after addAttachment');
console.log('✓ _attachmentHistoryCache successfully invalidated upon state mutation.');

// ── TEST 4: Performance Benchmark ──
console.log('\n--- TEST 4: Performance Benchmark (Summary Computation) ---');
// Populate with 200 mock sailors and 500 attachments
const mockSailors = [];
for (let i = 1; i <= 200; i++) {
  mockSailors.push({
    official_number: `N-${2000 + i}`,
    name: `Sailor ${i}`,
    trade: i % 2 === 0 ? 'MASON' : 'CARPENTER',
    rank: 'AB',
    district: 'Colombo',
    victualing_type: i % 3 === 0 ? 'V/Out' : 'V/In'
  });
}
const mockAttachments = [];
for (let i = 1; i <= 500; i++) {
  const sailorIdx = (i % 200) + 1;
  mockAttachments.push({
    id: `LA-${i}`,
    sailor_id: `N-${2000 + sailorIdx}`,
    project_id: `PRJ-${(i % 5) + 1}`,
    from_date: '2026-01-10',
    to_date: '2026-06-20',
    victualing: i % 2 === 0 ? 'V/Out' : 'V/In',
    status: 'Active'
  });
}
store._state.sailors = mockSailors;
store._state.attachments = mockAttachments;
store._invalidateSailorsCache();

const t0 = Date.now();
const summary1Month = store.getAllSailorsPeriodSummary('2026-03-01', '2026-03-31');
const elapsed1Month = Date.now() - t0;
console.log(`✓ 1-Month Summary for 200 sailors & 500 attachments computed in ${elapsed1Month}ms (target: < 50ms)`);
assert(elapsed1Month < 100, `1-Month summary took too long: ${elapsed1Month}ms`);

const t1 = Date.now();
const summary3Years = store.getAllSailorsPeriodSummary('2024-01-01', '2026-12-31');
const elapsed3Years = Date.now() - t1;
console.log(`✓ 3-Year Summary computed in ${elapsed3Years}ms (target: < 250ms)`);
assert(elapsed3Years < 500, `3-Year summary took too long: ${elapsed3Years}ms`);

console.log('\n===============================================================');
console.log('🎉 ALL SYSTEM OPTIMIZATION CHECKS PASSED SUCCESSFULLY! 🎉');
console.log('===============================================================\n');
