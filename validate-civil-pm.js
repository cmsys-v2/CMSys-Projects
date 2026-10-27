'use strict';
const { execSync } = require('child_process');
const fs = require('fs');
const html = fs.readFileSync('civil-pm-center.html', 'utf8');
const lines = html.split('\n').length;
const bytes = Buffer.byteLength(html, 'utf8');

// Extract the JS block
const scriptMatch = html.match(/<script>\s*'use strict';([\s\S]*?)<\/script>\s*<\/body>/);
if (!scriptMatch) { console.error('No script block found'); process.exit(1); }

const jsContent = "'use strict';" + scriptMatch[1];

// Write extracted JS to temp file and parse it with --check flag
fs.writeFileSync('_temp_check.js', jsContent);

try {
  execSync('node --check _temp_check.js 2>&1', { stdio: 'pipe' });
  console.log('✓ JS SYNTAX: OK');
} catch(e) {
  console.error('✗ JS SYNTAX ERROR:');
  console.error(e.stdout ? e.stdout.toString() : e.message);
  fs.unlinkSync('_temp_check.js');
  process.exit(1);
}
fs.unlinkSync('_temp_check.js');

console.log('✓ Total lines      :', lines);
console.log('✓ File size bytes  :', bytes);
console.log('✓ File size KB     :', Math.round(bytes / 1024));
console.log('  Meets 3000+ lines:', lines >= 3000 ? 'YES ✓' : 'NO — only ' + lines + ' lines');

// Structural checks
const sectionPanels = (html.match(/class="section-panel/g) || []).length;
const sectionTabs   = (html.match(/class="section-tab/g)   || []).length;
const cdnScripts    = (html.match(/src="https:\/\//g)      || []).length;
const checks = {
  'Section panels (expect 10)' : sectionPanels,
  'Section tabs   (expect 10)' : sectionTabs,
  'CDN scripts loaded'         : cdnScripts,
  'KPI cards'                  : html.includes('kpi-card'),
  'Gantt SVG canvas'           : html.includes('ganttSvg'),
  'CPM Engine'                 : html.includes('CPMEngine'),
  'EVM Dashboard'              : html.includes('evmCards'),
  'Firebase dual DB'           : html.includes('FIREBASE_DB1_CONFIG') && html.includes('FIREBASE_DB2_CONFIG'),
  'StateV6 reactive store'     : html.includes('class StateV6'),
  'jsPDF export'               : html.includes('jspdf'),
  'SheetJS export'             : html.includes('XLSX.utils'),
  'RACI Matrix'                : html.includes('raciTable'),
  'S-Curve SVG'                : html.includes('sCurveSvg'),
  'Gantt drag scroll'          : html.includes('initDragScroll'),
  'CPM Forward/Backward pass'  : html.includes('Forward Pass') && html.includes('Backward Pass'),
  'MTO Procurement'            : html.includes('mtoTable'),
  'QA Test register'           : html.includes('qaTable'),
  'Audit log'                  : html.includes('auditTable'),
  'Toast system'               : html.includes('toastContainer'),
  'Todo Firebase keys'         : html.includes('TODO: Replace'),
};

Object.entries(checks).forEach(([k, v]) => {
  console.log(`  ${v===true||v>0?'✓':'✗'} ${k}:`, v);
});

console.log('\n✓ Validation complete');
