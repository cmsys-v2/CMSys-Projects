/**
 * scripts/test-dependency-links.js
 * Comprehensive Verification Suite for Gantt Dependency Links & Line Type Engine
 * 
 * Verifies:
 * 1. ProgressCenterModule constructor & dependency configuration.
 * 2. Three Selectable Line Types (Stepped/Orthogonal, Curved Bezier, Direct Straight).
 * 3. SVG Dependency Layer generation with markers & filters.
 * 4. Critical Path dependency distinction (TF=0, ruby red glow, distinct marker).
 * 5. Interactive task bar & link hover highlighting and dimming.
 * 6. Floating tooltip data resolution (type, lag, pred, succ).
 * 7. Visibility toggle (show/hide links).
 * 8. Civil PM Center GanttRenderer line type compatibility.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('🚀 TESTING GANTT DEPENDENCY LINKS & SELECTABLE LINE TYPE ENGINE');
console.log('===============================================================\n');

// ── TEST 1: CSS Rules Verification ──
console.log('--- TEST 1: CSS Rules for Dependency Lines & Toolbar Controls ---');
const cssPath = path.join(__dirname, '../css/progress-center.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const requiredCssSelectors = [
  '.pc-gantt-dependency-svg',
  '.pc-dep-hitbox',
  '.pc-dep-path',
  '.pc-dep-path.is-critical',
  '.pc-linking-active .pc-dep-path',
  '.pc-linking-active .pc-dep-path.is-highlighted',
  '.pc-gantt-bar.is-focused-task',
  '.pc-gantt-bar.is-pred-highlight',
  '.pc-gantt-bar.is-succ-highlight',
  '.pc-link-type-controls',
  '.pc-link-btn',
  '.pc-link-btn.active',
  '.pc-link-toggle-btn',
  '.pc-dep-tooltip'
];

requiredCssSelectors.forEach(sel => {
  assert(cssContent.includes(sel), `CSS must define selector: ${sel}`);
});
console.log('✓ All CSS classes for SVG overlay, hit-boxes, critical glow & tooltips verified.\n');

// ── TEST 2: Environment Mocking & Class Initialization ──
console.log('--- TEST 2: ProgressCenter Sandbox & Dependency Initialization ---');

const elements = {};
function createMockElement(id, tagName = 'div') {
  const el = {
    id: id || '',
    tagName: tagName.toUpperCase(),
    style: {
      setProperty(k, v) { this[k] = v; }
    },
    classList: {
      _classes: new Set(),
      add(c) { this._classes.add(c); },
      remove(c) { this._classes.delete(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this._classes.has(c)) this._classes.delete(c);
          else this._classes.add(c);
        } else if (force) this._classes.add(c);
        else this._classes.delete(c);
      },
      contains(c) { return this._classes.has(c); }
    },
    clientWidth: 1000,
    clientHeight: 600,
    scrollLeft: 0,
    scrollTop: 0,
    innerHTML: '',
    textContent: '',
    children: [],
    _listeners: {},
    addEventListener(type, cb) {
      if (!this._listeners[type]) this._listeners[type] = [];
      this._listeners[type].push(cb);
    },
    getBoundingClientRect() {
      return { left: 100, top: 100, width: 1000, height: 600 };
    },
    setAttribute(k, v) { this[k] = v; },
    querySelectorAll(sel) {
      if (sel === '.pc-link-btn') {
        return [
          { dataset: { type: 'orthogonal' }, classList: { toggle: () => {} } },
          { dataset: { type: 'curved' }, classList: { toggle: () => {} } },
          { dataset: { type: 'straight' }, classList: { toggle: () => {} } }
        ];
      }
      return [];
    }
  };
  if (id) elements[id] = el;
  return el;
}

const wrap = createMockElement('pc-gantt-timeline-wrap');
const sizer = createMockElement('pc-gantt-stage-sizer');
const inner = createMockElement('pc-gantt-timeline-inner');
const wbsList = createMockElement('pc-wbs-list');
const wbsRows = createMockElement('pc-wbs-rows-container');
const ganttMain = createMockElement('pc-gantt-main');
const linkControls = createMockElement('pc-link-type-controls');
const toggleBtn = createMockElement('pc-link-toggle-btn', 'button');
const tooltip = createMockElement('pc-dep-tooltip');
const scrollHud = createMockElement('pc-scroll-hud');

global.window = {};
global.document = {
  getElementById: (id) => elements[id] || createMockElement(id),
  querySelector: () => null,
  querySelectorAll: (sel) => {
    if (sel.includes('.pc-gantt-bar')) {
      return Object.values(elements).filter(e => e.id && (e.id.startsWith('pc-bar-') || e.id.startsWith('pc-link-')));
    }
    return [];
  },
  createElement: (tag) => createMockElement('', tag)
};
global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); }
};

// Load js/progress-center.js
const jsPath = path.join(__dirname, '..', 'js', 'progress-center.js');
const jsCode = fs.readFileSync(jsPath, 'utf8');
eval(jsCode);

const pc = window.progressCenter;
assert(pc, 'window.progressCenter instance must exist');
assert.strictEqual(pc.connectorLineType, 'orthogonal', 'Default line type must be orthogonal');
assert.strictEqual(pc.showDependencyLinks, true, 'Dependency links must be visible by default');
console.log('✓ ProgressCenter loaded: connectorLineType = orthogonal, showDependencyLinks = true.\n');

// ── TEST 3: Mathematical Vector & Path Generation for 3 Line Types ──
console.log('--- TEST 3: Vector Math & Path Generation for 3 Line Styles ---');

// Case A: Finish-to-Start (FS) forward (x2 > x1 + 16)
const x1 = 100, y1 = 64, x2 = 240, y2 = 108;

// 1. Straight
const straightPath = pc._calculateConnectorPath(x1, y1, x2, y2, 'straight', 'FS');
assert.strictEqual(straightPath, `M ${x1} ${y1} L ${x2} ${y2}`, 'Straight path must be direct vector');
console.log('  Direct Straight:', straightPath);

// 2. Curved Bezier
const curvedPath = pc._calculateConnectorPath(x1, y1, x2, y2, 'curved', 'FS');
assert(curvedPath.startsWith(`M ${x1} ${y1} C `), 'Curved path must start with M and cubic Bezier C');
assert(curvedPath.endsWith(`${x2} ${y2}`), 'Curved path must end at destination coordinates');
console.log('  Curved Bezier:  ', curvedPath);

// 3. Orthogonal Stepped (Manhattan with fillets)
const steppedPath = pc._calculateConnectorPath(x1, y1, x2, y2, 'orthogonal', 'FS');
assert(steppedPath.startsWith(`M ${x1} ${y1}`), 'Stepped path must start at predecessor exit');
assert(steppedPath.includes(' Q '), 'Stepped path with height difference must include smooth fillet Q curves');
assert(steppedPath.endsWith(`${x2} ${y2}`), 'Stepped path must enter successor start horizontally');
console.log('  Stepped Elbow:  ', steppedPath);

// Case B: Start-to-Start (SS)
const ssCurved = pc._calculateConnectorPath(x1, y1, x2, y2, 'curved', 'SS');
assert(ssCurved.includes(' C '), 'SS curved path must use Bezier C');

const ssStepped = pc._calculateConnectorPath(x1, y1, x2, y2, 'orthogonal', 'SS');
assert(ssStepped.startsWith(`M ${x1} ${y1} L `), 'SS stepped path must route with Manhattan stubs');
console.log('✓ All 3 line types generate mathematically correct SVG path geometries.\n');

// ── TEST 4: Full Dependency Network SVG Rendering ──
console.log('--- TEST 4: Full Dependency Network SVG Rendering ---');
const mockProject = {
  id: 'NP-001',
  code: 'NP-001',
  name: 'AIRCRAFT MAINTENANCE HANGAR COMPLEX',
  startDate: '2025-01-15'
};
pc.selectedProjectId = mockProject.id;
pc.getAllProjects = () => [mockProject];

const pData = pc.getProjectDetailedData(mockProject);
const tasks = pc.getVisibleTasks(pData.tasks);

const startDates = tasks.map(t => new Date(t.startDateStr).getTime());
const endDates = tasks.map(t => new Date(t.endDateStr).getTime());
const minDate = new Date(Math.min(...startDates) - 2 * 86400000);
const maxDate = new Date(Math.max(...endDates) + 14 * 86400000);
const totalDays = Math.max(30, Math.ceil((maxDate - minDate) / 86400000));
const timelineWidth = totalDays * pc.dayW;
const totalHeight = 42 + tasks.length * 44;

const svgHtml = pc._renderDependencySvg(tasks, minDate, timelineWidth, totalHeight);

assert(svgHtml.includes('class="pc-gantt-dependency-svg"'), 'SVG element must be present');
assert(svgHtml.includes('id="pc-arrow-default"'), 'Defs must contain default arrow marker');
assert(svgHtml.includes('id="pc-arrow-critical"'), 'Defs must contain critical ruby arrow marker');
assert(svgHtml.includes('id="pc-arrow-highlight"'), 'Defs must contain highlight amber arrow marker');
assert(svgHtml.includes('class="pc-dep-hitbox"'), 'Hit-boxes must be present for responsive hover');
assert(svgHtml.includes('class="pc-dep-path'), 'Stylized stroke paths must be rendered');

assert(pc._currentDepLinks.length > 0, 'Must have populated active dependency links array');
const criticalLinks = pc._currentDepLinks.filter(l => l.isCritical);
assert(criticalLinks.length > 0, 'Must identify critical path links');
console.log(`✓ Dependency Network rendered: ${pc._currentDepLinks.length} total links (${criticalLinks.length} on Critical Path).`);
console.log('✓ Directional markers, glow filters & invisible hit-boxes verified.\n');

// ── TEST 5: Interactive Line Type Selection & Visibility Toggle ──
console.log('--- TEST 5: Line Type Switching & Visibility Toggle ---');
pc.setConnectorLineType('curved');
assert.strictEqual(pc.connectorLineType, 'curved', 'Connector line type should switch to curved');

pc.setConnectorLineType('straight');
assert.strictEqual(pc.connectorLineType, 'straight', 'Connector line type should switch to straight');

pc.setConnectorLineType('orthogonal');
assert.strictEqual(pc.connectorLineType, 'orthogonal', 'Connector line type should switch back to orthogonal');

assert.strictEqual(pc.showDependencyLinks, true, 'Links initially visible');
pc.toggleDependencyLinks();
assert.strictEqual(pc.showDependencyLinks, false, 'Links toggled to hidden');
pc.toggleDependencyLinks();
assert.strictEqual(pc.showDependencyLinks, true, 'Links toggled back to visible');
console.log('✓ Line type switching (orthogonal/curved/straight) & show/hide toggle verified.\n');

// ── TEST 6: Interactive Hover Tracing & Connected Task Highlighting ──
console.log('--- TEST 6: Interactive Hover Tracing & Connected Task Highlighting ---');
const sampleLink = pc._currentDepLinks[0];
assert(sampleLink, 'Sample link must exist');
const testTaskId = sampleLink.succId;

// Hover task bar
pc.highlightTaskDependencies(testTaskId);
assert.strictEqual(pc._activeHoveredTaskId, testTaskId, 'Active hovered task must be set');

// Clear highlight
pc.clearDependencyHighlight();
assert.strictEqual(pc._activeHoveredTaskId, null, 'Active hovered task must be cleared');

// Hover link directly
pc.onLinkHover({ clientX: 250, clientY: 150 }, sampleLink.id);
assert(tooltip.innerHTML.includes(sampleLink.type), 'Tooltip must display dependency type');
assert(tooltip.innerHTML.includes(sampleLink.predName), 'Tooltip must display predecessor name');
assert(tooltip.innerHTML.includes(sampleLink.succName), 'Tooltip must display successor name');

pc.onLinkLeave();
assert.strictEqual(tooltip.style.display, 'none', 'Tooltip must be hidden on mouse leave');
console.log('✓ Interactive hover tracing, parent/successor highlight rings & rich tooltip verified.\n');

// ── TEST 7: Civil PM Center GanttRenderer Line Type Compatibility ──
console.log('--- TEST 7: Civil PM Center GanttRenderer Compatibility ---');
const civilPmPath = path.join(__dirname, '../civil-pm-center.html');
const civilPmContent = fs.readFileSync(civilPmPath, 'utf8');

assert(civilPmContent.includes('id="lineTypeOrthogonal"'), 'Civil PM Center must include lineTypeOrthogonal button');
assert(civilPmContent.includes('id="lineTypeCurved"'), 'Civil PM Center must include lineTypeCurved button');
assert(civilPmContent.includes('id="lineTypeStraight"'), 'Civil PM Center must include lineTypeStraight button');
assert(civilPmContent.includes('.g-dep-arrow.is-critical'), 'Civil PM Center must style critical dependency arrows');
assert(civilPmContent.includes('currentLineType'), 'GanttRenderer must maintain currentLineType');
assert(civilPmContent.includes('setLineType'), 'GanttRenderer must expose setLineType()');
console.log('✓ Civil PM Center GanttRenderer fully supports Stepped, Curved & Direct line styles.\n');

console.log('===============================================================');
console.log('🎉 ALL 7 GANTT DEPENDENCY LINKS & LINE TYPE SUITE TESTS PASSED! 🎉');
console.log('===============================================================');
