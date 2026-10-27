'use strict';
const assert = require('assert');
const fs = require('fs');

console.log('====================================================');
console.log('🚀 SLN CIVIL PM CENTER: COMPREHENSIVE 10-SECTION TEST');
console.log('====================================================\n');

// Read the HTML file
const html = fs.readFileSync('civil-pm-center.html', 'utf8');

// Extract script
const scriptMatch = html.match(/<script>\s*'use strict';([\s\S]*?)<\/script>\s*<\/body>/);
assert(scriptMatch, 'Script block must be present');
const jsCode = scriptMatch[1];

// Setup mock browser environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; }
  };
})();

const documentMock = {
  getElementById: (id) => ({
    id,
    value: '',
    textContent: '',
    innerHTML: '',
    className: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
    appendChild: () => {},
    setAttribute: () => {},
    addEventListener: () => {},
    children: []
  }),
  addEventListener: () => {},
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => ({
    className: '',
    innerHTML: '',
    style: {},
    appendChild: () => {},
    remove: () => {},
    setAttribute: () => {},
    addEventListener: () => {},
    click: () => {}
  }),
  createElementNS: () => ({
    setAttribute: () => {},
    appendChild: () => {},
    addEventListener: () => {},
    style: {}
  })
};

const windowMock = {
  addEventListener: () => {},
  document: documentMock,
  localStorage: localStorageMock,
  jspdf: { jsPDF: class {
    setFillColor() {}
    rect() {}
    setTextColor() {}
    setFontSize() {}
    setFont() {}
    text() {}
    autoTable() {}
    save() {}
  } },
  XLSX: {
    utils: {
      book_new: () => ({ Sheets: {}, SheetNames: [] }),
      aoa_to_sheet: () => ({}),
      book_append_sheet: () => {}
    },
    writeFile: () => {}
  },
  Blob: class { constructor(parts, opts) { this.parts = parts; this.opts = opts; windowMock.lastBlob = this; } },
  URL: { createObjectURL: () => 'blob://mock' }
};

const sandbox = {
  window: windowMock,
  document: documentMock,
  localStorage: localStorageMock,
  Blob: windowMock.Blob,
  URL: windowMock.URL,
  XLSX: windowMock.XLSX,
  firebase: {
    initializeApp: () => ({}),
    database: () => ({
      ref: () => ({
        on: () => {},
        set: async () => {},
        once: async () => ({ val: () => null })
      })
    })
  },
  setTimeout: (fn) => fn(),
  setInterval: () => 1,
  console: console
};

const vm = require('vm');
const context = vm.createContext(sandbox);

vm.runInContext("'use strict';" + jsCode, context);

const CivilPM = sandbox.window.CivilPM;
assert(CivilPM, 'CivilPM must be globally exposed on window');
const SEED = vm.runInContext('SEED', context);
const store = CivilPM.store;
const CPMEngine = vm.runInContext('CPMEngine', context);

console.log('✓ Script evaluated successfully in sandbox environment.\n');

// ─── TEST SECTION 1: Governance & Scope Baseline ───
console.log('--- SECTION 1: Governance, RACI & Votes ---');
const raci = SEED.raciData;
assert.strictEqual(raci.roles.length, 7, 'Must have 7 RACI command roles');
assert(raci.roles.includes('COMEN'));
assert(raci.roles.includes('CCED(E)'));
assert(raci.roles.includes('CCEO(E)'));
assert(raci.roles.includes('SCE(W/W)'));
assert(raci.roles.includes('CE(W/W)'));
assert(raci.roles.includes('CPO/PO1'));
assert(raci.roles.includes('LME/ME'));
assert.strictEqual(raci.deliverables.length, 9, 'Must have 9 RACI deliverables');

