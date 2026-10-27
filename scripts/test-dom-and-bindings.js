'use strict';
const fs = require('fs');
const html = fs.readFileSync('civil-pm-center.html', 'utf8');

const scriptMatch = html.match(/<script>\s*'use strict';([\s\S]*?)<\/script>\s*<\/body>/);
const js = scriptMatch[1];
const vm = require('vm');
const context = vm.createContext({
  window: {},
  document: { getElementById: () => ({ addEventListener: () => {}, innerHTML: '', querySelectorAll: () => [] }), addEventListener: () => {} },
  localStorage: { getItem: () => null, setItem: () => {} },
  console
});
vm.runInContext("'use strict';" + js, context);
const CivilPM = context.window.CivilPM;

// Find all CivilPM calls in HTML
const calls = new Set();
for (const m of html.matchAll(/CivilPM\.([a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)?)/g)) {
  calls.add(m[1]);
}

console.log('CivilPM calls found in HTML:', [...calls]);
const missingCalls = [];
for (const c of calls) {
  const parts = c.split('.');
  let obj = CivilPM;
  for (const p of parts) {
    if (obj && obj[p] !== undefined) {
      obj = obj[p];
    } else {
      missingCalls.push(c);
      break;
    }
  }
}
console.log('Missing CivilPM methods:', missingCalls);
