// ============================================================
// SPS — Labour Details Centre
// Sailor list (active/inactive), Equal Opportunity Rotation Sorting,
// Previous Location History Breakdown, Calendar View, Bulk Upload,
// Trade Filters & Daily Headcount by Project
// ============================================================
(function() {
  'use strict';

  const CAT_COLORS = {
    'Religious':     'religious',
    'Clean Sri Lanka': 'csl',
    'Housing':       'housing',
    'Miscellaneous': 'misc'
  };

  const TRADE_ICONS = {
    MA: '🧱', CA: '🪵', PA: '🎨', PL: '🔧', WE: '⚡', BB: '🧱',
    AL: '🔩', SW: '🔧', RW: '🛠', AA: '⚓'
  };

  class LabourCentre {
    constructor() {
      this._calMonth  = new Date().getMonth();
      this._calYear   = new Date().getFullYear();
      this._selSailor = null;
      this._activeSection = 'active';
      this._sortBy = 'least_religious'; // Equal Opportunity Rotation default
      this._tradeFilter = 'ALL';
    }

    render() {
      const view = document.getElementById('labour-view');
      if (!view) return;
      view.innerHTML = `
        <div style="display:grid;grid-template-columns:1.1fr 1fr;gap:18px;align-items:start;">
          <!-- LEFT: Sailor Rotation List -->
          <div>
            <div class="section-header">
              <div class="section-title"><i class="fas fa-users"></i> Sailors on Special Projects</div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-primary btn-sm" onclick="window.labourCentre.openBulkUpload()">
                  <i class="fas fa-upload"></i> Bulk Upload
                </button>
                <button class="btn btn-secondary btn-sm" onclick="window.app.openAttachLabourModal()">
                  <i class="fas fa-user-plus"></i> Attach Sailor
                </button>
              </div>
            </div>

            <!-- Active / Inactive Toggle -->
            <div style="display:flex;gap:4px;background:var(--bg-surface);border-radius:8px;padding:4px;margin:10px 0;">
              <button id="sec-active-btn" class="btn ${this._activeSection==='active'?'btn-primary':'btn-ghost'} btn-sm" style="flex:1;" onclick="window.labourCentre.setSection('active')">
                <i class="fas fa-circle" style="color:var(--success);font-size:0.6rem;"></i> Active Attached
              </button>
              <button id="sec-inactive-btn" class="btn ${this._activeSection==='inactive'?'btn-primary':'btn-ghost'} btn-sm" style="flex:1;" onclick="window.labourCentre.setSection('inactive')">
                <i class="fas fa-history" style="font-size:0.7rem;"></i> Past Attached
              </button>
            </div>

            <!-- Controls: Search, Sort Mode (Anti-Bribery / Equal Opportunity), & Trade Filter -->
            <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
              <!-- Search -->
              <div style="position:relative;flex:1;min-width:180px;">
                <i class="fas fa-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-dim);font-size:0.82rem;"></i>
                <input class="form-control" id="sailor-search" placeholder="Search name, service no, trade..." style="padding-left:32px;height:34px;font-size:0.82rem;"
                       oninput="window.labourCentre.filterSailors()">
              </div>

              <!-- Equal Opportunity Rotation Sort -->
              <select class="form-control" id="sailor-sort-select" style="width:190px;height:34px;font-size:0.78rem;" onchange="window.labourCentre.setSort(this.value)">
                <option value="least_religious" ${this._sortBy==='least_religious'?'selected':''}>⭐ Least Religious Days (Fair Rotation)</option>
                <option value="least_total" ${this._sortBy==='least_total'?'selected':''}>Least Total SP Days</option>
                <option value="most_total" ${this._sortBy==='most_total'?'selected':''}>Most Total SP Days</option>
                <option value="trade" ${this._sortBy==='trade'?'selected':''}>Sort by Trade</option>
              </select>

              <!-- Trade Filter -->
              <select class="form-control" id="sailor-trade-select" style="width:110px;height:34px;font-size:0.78rem;" onchange="window.labourCentre.setTradeFilter(this.value)">
                <option value="ALL">All Trades</option>
                <option value="MA">MA</option><option value="CA">CA</option><option value="PA">PA</option>
                <option value="PL">PL</option><option value="WE">WE</option><option value="BB">BB</option>
                <option value="AL">AL</option><option value="SW">SW</option>
              </select>
            </div>

            <div id="sailor-list-container" style="display:flex;flex-direction:column;gap:6px;max-height:520px;overflow-y:auto;"></div>
          </div>

          <!-- RIGHT: Sailor Detail / Calendar -->
          <div>
            <div class="section-header">
              <div class="section-title"><i class="fas fa-calendar-alt"></i> Attachment Calendar</div>
              <div id="headcount-date-picker" style="display:flex;align-items:center;gap:8px;">
                <label style="font-size:0.78rem;color:var(--text-muted);">Headcount Date:</label>
                <input type="date" class="form-control" id="hc-date" value="${new Date().toISOString().split('T')[0]}"
                       style="width:150px;height:34px;font-size:0.8rem;" onchange="window.labourCentre.renderHeadcount()">
              </div>
            </div>

            <!-- Sailor Calendar (shown when a sailor is selected) -->
            <div id="sailor-calendar-panel" style="display:none;">
              <div class="panel" style="margin-top:10px;">
                <div class="panel-head">
                  <span class="panel-title" id="cal-sailor-name"><i class="fas fa-user"></i> Select a sailor</span>
                  <div style="display:flex;gap:6px;">
                    <button class="cal-nav" onclick="window.labourCentre.prevMonth()"><i class="fas fa-chevron-left"></i></button>
                    <span id="cal-month-label" style="font-size:0.82rem;font-weight:700;color:var(--text-secondary);padding:0 6px;align-self:center;"></span>
                    <button class="cal-nav" onclick="window.labourCentre.nextMonth()"><i class="fas fa-chevron-right"></i></button>
                  </div>
                </div>
                <div class="panel-body">
                  <div id="sailor-calendar-grid"></div>
                  <div class="cal-legend" id="cal-legend"></div>
                  <!-- Sailor stats & previous location history -->
                  <div id="sailor-detail-stats" style="margin-top:16px;"></div>
                </div>
              </div>
            </div>

            <!-- Headcount Panel (shown when no sailor selected) -->
            <div id="headcount-panel" style="margin-top:10px;">
              <div class="panel">
                <div class="panel-head">
                  <span class="panel-title"><i class="fas fa-users"></i> Headcount by Project</span>
                  <span id="hc-date-display" style="font-size:0.78rem;color:var(--text-muted);"></span>
                </div>
                <div class="panel-body">
                  <div class="headcount-grid" id="headcount-grid"></div>
                </div>
              </div>
            </div>
          </div>
        </div>`;

      this._renderSailorList();
      this.renderHeadcount();
    }

    setSection(sec) {
      this._activeSection = sec;
      this._selSailor = null;
      document.getElementById('sailor-calendar-panel').style.display = 'none';
      document.getElementById('headcount-panel').style.display = 'block';
      document.getElementById('sec-active-btn').className = `btn ${sec==='active'?'btn-primary':'btn-ghost'} btn-sm`;
      document.getElementById('sec-inactive-btn').className = `btn ${sec==='inactive'?'btn-primary':'btn-ghost'} btn-sm`;
      this._renderSailorList();
    }

    setSort(val) {
      this._sortBy = val;
      this._renderSailorList();
    }

    setTradeFilter(val) {
      this._tradeFilter = val;
      this._renderSailorList();
    }

    _renderSailorList() {
      const container = document.getElementById('sailor-list-container');
      if (!container) return;
      const today = new Date(); today.setHours(0,0,0,0);
      const query = (document.getElementById('sailor-search')?.value || '').toLowerCase();

      // Get sorted sailors using SPSStore Fairness Rotation Engine
      let list = window.spsStore.getSortedSailors(this._sortBy, this._tradeFilter);

      // Filter active vs inactive attachments
      if (this._activeSection === 'active') {
        list = list.filter(s => {
          const activeAtts = window.spsStore.getAttachmentsBySailor(s.official_number).filter(a => new Date(a.to_date) >= today);
          return activeAtts.length > 0;
        });
      } else {
        list = list.filter(s => {
          const activeAtts = window.spsStore.getAttachmentsBySailor(s.official_number).filter(a => new Date(a.to_date) >= today);
          return activeAtts.length === 0;
        });
      }

      if (query) {
        list = list.filter(s =>
          s.name.toLowerCase().includes(query) ||
          s.official_number.toLowerCase().includes(query) ||
          s.trade.toLowerCase().includes(query));
      }

      if (list.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding:30px;">
          <i class="fas fa-user-slash"></i>
          <p>No sailors matching criteria.</p>
        </div>`;
        return;
      }

      container.innerHTML = list.map(s => {
        const metrics = window.spsStore.getSailorFairnessMetrics(s.official_number);
        const history = window.spsStore.getSailorAttachmentHistory(s.official_number);
        
        const currentProjs = history.filter(h => new Date(h.to_date) >= today).map(h => h.project_title).join(', ');
        const icon = TRADE_ICONS[s.trade] || '⚓';
        const isSelected = this._selSailor === s.official_number;

        return `<div class="sailor-card ${s.status==='Active'?'active-att':'inactive-att'} ${isSelected?'selected-card':''}"
                     onclick="window.labourCentre.selectSailor('${s.official_number}')"
                     style="${isSelected?'border-color:var(--accent);background:var(--bg-card-alt);':''}">
          <div class="sailor-avatar">${icon}</div>
          <div class="sailor-info">
            <div style="display:flex;align-items:center;gap:6px;">
              <span class="sailor-name">${s.name}</span>
              <span style="font-size:0.65rem;font-weight:700;padding:2px 6px;border-radius:10px;background:${metrics.religiousDays===0?'rgba(34,197,94,0.2)':'rgba(245,158,11,0.2)'};color:${metrics.religiousDays===0?'var(--success)':'var(--warning)'};">
                ${metrics.religiousDays === 0 ? '⭐ 0 Rel Days (High Priority)' : `${metrics.religiousDays} Rel Days`}
              </span>
            </div>
            <div class="sailor-sub">${s.official_number} · ${s.rank} · <span style="color:var(--accent);font-weight:700;">${s.trade}</span></div>
            ${currentProjs ? `<div class="sailor-proj"><i class="fas fa-project-diagram" style="font-size:0.65rem;margin-right:4px;"></i>Attached: ${currentProjs}</div>` : ''}
          </div>
          <div class="sailor-stats">
            <div class="sailor-days">${metrics.totalDays}</div>
            <div class="sailor-days-lbl">Total SP Days</div>
          </div>
        </div>`;
      }).join('');
    }

    filterSailors() {
      this._renderSailorList();
    }

    selectSailor(officialNumber) {
      this._selSailor = officialNumber;
      this._renderSailorList();
      document.getElementById('sailor-calendar-panel').style.display = 'block';
      document.getElementById('headcount-panel').style.display = 'none';
      this._renderCalendar();
      this._renderSailorStats(officialNumber);
    }

    _renderCalendar() {
      const grid   = document.getElementById('sailor-calendar-grid');
      const legend = document.getElementById('cal-legend');
      const label  = document.getElementById('cal-month-label');
      if (!grid || !this._selSailor) return;

      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      label.textContent = `${monthNames[this._calMonth]} ${this._calYear}`;

      const attachments = window.spsStore.getAttachmentsBySailor(this._selSailor);
      const projectMap  = {};
      attachments.forEach(a => {
        const p = window.spsStore.getProject(a.project_id);
        if (p) projectMap[a.project_id] = p;
      });

      const firstDay = new Date(this._calYear, this._calMonth, 1);
      const lastDay  = new Date(this._calYear, this._calMonth + 1, 0);
      const startPad = firstDay.getDay();
      const today    = new Date(); today.setHours(0,0,0,0);

      const dayCategory = {};
      attachments.forEach(a => {
        const from = new Date(a.from_date); from.setHours(0,0,0,0);
        const to   = new Date(a.to_date);   to.setHours(0,0,0,0);
        const proj = projectMap[a.project_id];
        if (!proj) return;
        const cat  = CAT_COLORS[proj.category] || 'misc';
        let cur = new Date(from);
        while (cur <= to) {
          if (cur.getMonth() === this._calMonth && cur.getFullYear() === this._calYear) {
            dayCategory[cur.getDate()] = cat;
          }
          cur.setDate(cur.getDate() + 1);
        }
      });

      const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
      let html = '<div class="cal-grid">';
      days.forEach(d => { html += `<div class="cal-day-name">${d}</div>`; });

      for (let i = 0; i < startPad; i++) html += '<div class="cal-day empty"></div>';
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const isToday  = today.getDate() === d && today.getMonth() === this._calMonth && today.getFullYear() === this._calYear;
        const attached = dayCategory[d];
        const cls = [
          'cal-day',
          isToday ? 'today' : '',
          attached ? `attached-${attached}` : ''
        ].filter(Boolean).join(' ');
        html += `<div class="${cls}" title="${attached ? 'Attached: ' + (Object.values(projectMap).find(p => CAT_COLORS[p.category] === attached)?.title || attached) : 'Not attached'}">${d}</div>`;
      }
      html += '</div>';
      grid.innerHTML = html;

      const usedCats = [...new Set(Object.values(dayCategory))];
      const catNames = { religious: 'Religious', csl: 'Clean Sri Lanka', housing: 'Housing', misc: 'Miscellaneous' };
      legend.innerHTML = usedCats.map(cat =>
        `<div class="cal-legend-item"><div class="legend-dot dot-${cat}"></div>${catNames[cat]||cat}</div>`
      ).join('');
    }

    _renderSailorStats(officialNumber) {
      const statsEl = document.getElementById('sailor-detail-stats');
      if (!statsEl) return;

      const history = window.spsStore.getSailorAttachmentHistory(officialNumber);
      const metrics = window.spsStore.getSailorFairnessMetrics(officialNumber);
      const today = new Date(); today.setHours(0,0,0,0);

      const sailorObj = window.spsStore.sailors.find(s => s.official_number === officialNumber) || { name: officialNumber };
      document.getElementById('cal-sailor-name').innerHTML = `<i class="fas fa-user"></i> ${sailorObj.name}`;

      let html = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
          <div style="background:var(--bg-surface);border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:900;font-family:var(--mono);color:var(--religious);">${metrics.religiousDays}</div>
            <div style="font-size:0.68rem;color:var(--text-dim);">Religious Days</div>
          </div>
          <div style="background:var(--bg-surface);border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:900;font-family:var(--mono);color:var(--accent);">${metrics.otherDays}</div>
            <div style="font-size:0.68rem;color:var(--text-dim);">Other CSR Days</div>
          </div>
          <div style="background:var(--bg-surface);border-radius:8px;padding:10px;text-align:center;">
            <div style="font-size:1.3rem;font-weight:900;font-family:var(--mono);color:var(--success);">${metrics.totalDays}</div>
            <div style="font-size:0.68rem;color:var(--text-dim);">Total SP Days</div>
          </div>
        </div>
      `;

      html += `<div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Previous Location & Attachment History</div>`;
      
      if (history.length === 0) {
        html += `<div style="font-size:0.8rem;color:var(--text-dim);padding:10px;background:var(--bg-surface);border-radius:6px;">No previous attachment records.</div>`;
      } else {
        html += `<div style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow-y:auto;">`;
        history.forEach(h => {
          const catCls = CAT_COLORS[h.category] || 'misc';
          const isActive = new Date(h.to_date) >= today;
          html += `
            <div style="background:var(--bg-surface);border-radius:6px;padding:9px 12px;display:flex;align-items:center;gap:10px;border-left:3px solid var(--${catCls});">
              <div style="flex:1;">
                <div style="font-size:0.82rem;font-weight:700;">${h.project_title}</div>
                <div style="font-size:0.73rem;color:var(--text-muted);"><i class="fas fa-map-marker-alt" style="margin-right:4px;"></i>${h.location} · Category: ${h.category}</div>
                <div style="font-size:0.7rem;color:var(--text-dim);">${h.from_date} → ${h.to_date}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-family:var(--mono);font-weight:700;font-size:0.85rem;color:var(--accent);">${h.days_attached} days</div>
                <span class="status-badge ${isActive?'status-active':'status-completed'}" style="font-size:0.65rem;">${isActive?'Active':'Past'}</span>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      }

      statsEl.innerHTML = html;
    }

    renderHeadcount() {
      const grid     = document.getElementById('headcount-grid');
      const dateDisp = document.getElementById('hc-date-display');
      if (!grid) return;
      const dateStr = document.getElementById('hc-date')?.value || new Date().toISOString().split('T')[0];
      if (dateDisp) dateDisp.textContent = dateStr;

      const counts = window.spsStore.getHeadcountByDate(dateStr);
      const projects = window.spsStore.projects;

      if (projects.length === 0) { grid.innerHTML = `<div class="empty-state"><i class="fas fa-users"></i><p>No projects yet.</p></div>`; return; }

      const totalLabour = Object.values(counts).reduce((s,v) => s+v, 0);
      let html = `<div style="background:linear-gradient(135deg,rgba(56,189,248,0.1),rgba(79,70,229,0.1));border:1px solid rgba(56,189,248,0.2);border-radius:10px;padding:14px;text-align:center;grid-column:1/-1;margin-bottom:4px;">
        <div style="font-size:2rem;font-weight:900;font-family:var(--mono);color:var(--accent);">${totalLabour}</div>
        <div style="font-size:0.78rem;color:var(--text-muted);">Total Sailors on Special Projects · ${dateStr}</div>
      </div>`;

      projects.filter(p => p.status !== 'Completed').forEach(p => {
        const cnt    = counts[p.id] || 0;
        const catCls = CAT_COLORS[p.category] || 'misc';
        html += `<div class="headcount-card" style="border-top:3px solid var(--${catCls});">
          <div class="hc-count" style="color:var(--${catCls});">${cnt}</div>
          <div class="hc-project" style="color:var(--${catCls});">${p.code}</div>
          <div style="font-size:0.7rem;color:var(--text-dim);margin-top:3px;">${p.category}</div>
        </div>`;
      });
      grid.innerHTML = html;
    }

    prevMonth() {
      this._calMonth--;
      if (this._calMonth < 0) { this._calMonth = 11; this._calYear--; }
      this._renderCalendar();
    }

    nextMonth() {
      this._calMonth++;
      if (this._calMonth > 11) { this._calMonth = 0; this._calYear++; }
      this._renderCalendar();
    }

    openBulkUpload() {
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `<div class="modal" style="max-width:600px;">
        <div class="modal-header">
          <h2><i class="fas fa-upload" style="margin-right:8px;color:var(--accent);"></i>Bulk Upload Labour Attachments</h2>
          <button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button>
        </div>
        <div class="modal-body">
          <div class="drop-zone" id="bulk-drop-zone">
            <i class="fas fa-file-csv"></i>
            <p>Drag & Drop CSV file here, or click to browse</p>
            <small>Format: project_id, official_number, name, rank, trade, from_date (YYYY-MM-DD), to_date (YYYY-MM-DD)</small>
            <input type="file" id="bulk-csv-input" accept=".csv" style="display:none;" onchange="window.labourCentre.processBulkCSV(this)">
          </div>

          <div style="display:flex;gap:10px;margin-top:10px;">
            <button class="btn btn-secondary btn-sm" onclick="window.labourCentre.downloadTemplate()">
              <i class="fas fa-download"></i> Download Template
            </button>
          </div>

          <div id="bulk-preview" style="margin-top:14px;"></div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-surface);">
          <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
          <button class="btn btn-primary" id="bulk-import-btn" style="display:none;" onclick="window.labourCentre.importBulk()">
            <i class="fas fa-check"></i> Import Attachments
          </button>
        </div>
      </div>`;
      overlay.classList.add('open');

      const dz = document.getElementById('bulk-drop-zone');
      dz.addEventListener('click', () => document.getElementById('bulk-csv-input').click());
      dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragging'); });
      dz.addEventListener('dragleave', () => dz.classList.remove('dragging'));
      dz.addEventListener('drop', e => {
        e.preventDefault(); dz.classList.remove('dragging');
        const file = e.dataTransfer.files[0];
        if (file) { const inp = document.getElementById('bulk-csv-input'); inp.files = e.dataTransfer.files; this.processBulkCSV(inp); }
      });
    }

    processBulkCSV(input) {
      const file = input.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = e.target.result.split('\n').filter(l => l.trim());
        const rows  = [];
        const header = lines[0].toLowerCase();
        const startIdx = header.includes('project_id') ? 1 : 0;

        for (let i = startIdx; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/"/g,''));
          if (cols.length >= 7) {
            rows.push({
              project_id:      cols[0],
              official_number: cols[1],
              name:            cols[2],
              rank:            cols[3],
              trade:           cols[4].toUpperCase(),
              from_date:       cols[5],
              to_date:         cols[6],
              status:          'Active'
            });
          }
        }

        this._parsedBulkData = rows;
        const prev = document.getElementById('bulk-preview');
        if (rows.length === 0) {
          prev.innerHTML = `<div style="color:var(--danger);">⚠ No valid rows found. Check CSV format.</div>`;
          return;
        }
        prev.innerHTML = `
          <div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:8px;padding:12px;margin-bottom:10px;">
            ✅ Parsed <strong>${rows.length} attachment records</strong> ready to import
          </div>
          <div style="max-height:200px;overflow-y:auto;">
            <table class="sps-table">
              <thead><tr><th>Project ID</th><th>Service No.</th><th>Name</th><th>Trade</th><th>From</th><th>To</th></tr></thead>
              <tbody>${rows.slice(0,10).map(r => `<tr><td class="mono">${r.project_id}</td><td class="mono">${r.official_number}</td><td>${r.name}</td><td>${r.trade}</td><td>${r.from_date}</td><td>${r.to_date}</td></tr>`).join('')}
              ${rows.length > 10 ? `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);">...and ${rows.length-10} more rows</td></tr>` : ''}</tbody>
            </table>
          </div>`;
        document.getElementById('bulk-import-btn').style.display = 'flex';
      };
      reader.readAsText(file);
    }

    importBulk() {
      if (!this._parsedBulkData || this._parsedBulkData.length === 0) return;
      window.spsStore.bulkAddAttachments(this._parsedBulkData);
      document.getElementById('generic-modal-overlay').classList.remove('open');
      window.app.toast(`✅ ${this._parsedBulkData.length} attachment records imported!`, 'success');
      this._parsedBulkData = null;
      this.render();
      window.app.renderDashboard();
    }

    downloadTemplate() {
      const csv = 'project_id,official_number,name,rank,trade,from_date,to_date\nSP-REL-001,MA/1234,AB Kamal Perera,AB,MA,2026-06-01,2026-09-30\n';
      const blob = new Blob([csv], {type:'text/csv'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'SPS_Labour_Upload_Template.csv';
      a.click();
    }
  }

  window.labourCentre = new LabourCentre();
})();