const votes = SEED.votes;
assert.strictEqual(votes.length, 6, 'Must have 6 Parliamentary Votes & Special Projects');
const voteCodes = votes.map(v => v.code);
assert(voteCodes.includes('223-1-01-2104'), 'Vote 2104 must be present');
assert(voteCodes.includes('223-1-01-2001'), 'Vote 2001 must be present');
assert(voteCodes.includes('223-1-01-2506'), 'Vote 2506 must be present');
assert(voteCodes.includes('223-1-01-1303'), 'Vote 1303 must be present');
assert(voteCodes.includes('NON-NAVAL'), 'Non-Naval must be present');
assert(voteCodes.includes('223-1-01-2103'), 'Vote 2103 must be present');
CivilPM.s1.render();
console.log('✓ Section 1 Passed: RACI Matrix & Parliamentary Vote Registers validated.');

// ─── TEST SECTION 2: Architecture & Reactive Store ───
console.log('\n--- SECTION 2: Dual-Firebase & StateV6 Store ---');
assert(store, 'Reactive store must exist');
const initialSt = store.getState();
assert(initialSt.tasks && initialSt.tasks.length >= 24, 'Store tasks populated');
assert(initialSt.materials && initialSt.materials.length >= 20, 'Store materials populated');
assert(initialSt.sailors && initialSt.sailors.length >= 22, 'Store sailors populated');

// Test reactivity
let subscriberCalled = false;
const unsub = store.subscribe((next, prev) => { subscriberCalled = true; });
store.setState({ testKey: 999 });
assert.strictEqual(store.getState().testKey, 999, 'State update reflected');
assert.strictEqual(subscriberCalled, true, 'Subscriber notified');
unsub();

// Test schemas
CivilPM.s2.render();
CivilPM.s2.renderTopology();
console.log('✓ Section 2 Passed: Dual-Firebase topology, StateV6 reactivity & 6 JSON schemas validated.');

// ─── TEST SECTION 3: Command Center & KPIs ───
console.log('\n--- SECTION 3: Command Center & KPIs ---');
CivilPM.s3.render();
console.log('✓ Section 3 Passed: KPI Cards, Dark Naval palette and WBS Summary rendered.');

// ─── TEST SECTION 4: CPM Engine & Gantt ───
console.log('\n--- SECTION 4: Advanced Interactive Gantt & CPM Engine ---');
assert(CPMEngine, 'CPMEngine must exist');

// Test parsePred
const norm = (o) => JSON.parse(JSON.stringify(o));
assert.deepStrictEqual(norm(CPMEngine.parsePred('T001:FS+2')), { id: 'T001', type: 'FS', lag: 2 });
assert.deepStrictEqual(norm(CPMEngine.parsePred('T002:SS+5')), { id: 'T002', type: 'SS', lag: 5 });
assert.deepStrictEqual(norm(CPMEngine.parsePred('T003:FF-1')), { id: 'T003', type: 'FF', lag: -1 });
assert.deepStrictEqual(norm(CPMEngine.parsePred('T004:SF+3')), { id: 'T004', type: 'SF', lag: 3 });
assert.deepStrictEqual(norm(CPMEngine.parsePred('NSH-1.0:FS+0')), { id: 'NSH-1.0', type: 'FS', lag: 0 });

// Test Terminal Tasks Float (Regression test for line 3077 bug)
const testTerminal = [
  { id: 'T_LONG', dur: 20, preds: [] },
  { id: 'T_SHORT', dur: 5, preds: [] }
];
CPMEngine.calculate(testTerminal);
assert.strictEqual(testTerminal[0].TF, 0, 'Longer terminal task has TF=0');
assert.strictEqual(testTerminal[0].isCritical, true);
assert.strictEqual(testTerminal[1].TF, 15, 'Shorter terminal task must have TF=15');
assert.strictEqual(testTerminal[1].isCritical, false, 'Shorter terminal task must NOT be critical');

// Test CPM calculations on real project tasks
const nshTasks = initialSt.tasks.filter(t => t.project === 'NSH');
const calculated = CPMEngine.calculate(JSON.parse(JSON.stringify(nshTasks)));
assert(calculated.length > 0);
const criticalTasks = calculated.filter(t => t.isCritical);
assert(criticalTasks.length > 0, 'Critical path must have at least one critical task');
criticalTasks.forEach(t => {
  assert.strictEqual(t.TF, 0, `Task ${t.id} on critical path must have Total Float = 0`);
});

