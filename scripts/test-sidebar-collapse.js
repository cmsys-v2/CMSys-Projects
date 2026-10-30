/**
 * Test Suite: Collapsible & Resizable Navigation Sidebar and Window Span Expansion
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('===============================================================');
console.log('🚀 TESTING CMSYS SIDEBAR EXPAND/COLLAPSE & SHRINK OVERHAUL');
console.log('===============================================================\n');

// 1. Verify index.html elements
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

console.log('--- TEST 1: DOM Elements in index.html ---');
assert(html.includes('id="sidebar"'), 'index.html must have #sidebar');
assert(html.includes('id="sidebar-toggle-btn"'), 'index.html must have #sidebar-toggle-btn');
assert(html.includes('id="sidebar-collapse-edge-btn"'), 'index.html must have #sidebar-collapse-edge-btn');
assert(html.includes('id="topbar-sidebar-toggle"'), 'index.html must have #topbar-sidebar-toggle');
assert(html.includes('id="sidebar-resizer"'), 'index.html must have #sidebar-resizer');
assert(html.includes('class="nav-label"'), 'index.html nav links must wrap text in .nav-label');
assert(html.includes('data-title="Progress & Monitoring"'), 'index.html nav must have data-title attributes');
assert(html.includes('class="fb-status-label"'), 'index.html footer must wrap labels in .fb-status-label');
assert(html.includes('class="fb-status-details"'), 'index.html footer must wrap sub-rows in .fb-status-details');
console.log('✓ All 9 DOM elements present in index.html.');

// 2. Verify early restore script in <head>
console.log('\n--- TEST 2: Early Preference Restoration Script ---');
assert(html.includes('localStorage.getItem(\'cmsys_sidebar_collapsed\')'), 'Head script must check cmsys_sidebar_collapsed early');
assert(html.includes('document.documentElement.classList.add(\'sidebar-collapsed\')'), 'Head script must apply sidebar-collapsed early');
assert(html.includes('--sidebar-w'), 'Head script must handle custom width');
console.log('✓ Early restoration script verified.');

// 3. Verify CSS in style.css
console.log('\n--- TEST 3: CSS Tokens & Responsive Rules in style.css ---');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
assert(css.includes('--sidebar-w-collapsed: 68px;'), 'style.css must define --sidebar-w-collapsed: 68px');
assert(css.includes('--sidebar-w-min: 190px;'), 'style.css must define --sidebar-w-min: 190px');
assert(css.includes('--sidebar-w-max: 420px;'), 'style.css must define --sidebar-w-max: 420px');
assert(css.includes('.sidebar.is-collapsed'), 'style.css must define .sidebar.is-collapsed rules');
assert(css.includes('.sidebar-toggle-btn'), 'style.css must define .sidebar-toggle-btn rules');
assert(css.includes('.sidebar-collapse-edge-btn'), 'style.css must define .sidebar-collapse-edge-btn rules');
assert(css.includes('.sidebar-resizer'), 'style.css must define .sidebar-resizer rules');
assert(css.includes('.topbar-sidebar-toggle'), 'style.css must define .topbar-sidebar-toggle rules');
assert(css.includes('.sidebar-flyout-tooltip'), 'style.css must define .sidebar-flyout-tooltip rules');
console.log('✓ All CSS tokens, collapsed states & interactive handles verified.');

// 4. Verify WBS split-pane collapse in Progress Center
console.log('\n--- TEST 4: Progress Center WBS Split-Pane Expansion ---');
const pcCss = fs.readFileSync(path.join(__dirname, '..', 'css', 'progress-center.css'), 'utf8');
const pcJs = fs.readFileSync(path.join(__dirname, '..', 'js', 'progress-center.js'), 'utf8');
assert(pcCss.includes('.pc-gantt-split.wbs-collapsed'), 'progress-center.css must have .pc-gantt-split.wbs-collapsed');
assert(pcCss.includes('.pc-wbs-toggle-btn'), 'progress-center.css must style .pc-wbs-toggle-btn');
assert(pcJs.includes('id="pc-toggle-wbs-btn"'), 'progress-center.js must render #pc-toggle-wbs-btn');
assert(pcJs.includes('this._isWbsCollapsed'), 'progress-center.js must maintain _isWbsCollapsed state');
console.log('✓ WBS Split-Pane collapse & timeline expansion verified.');

// 5. Functional Simulation in Headless DOM Sandbox
console.log('\n--- TEST 5: Interactive App Sidebar Controller Simulation ---');
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

// Mock minimal DOM
class MockElement {
  constructor(tag, id = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.classList = {
      _classes: new Set(),
      add: (c) => this.classList._classes.add(c),
      remove: (c) => this.classList._classes.delete(c),
      toggle: (c, force) => {
        if (force !== undefined) {
          if (force) this.classList._classes.add(c);
          else this.classList._classes.delete(c);
          return force;
        }
        if (this.classList._classes.has(c)) {
          this.classList._classes.delete(c);
          return false;
        }
        this.classList._classes.add(c);
        return true;
      },
      contains: (c) => this.classList._classes.has(c)
    };
    this.style = {};
    this.listeners = {};
    this.children = [];
  }
  appendChild(c) {
    this.children.push(c);
    return c;
  }
  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }
  removeEventListener(event, fn) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(f => f !== fn);
  }
  trigger(event, data = {}) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(fn => fn(data));
    }
  }
  querySelector(sel) {
    return this.children.find(c => c.tagName.toLowerCase() === sel || c.id === sel.replace('#',''));
  }
  querySelectorAll() { return []; }
  getBoundingClientRect() { return { top: 100, bottom: 144, left: 0, right: 265, width: 265, height: 44 }; }
  contains() { return false; }
}

const mockDoc = {
  documentElement: new MockElement('html'),
  body: new MockElement('body'),
  elements: {},
  getElementById(id) { return this.elements[id] || null; },
  createElement(tag) { return new MockElement(tag); },
  addEventListener: () => {},
  removeEventListener: () => {}
};

mockDoc.documentElement.style.setProperty = (k, v) => { mockDoc.documentElement.style[k] = v; };

// Setup elements
const sb = new MockElement('aside', 'sidebar');
const tb = new MockElement('button', 'sidebar-toggle-btn');
const icon = new MockElement('i');
icon.className = 'fas fa-angles-left';
tb.children.push(icon);
const eb = new MockElement('button', 'sidebar-collapse-edge-btn');
const topb = new MockElement('button', 'topbar-sidebar-toggle');
const res = new MockElement('div', 'sidebar-resizer');

mockDoc.elements['sidebar'] = sb;
mockDoc.elements['sidebar-toggle-btn'] = tb;
mockDoc.elements['sidebar-collapse-edge-btn'] = eb;
mockDoc.elements['topbar-sidebar-toggle'] = topb;
mockDoc.elements['sidebar-resizer'] = res;

global.document = mockDoc;
global.window = {
  innerWidth: 1280,
  addEventListener: () => {},
  dispatchEvent: () => {}
};

// Evaluate app.js
const appCode = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
eval(appCode);

const appInstance = global.window.app;
assert(appInstance, 'window.app must be created');
appInstance._initSidebarControls();

// Initial state: not collapsed
assert(!sb.classList.contains('is-collapsed'), 'Sidebar should initially be expanded');

// Trigger toggle via header button
tb.trigger('click');
assert(sb.classList.contains('is-collapsed'), 'Sidebar should be collapsed after toggle click');
assert(mockDoc.documentElement.classList.contains('sidebar-collapsed'), 'html should have sidebar-collapsed');
assert.strictEqual(storage['cmsys_sidebar_collapsed'], 'true', 'localStorage should record cmsys_sidebar_collapsed=true');
assert.strictEqual(icon.className, 'fas fa-angles-right', 'Toggle button icon should switch to fa-angles-right');

// Trigger toggle again via edge chevron button
eb.trigger('click');
assert(!sb.classList.contains('is-collapsed'), 'Sidebar should expand after second toggle click');
assert(!mockDoc.documentElement.classList.contains('sidebar-collapsed'), 'html should remove sidebar-collapsed');
assert.strictEqual(storage['cmsys_sidebar_collapsed'], 'false', 'localStorage should record cmsys_sidebar_collapsed=false');
assert.strictEqual(icon.className, 'fas fa-angles-left', 'Toggle button icon should switch back to fa-angles-left');

// Trigger toggle via topbar button
topb.trigger('click');
assert(sb.classList.contains('is-collapsed'), 'Topbar button should collapse sidebar');

console.log('✓ Sidebar toggle via header button, edge chevron & topbar button validated.');
console.log('✓ Storage synchronization & icon flipping verified.');

console.log('\n===============================================================');
console.log('🎉 ALL SIDEBAR EXPAND/COLLAPSE & WINDOW SPAN TESTS PASSED! 🎉');
console.log('===============================================================\n');
