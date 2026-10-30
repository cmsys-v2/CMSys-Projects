/**
 * Test Suite: Component Sub-Projects Architecture & Combined Projects Portfolio Hub
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('🚀 TESTING COMPONENT SUB-PROJECTS & COMBINED PROJECTS PORTFOLIO');
console.log('===============================================================\n');

// 1. Verify CSS rules
console.log('--- TEST 1: CSS Rules for Sub-Projects Hub ---');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'progress-center.css'), 'utf8');
assert(css.includes('.pc-badge-combined'), 'progress-center.css must have .pc-badge-combined');
assert(css.includes('.pc-subproj-hub'), 'progress-center.css must have .pc-subproj-hub');
assert(css.includes('.pc-subproj-cards-grid'), 'progress-center.css must have .pc-subproj-cards-grid');
assert(css.includes('.pc-subproj-card'), 'progress-center.css must have .pc-subproj-card');
assert(css.includes('.pc-subproj-chip'), 'progress-center.css must have .pc-subproj-chip');
assert(css.includes('.pc-subproj-filter-banner'), 'progress-center.css must have .pc-subproj-filter-banner');
console.log('✓ All CSS classes for Sub-Projects Hub verified.');

// 2. Functional Sandbox Simulation
console.log('\n--- TEST 2: Functional Sandbox Simulation ---');
global.window = {};
global.document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};
global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; }
};

// Evaluate progress-center.js
const pcCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'progress-center.js'), 'utf8');
eval(pcCode);

const pc = global.window.progressCenter;
assert(pc, 'window.progressCenter must exist');

// Mock Floating Dock project
const mockFloatingDock = {
  id: 'NP-020',
  code: 'NP-VOTE2231012506-020',
  name: 'FLOATING DOCK SLNS DOCKYARD',
  voteNumber: 'VOTE 223-1-01-2506',
  voteAllocation: 120000000,
  committed: 45000000,
  actualSpent: 22000000,
  projectOfficer: 'Capt. K. Senanayake',
  status: 'Active',
  startDate: '2025-01-01',
  endDate: '2026-06-30'
};

const detailedData = pc.getProjectDetailedData(mockFloatingDock);
assert(detailedData, 'Detailed data must be generated');
assert(Array.isArray(detailedData.subProjects), 'detailedData must contain subProjects array');
assert.strictEqual(detailedData.subProjects.length, 5, 'Floating Dock must have 5 component sub-projects');

console.log(`✓ Floating Dock component sub-projects generated (${detailedData.subProjects.length} sub-projects):`);
detailedData.subProjects.forEach(sp => {
  console.log(`  - [${sp.code}] ${sp.name} | Rs. ${(sp.budget/1000000).toFixed(1)}M | ${sp.progress}% (${sp.status})`);
  assert(sp.code, 'Sub-project must have code');
  assert(sp.name, 'Sub-project must have name');
  assert(sp.budget > 0, 'Sub-project must have budget');
  assert(sp.officer, 'Sub-project must have officer');
  assert(sp.color, 'Sub-project must have color');
});

// 3. Verify task mapping to sub-projects
console.log('\n--- TEST 3: WBS Tasks Mapping to Sub-Projects ---');
const tasksWithSp = detailedData.tasks.filter(t => t.sub_project_code);
assert(tasksWithSp.length > 0, 'Tasks must be mapped to sub-projects');
console.log(`✓ All ${tasksWithSp.length} WBS tasks linked to component sub-projects.`);

// 4. Verify Sub-Projects Hub HTML Rendering
console.log('\n--- TEST 4: Sub-Projects Hub HTML Rendering ---');
const hubHtml = pc._renderSubProjectsHub(detailedData.subProjects, mockFloatingDock);
assert(hubHtml.includes('pc-subproj-hub'), 'HTML must contain pc-subproj-hub container');
assert(hubHtml.includes('SP-01'), 'HTML must contain SP-01');
assert(hubHtml.includes('SP-05'), 'HTML must contain SP-05');
assert(hubHtml.includes('Master Combined View'), 'HTML must contain Master Combined View pill');
assert(hubHtml.includes('Add Sub-Project'), 'HTML must contain Add Sub-Project button');
console.log('✓ Sub-Projects Hub HTML markup rendered successfully.');

// 5. Verify Sub-Project Filtering Logic
console.log('\n--- TEST 5: Sub-Project Filtering & View Visibility ---');
pc.getSelectedProject = () => mockFloatingDock;

// Test filter to SP-01
pc.filterSubProject('NP-020_sp1');
assert.strictEqual(pc.activeSubProjectId, 'NP-020_sp1', 'Active subproject should be NP-020_sp1');

const sp1Tasks = pc.getVisibleTasks(detailedData.tasks);
assert(sp1Tasks.length > 0 && sp1Tasks.length < detailedData.tasks.length, 'SP-01 visible tasks should be a filtered subset');
console.log(`✓ Filtered to SP-01: ${sp1Tasks.length} tasks visible out of ${detailedData.tasks.length} total.`);

// Test clear filter
pc.filterSubProject(null);
assert.strictEqual(pc.activeSubProjectId, null, 'Active subproject should be cleared to null');
const allVisible = pc.getVisibleTasks(detailedData.tasks);
assert.strictEqual(allVisible.length, detailedData.tasks.length, 'All tasks visible when filter is cleared');
console.log(`✓ Cleared filter: all ${allVisible.length} tasks visible.`);

// 6. Verify WBS HTML includes Sub-Project Chips & Banner
console.log('\n--- TEST 6: WBS Rows & Sub-Project Chip Rendering ---');
pc.filterSubProject('NP-020_sp1');
const wbsHtml = pc._renderWbsRows(detailedData.tasks);
assert(wbsHtml.includes('pc-subproj-filter-banner'), 'WBS HTML must show filter banner when filtered');
assert(wbsHtml.includes('SP-01'), 'WBS HTML must render SP-01 chip');
console.log('✓ WBS rows render sub-project chips and filter banner.');

// ── TEST 7: Gantt Bar Sub-Project Chip Rendering ──
console.log('\n--- TEST 7: Gantt Bar Sub-Project Chip Rendering ---');
const ganttContainer = { innerHTML: '', style: {} };
global.document.getElementById = (id) => {
  if (id === 'pc-gantt-timeline-inner') return ganttContainer;
  return null;
};
pc.renderGanttTimeline();
assert(ganttContainer.innerHTML.includes('pc-subproj-chip'), 'Gantt timeline bars must include pc-subproj-chip elements');
assert(ganttContainer.innerHTML.includes('SP-01'), 'Gantt timeline bars must render the SP-01 badge');
console.log('✓ Gantt timeline bars render sub-project chips for active tasks.');

// ── TEST 8: Sub-Project Modal Inspection ──
console.log('\n--- TEST 8: Sub-Project Modal Inspection ---');
const modalOverlay = { innerHTML: '', classList: { add() {}, remove() {} } };
global.document.getElementById = (id) => {
  if (id === 'pc-modal-overlay') return modalOverlay;
  if (id === 'pc-gantt-timeline-inner') return ganttContainer;
  return null;
};
pc.openSubProjectModal('NP-020_sp1');
assert(modalOverlay.innerHTML.includes('Mooring Dolphins, Piling & Marine Anchors'), 'Modal must render sub-project title');
assert(modalOverlay.innerHTML.includes('Rs. 38.0M'), 'Modal must render budget allocation');
assert(modalOverlay.innerHTML.includes('Lt Cdr KMAU Kahandawa'), 'Modal must render officer in-charge');
assert(modalOverlay.innerHTML.includes('SCOPE OF WORK & CIVIL SPECIFICATION'), 'Modal must render civil scope');
console.log('✓ Sub-project detailed dossier modal renders complete engineering specifications.');

console.log('\n===============================================================');
console.log('🎉 ALL COMPONENT SUB-PROJECT TESTS PASSED! 🎉');
console.log('===============================================================\n');
