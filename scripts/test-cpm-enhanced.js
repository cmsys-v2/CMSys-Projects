'use strict';
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

// Extract real JS from civil-pm-center.html
const html = fs.readFileSync('civil-pm-center.html', 'utf8');
const scriptMatch = html.match(/<script>\s*'use strict';([\s\S]*?)<\/script>\s*<\/body>/);
assert(scriptMatch, 'Script block must be present');

const context = vm.createContext({
  window: {},
  document: { getElementById: () => ({ addEventListener: () => {}, innerHTML: '', querySelectorAll: () => [] }), addEventListener: () => {} },
  localStorage: { getItem: () => null, setItem: () => {} },
  console
});
vm.runInContext("'use strict';" + scriptMatch[1], context);

// Test REAL CPMEngine extracted from civil-pm-center.html
const CPMEngine = vm.runInContext('CPMEngine', context);
assert(CPMEngine, 'CPMEngine must exist in civil-pm-center.html');

console.log('Testing REAL CPMEngine from civil-pm-center.html...');

const norm = (obj) => JSON.parse(JSON.stringify(obj));

// 1. parsePred tests
console.log('Testing CPMEngine parsePred...');
assert.deepStrictEqual(norm(CPMEngine.parsePred('T001')), { id: 'T001', type: 'FS', lag: 0 });
assert.deepStrictEqual(norm(CPMEngine.parsePred('T001:FS+3')), { id: 'T001', type: 'FS', lag: 3 });
assert.deepStrictEqual(norm(CPMEngine.parsePred('T001:SS+5')), { id: 'T001', type: 'SS', lag: 5 });
assert.deepStrictEqual(norm(CPMEngine.parsePred('T001:FF-2')), { id: 'T001', type: 'FF', lag: -2 });
assert.deepStrictEqual(norm(CPMEngine.parsePred('T001:SF+1')), { id: 'T001', type: 'SF', lag: 1 });
console.log('✓ parsePred tests passed.');

// 2. Standard FS chain
console.log('Testing CPMEngine with standard FS chain...');
const tasksFS = [
  { id: 'T1', dur: 10, preds: [] },
  { id: 'T2', dur: 15, preds: ['T1'] },
  { id: 'T3', dur: 5,  preds: ['T2'] }
];
CPMEngine.calculate(tasksFS);
assert.strictEqual(tasksFS[0].ES, 0);
assert.strictEqual(tasksFS[0].EF, 10);
assert.strictEqual(tasksFS[1].ES, 10);
assert.strictEqual(tasksFS[1].EF, 25);
assert.strictEqual(tasksFS[2].ES, 25);
assert.strictEqual(tasksFS[2].EF, 30);
assert(tasksFS.every(t => t.isCritical), 'All tasks in single sequential chain should be critical');
console.log('✓ Standard FS chain passed.');

// 3. Complex dependencies (SS, FF, lag)
console.log('Testing CPMEngine with SS, FF, and lag...');
const complexTasks = [
  { id: 'M1', dur: 8, preds: [] },
  { id: 'M2', dur: 12, preds: ['M1:SS+2'] }, // starts at 2, finishes at 14
  { id: 'M3', dur: 4, preds: ['M1:FF+1'] },  // finishes at >= 9, dur 4 => ES >= 5
  { id: 'M4', dur: 6, preds: ['M2:FS+0', 'M3:FS+0'] } // starts at max(14, 9)=14, finishes at 20
];
CPMEngine.calculate(complexTasks);
assert.strictEqual(complexTasks[0].ES, 0);
assert.strictEqual(complexTasks[1].ES, 2);
assert.strictEqual(complexTasks[1].EF, 14);
assert.strictEqual(complexTasks[3].ES, 14);
assert.strictEqual(complexTasks[3].EF, 20);
assert.strictEqual(complexTasks[1].isCritical, true);
console.log('✓ Complex dependencies (SS, FF, lag) passed.');

// 4. Critical test: Terminal tasks with no successors float calculation
console.log('Testing CPMEngine terminal tasks with no successors...');
const terminalTasks = [
  { id: 'CRIT_PATH', dur: 20, preds: [] },
  { id: 'SHORT_PATH', dur: 5, preds: [] }
];
CPMEngine.calculate(terminalTasks);
assert.strictEqual(terminalTasks[0].EF, 20);
assert.strictEqual(terminalTasks[0].LF, 20);
assert.strictEqual(terminalTasks[0].TF, 0, 'Longer task must be critical (TF = 0)');
assert.strictEqual(terminalTasks[0].isCritical, true);

assert.strictEqual(terminalTasks[1].EF, 5);
assert.strictEqual(terminalTasks[1].LF, 20, 'Terminal task LF must equal project completion date');
assert.strictEqual(terminalTasks[1].TF, 15, 'Shorter parallel task must have TF = LF - EF = 15');
assert.strictEqual(terminalTasks[1].isCritical, false, 'Shorter parallel task must NOT be critical');
console.log('✓ Terminal tasks float calculation passed (TF = 15 for non-critical, 0 for critical).');

// 5. Predecessors referenced by WBS code
console.log('Testing CPMEngine with WBS code references...');
const wbsTasks = [
  { id: 'T_A', wbs: 'PH-1.0', dur: 10, preds: [] },
  { id: 'T_B', wbs: 'PH-2.0', dur: 15, preds: ['PH-1.0:FS+2'] }
];
CPMEngine.calculate(wbsTasks);
assert.strictEqual(wbsTasks[1].ES, 12, 'Task B should start at 10 + 2 = 12 using WBS reference');
assert.strictEqual(wbsTasks[1].EF, 27);
console.log('✓ Predecessors referenced by WBS code passed.');

// 6. Circular dependency detection
console.log('Testing CPMEngine circular dependency detection...');
const cycleTasks = [
  { id: 'LOOP_A', dur: 5, preds: ['LOOP_B'] },
  { id: 'LOOP_B', dur: 5, preds: ['LOOP_A'] }
];
CPMEngine.calculate(cycleTasks);
assert.strictEqual(CPMEngine.hasCycle, true, 'Kahn topological sort must detect cycle and set hasCycle = true');
console.log('✓ Circular dependency detection passed.');

console.log('\n=======================================');
console.log('ALL REAL CPM ENGINE TESTS PASSED! ✓');
console.log('=======================================');