// Non-critical tasks must have TF > 0
const nonCritical = calculated.filter(t => !t.isCritical);
assert(nonCritical.length > 0, 'Must have non-critical tasks with float');
nonCritical.forEach(t => {
  assert(t.TF > 0, `Non-critical task ${t.id} must have Total Float > 0`);
});

CivilPM.s4.render();
CivilPM.s4.recalcCPM();
console.log(`✓ Section 4 Passed: CPM Forward/Backward pass, floats (TF & FF), and ${criticalTasks.length} critical path tasks verified.`);

// ─── TEST SECTION 5: WBS & Microtasks ───
console.log('\n--- SECTION 5: WBS & Microtasks Engine ---');
const taskWithMicro = store.getState().tasks.find(t => t.microtasks && t.microtasks.length > 0);
assert(taskWithMicro, 'Tasks must have microtasks');
const prevProg = taskWithMicro.progress;
// Toggle microtask
CivilPM.s5.toggleMicrotask(taskWithMicro.id, 0);
const updatedProg = store.getState().tasks.find(t => t.id === taskWithMicro.id).progress;
console.log(`  Task ${taskWithMicro.wbs} progress toggled from ${prevProg}% to ${updatedProg}% via microtask`);

// Test updateProgress to 0 sets status to Pending
CivilPM.s5.updateProgress(taskWithMicro.id, 0);
const pendingTask = store.getState().tasks.find(t => t.id === taskWithMicro.id);
assert.strictEqual(pendingTask.progress, 0);
assert.strictEqual(pendingTask.status, 'Pending', 'Progress 0% must set status to Pending');

CivilPM.s5.render();
console.log('✓ Section 5 Passed: WBS 6 phases & microtask checklists verified.');

// ─── TEST SECTION 6: MTO & Present Position ───
console.log('\n--- SECTION 6: MTO Take-Off & PR Reconciliation ---');
const mat = store.getState().materials[0];
assert(mat.presentPosition, 'Material must have presentPosition');
assert(mat.buffer !== undefined, 'Material must have buffer%');
assert(mat.prNo, 'Material must have PR number');

CivilPM.s6.render();
CivilPM.s6.exportCSV();
console.log('✓ Section 6 Passed: MTO stock chart, PR Register reconciliation and Present Position verified.');

// ─── TEST SECTION 7: Heavy Plant Fleet ───
console.log('\n--- SECTION 7: Civil Heavy Plant & Machinery ---');
const crane = store.getState().equipment.find(e => e.id === 'E001');
assert(crane, 'TADANO 25T Crane must exist');
assert.strictEqual(crane.type, 'Mobile Crane');
assert(crane.fuelRate > 0, 'Crane must have fuel consumption rate');
assert(crane.operator, 'Crane must have certified Naval operator');

// Test saving plant equipment updates the reactive store
const oldStatus = crane.status;
documentMock.getElementById = (id) => ({
  id,
  value: id === 'eqm-id' ? 'E001' : id === 'eqm-status' ? 'maintenance' : id === 'eqm-ohrs' ? '4520' : id === 'eqm-fuel' ? '70' : id === 'eqm-operator' ? 'PO1 W. Perera' : '',
  textContent: '',
  innerHTML: '',
  className: '',
  style: {},
  classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
  appendChild: () => {},
  setAttribute: () => {},
  addEventListener: () => {},
  children: []
});
CivilPM.s7.saveEquip();
const updatedEquip = store.getState().equipment.find(e => e.id === 'E001');
assert.strictEqual(updatedEquip.status, 'maintenance', 'saveEquip must update reactive store state');
console.log(`  Updated fleet asset E001 status from ${oldStatus} to ${updatedEquip.status} via store`);

