/**
 * Test Suite: Advanced Timeline Scroll & Geometric Zoom Settings
 * 1. Control + Scroll: Expand horizontal timeline, keep one end (left edge) stable
 * 2. Alt + Scroll: Expand horizontal timeline, keep center of viewport stable
 * 3. Ctrl + Shift + Scroll: Geometric zoom in/out, center stable, all text & geometries scale
 * 4. Dual-pane vertical scroll synchronization (WBS & Timeline)
 * 5. Reset button & Double-click canvas reset
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('🚀 TESTING ADVANCED GANTT SCROLL & GEOMETRIC ZOOM SETTINGS');
console.log('===============================================================\n');

// ── TEST 1: CSS Rules Verification ──
console.log('--- TEST 1: CSS Rules for Scroll Gestures & HUD ---');
const cssPath = path.join(__dirname, '..', 'css', 'progress-center.css');
const css = fs.readFileSync(cssPath, 'utf8');

assert(css.includes('.pc-gantt-stage-sizer'), 'progress-center.css must have .pc-gantt-stage-sizer');
assert(css.includes('.pc-scroll-hud'), 'progress-center.css must have .pc-scroll-hud');
assert(css.includes('.pc-hud-badge'), 'progress-center.css must have .pc-hud-badge');
assert(css.includes('.pc-hud-val'), 'progress-center.css must have .pc-hud-val');
assert(css.includes('.pc-zoom-reset-btn'), 'progress-center.css must have .pc-zoom-reset-btn');
assert(css.includes('.pc-scroll-help-pill'), 'progress-center.css must have .pc-scroll-help-pill');
console.log('✓ All CSS classes for scroll gestures, stage sizer, HUD & toolbar controls verified.');

// ── TEST 2: Environment Mocking & Class Initialization ──
console.log('\n--- TEST 2: ProgressCenterModule Sandbox Initialization ---');

// Mock DOM elements
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
    clientWidth: 800,
    clientHeight: 500,
    offsetWidth: 1200,
    offsetHeight: 600,
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
    dispatchEvent(type, evtObj = {}) {
      if (this._listeners[type]) {
        this._listeners[type].forEach(cb => cb(evtObj));
      }
    },
    appendChild(child) {
      this.children.push(child);
      if (child.id) elements[child.id] = child;
      return child;
    },
    closest(selector) {
      if (selector === '.pc-gantt-bar' && this.classList.contains('pc-gantt-bar')) return this;
      return null;
    }
  };
  if (id) elements[id] = el;
  return el;
}

// Build standard Gantt container tree
const wrap = createMockElement('pc-gantt-timeline-wrap');
const sizer = createMockElement('pc-gantt-stage-sizer');
const inner = createMockElement('pc-gantt-timeline-inner');
const wbsList = createMockElement('pc-wbs-list');
const wbsRows = createMockElement('pc-wbs-rows-container');
const ganttMain = createMockElement('pc-gantt-main');
const resetBtn = createMockElement('pc-zoom-reset-btn', 'button');
const viewContainer = createMockElement('progress-center-view');

wrap.appendChild(sizer);
sizer.appendChild(inner);

global.window = {};
global.document = {
  getElementById: (id) => elements[id] || null,
  querySelector: () => null,
  querySelectorAll: () => [],
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
assert.strictEqual(pc.geometricScale, 1.0, 'Default geometricScale must be 1.0');
assert.strictEqual(pc.dayW, 32, 'Default dayW must be 32');
console.log('✓ ProgressCenter loaded: geometricScale = 1.0, dayW = 32px.');

// Initialize gestures on container
pc.initGanttScrollGestures();

// ── TEST 3: Setting 1 — Ctrl + Scroll (Left End Stable) ──
console.log('\n--- TEST 3: Setting 1 — Ctrl + Scroll (Timeline Expansion, Left End Stable) ---');
pc.dayW = 32;
wrap.scrollLeft = 320; // 320px / 32px = Day 10 at left edge of visible viewport

let defaultPrevented = false;
const ctrlScrollEvent = {
  ctrlKey: true,
  altKey: false,
  shiftKey: false,
  deltaY: -100, // Wheel Up = Zoom in / expand
  preventDefault() { defaultPrevented = true; },
  stopPropagation() {}
};

wrap.dispatchEvent('wheel', ctrlScrollEvent);

assert(defaultPrevented, 'Ctrl + Scroll must call preventDefault() to prevent browser page zoom');
assert(pc.dayW > 32, `dayW must expand when wheeling up (was 32, now ${pc.dayW})`);
const expectedScrollLeft = Math.round(320 * (pc.dayW / 32));
assert.strictEqual(wrap.scrollLeft, expectedScrollLeft, `wrap.scrollLeft must preserve exact left end anchor (${expectedScrollLeft})`);

// Verify that the date at the left edge didn't shift
const leftEdgeDay = wrap.scrollLeft / pc.dayW;
assert(Math.abs(leftEdgeDay - 10) < 0.05, `Left edge date must stay anchored at Day 10 (actual: Day ${leftEdgeDay.toFixed(2)})`);

const hudEl = elements['pc-scroll-hud'];
assert(hudEl, 'Floating HUD must be rendered in DOM');
assert(hudEl.innerHTML.includes('Left End Stable'), 'HUD must report Left End Stable');
assert(hudEl.innerHTML.includes('Ctrl + Scroll'), 'HUD must display shortcut badge');
console.log(`✓ Ctrl + Scroll expanded dayW from 32px to ${pc.dayW}px with left edge date pinned at Day ${leftEdgeDay.toFixed(1)}.`);

// ── TEST 4: Setting 2 — Alt + Scroll (Center Stable) ──
console.log('\n--- TEST 4: Setting 2 — Alt + Scroll (Timeline Expansion, Center Stable) ---');
pc.dayW = 32;
wrap.scrollLeft = 400; // Center is 400 + 400 = 800px. At 32px/day, Day 25 is exactly in the center.

defaultPrevented = false;
const altScrollEvent = {
  ctrlKey: false,
  altKey: true,
  shiftKey: false,
  deltaY: -100, // Wheel Up = Expand
  preventDefault() { defaultPrevented = true; },
  stopPropagation() {}
};

wrap.dispatchEvent('wheel', altScrollEvent);

assert(defaultPrevented, 'Alt + Scroll must call preventDefault()');
assert(pc.dayW > 32, `dayW must expand when wheeling up with Alt (was 32, now ${pc.dayW})`);

// Center stable formula verification:
// oldCenter = 400 + 400 = 800. newCenter = 800 * (pc.dayW / 32). newScrollLeft = newCenter - 400.
const expectedCenter = 800 * (pc.dayW / 32);
const expectedCenterScrollLeft = Math.round(expectedCenter - 400);
assert.strictEqual(wrap.scrollLeft, expectedCenterScrollLeft, `wrap.scrollLeft must match center-stable calculation (${expectedCenterScrollLeft})`);

const centerDay = (wrap.scrollLeft + 400) / pc.dayW;
assert(Math.abs(centerDay - 25) < 0.05, `Viewport center date must stay anchored at Day 25 (actual: Day ${centerDay.toFixed(2)})`);
assert(hudEl.innerHTML.includes('Center Stable'), 'HUD must report Center Stable');
assert(hudEl.innerHTML.includes('Alt + Scroll'), 'HUD must display shortcut badge');
console.log(`✓ Alt + Scroll expanded dayW from 32px to ${pc.dayW}px with viewport center pinned at Day ${centerDay.toFixed(1)}.`);

// ── TEST 5: Setting 3 — Ctrl + Shift + Scroll (Geometric Zoom, Center Stable) ──
console.log('\n--- TEST 5: Setting 3 — Ctrl + Shift + Scroll (Geometric Zoom, Center Stable) ---');
pc.geometricScale = 1.0;
wrap.scrollLeft = 200;
wrap.scrollTop = 100;
// Center before zoom: X = 200 + 400 = 600px; Y = 100 + 250 = 350px

defaultPrevented = false;
const ctrlShiftScrollEvent = {
  ctrlKey: true,
  altKey: false,
  shiftKey: true,
  deltaY: -100, // Wheel Up = Zoom in geometrically
  preventDefault() { defaultPrevented = true; },
  stopPropagation() {}
};

wrap.dispatchEvent('wheel', ctrlShiftScrollEvent);

assert(defaultPrevented, 'Ctrl + Shift + Scroll must call preventDefault()');
assert(pc.geometricScale > 1.0, `geometricScale must increase (now ${pc.geometricScale})`);

// Check transform & stage sizing:
assert(inner.style.transform.includes(`scale(${pc.geometricScale})`), 'inner element must receive CSS transform scale');
assert(sizer.style.width, 'sizer element must update its scaled width');
assert(sizer.style.height, 'sizer element must update its scaled height');

// Verify center stability in both X and Y:
const expectedGeoCenterX = 600 * pc.geometricScale;
const expectedGeoCenterY = 350 * pc.geometricScale;
const expectedGeoScrollLeft = Math.round(expectedGeoCenterX - 400);
const expectedGeoScrollTop = Math.round(expectedGeoCenterY - 250);

assert.strictEqual(wrap.scrollLeft, expectedGeoScrollLeft, `wrap.scrollLeft must preserve center (${expectedGeoScrollLeft})`);
assert.strictEqual(wrap.scrollTop, expectedGeoScrollTop, `wrap.scrollTop must preserve center (${expectedGeoScrollTop})`);

assert(hudEl.innerHTML.includes('Geometric Zoom'), 'HUD must report Geometric Zoom');
assert(hudEl.innerHTML.includes('Ctrl + Shift + Scroll'), 'HUD must display shortcut badge');
console.log(`✓ Ctrl + Shift + Scroll scaled canvas to ${Math.round(pc.geometricScale * 100)}% with (X, Y) center stability.`);

// ── TEST 6: Dual-Pane Vertical Scroll Synchronization ──
console.log('\n--- TEST 6: Dual-Pane Vertical Scroll Synchronization ---');
wrap.scrollTop = 160;
wrap.dispatchEvent('scroll');
assert.strictEqual(wbsRows.scrollTop, 160, 'wbsRows.scrollTop must synchronize with wrap.scrollTop');

wbsRows.scrollTop = 90;
wbsRows.dispatchEvent('scroll');
assert.strictEqual(wrap.scrollTop, 90, 'wrap.scrollTop must synchronize with wbsRows.scrollTop');
console.log('✓ Vertical scrolling perfectly synchronized between WBS table and Gantt timeline.');

// ── TEST 7: Reset Zoom Functionality & Double-Click ──
console.log('\n--- TEST 7: Reset Zoom & Double-Click ---');
pc.geometricScale = 1.45;
pc.dayW = 72;

pc.resetTimelineZoom();

assert.strictEqual(pc.geometricScale, 1.0, 'geometricScale must reset to 1.0');
assert.strictEqual(pc.dayW, 32, 'dayW must reset to 32px (Weeks preset)');
assert.strictEqual(inner.style.transform, '', 'transform scale must be cleared on reset');
assert(hudEl.innerHTML.includes('Timeline Reset to 100%'), 'HUD must report reset to 100%');

// Test double-click
pc.geometricScale = 1.6;
wrap.dispatchEvent('dblclick', { target: wrap });
assert.strictEqual(pc.geometricScale, 1.0, 'Double-clicking canvas background must reset zoom to 1.0');
console.log('✓ Reset button and canvas double-click reset zoom and scale back to 100%.');

console.log('\n===============================================================');
console.log('🎉 ALL 7 SCROLL SETTINGS & ZOOM SUITE TESTS PASSED! 🎉');
console.log('===============================================================\n');