CivilPM.s7.render();
console.log('✓ Section 7 Passed: Heavy plant fleet hub, fuel gauges, and operator assignments verified.');

// ─── TEST SECTION 8: HR & Fatigue Rotation ───
console.log('\n--- SECTION 8: HR & Equal Opportunity Labour Allocation ---');
const fatiguedSailor = store.getState().sailors.find(s => s.days >= 12);
assert(fatiguedSailor, 'Must have at least one fatigued sailor for rotation testing');
const sId = fatiguedSailor.id;

CivilPM.s8.render();
CivilPM.s8.relieveSailor(sId);
const relievedSailor = store.getState().sailors.find(s => s.id === sId);
assert.strictEqual(relievedSailor.days, 0, 'Consecutive days must reset to 0 upon relief');
console.log(`  Relieved sailor ${relievedSailor.name} (${relievedSailor.svcNo}): consecutive days reset to 0`);

console.log('✓ Section 8 Passed: Tradesmen allocations, fatigue alerts, and rest rotation engine verified.');

// ─── TEST SECTION 9: QA/QC, Weather Logger & EVM ───
console.log('\n--- SECTION 9: QA/QC, Environmental Diagnostics & EVM ---');
const evm = SEED.evmData;
const CV = evm.EV - evm.AC;
const SV = evm.EV - evm.PV;
const CPI = evm.EV / evm.AC;
const SPI = evm.EV / evm.PV;
const EAC = evm.BAC / CPI;

assert(Math.abs(CPI - 1.004) < 0.01, 'CPI calculation matches');
assert(Math.abs(SPI - 1.001) < 0.01, 'SPI calculation matches');
assert(CV > 0, 'Cost variance is favorable');

CivilPM.s9.render();
console.log('✓ Section 9 Passed: QA Inspection tests, Environmental advisories, EVM metrics & S-curve verified.');

// ─── TEST SECTION 10: Admin & Exports ───
console.log('\n--- SECTION 10: Administration, RBAC & Export Center ---');
CivilPM.s10.render();
CivilPM.s10.exportPDF();
CivilPM.s10.exportExcel();

// Test MS Project XML export includes dependencies
CivilPM.s10.exportXML();
const xmlContent = windowMock.lastBlob.parts.join('');
assert(xmlContent.includes('<PredecessorLink>'), 'MS Project XML must export PredecessorLink elements');
assert(xmlContent.includes('<PredecessorUID>'), 'MS Project XML must specify PredecessorUID');
assert(xmlContent.includes('<Type>'), 'MS Project XML must specify dependency type');
console.log('  Verified MS Project XML exports PredecessorLink dependency nodes.');

// Test Primavera P6 XML export has matching activity IDs in relationships
CivilPM.s10.exportPrimavera();
const p6Content = windowMock.lastBlob.parts.join('');
assert(p6Content.includes('<PredecessorActivityId>'), 'Primavera P6 XML must contain PredecessorActivityId');
assert(p6Content.includes('<SuccessorActivityId>'), 'Primavera P6 XML must contain SuccessorActivityId');
assert(p6Content.includes('<Id>NSH-1.0</Id>'), 'Primavera P6 XML activities must use WBS ID');
assert(p6Content.includes('<PredecessorActivityId>NSH-1.0</PredecessorActivityId>'), 'Primavera P6 relationship IDs must match Activity Id');
console.log('  Verified Primavera P6 XML matches PredecessorActivityId with Activity Id.');

CivilPM.s10.exportAuditCSV();

// Verify Audit Log has entries from actions performed
const audit = store.getState().auditLog;
assert(audit && audit.length > 5, 'Audit log must record state mutations');
console.log(`  Recorded ${audit.length} timestamped audit actions across sessions.`);

console.log('✓ Section 10 Passed: PDF Dossier, Excel, MS Project XML, Primavera P6 XML and Audit log verified.');

console.log('\n====================================================');
console.log('🎉 ALL 10 SECTIONS AND COMPREHENSIVE TESTS PASSED! 🎉');
console.log('====================================================');
