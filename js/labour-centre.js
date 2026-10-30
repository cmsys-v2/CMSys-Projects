// ============================================================
// SPS — Labour & Personnel Center Suite (V6.0)
// Features:
// 1. Dual View Modes: Rotation & Calendar View / Master Personnel Register Table
// 2. Interactive Calendar with Deployment, Leave, Sick, Others & Highlighted V/Out / Out Projects
// 3. Sailor ID Photos across cards, calendar, tables, and modal with click-to-enlarge Lightbox
// 4. Comprehensive Master Table with Deployed Days (V/In & V/Out), Sick Days, Leave Period, Performance, Home Location & Sorting
// 5. Full CMSys Main Sailor Profile Modal Replica
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
      this._viewMode = 'calendar'; // 'calendar' | 'table'
      this._calMonth = 9; // October (0-indexed = 9) as current anchor
      this._calYear = 2026;
      this._selSailor = null;
      this._activeSection = 'active'; // 'active' | 'inactive'
      this._sortBy = 'least_religious';
      this._tradeFilter = 'ALL';

      // Master Register Table State
      this._tablePeriodPreset = '2026-10';
      this._tableStartDate = '2026-10-01';
      this._tableEndDate = '2026-10-31';
      this._tableSortField = 'total_deployed';
      this._tableSortOrder = 'desc';
      this._tableTradeFilter = 'ALL';
      this._tableVictualingFilter = 'ALL';
      this._tableStatusFilter = 'ALL';
      this._tableSearch = '';

      // Profile Modal internal state
      this._activeProfileSailor = null;
      this._profCalYear = 2026;
      this._profCalMonth = 9;
      this._profPeriodMode = 'monthly'; // 'monthly' | 'since_joined' | 'custom'
      this._profPerfTab = 'weekly';
      this._nokRevealed = false;
    }

    render() {
      const view = document.getElementById('labour-view');
      if (!view) return;

      // Select first sailor if none selected yet
      if (!this._selSailor) {
        const sorted = window.spsStore.getSortedSailors(this._sortBy, this._tradeFilter);
        if (sorted.length > 0) this._selSailor = sorted[0].official_number;
      }

      view.innerHTML = `
        <!-- Top Navigation & View Switcher -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">
          <div class="labour-view-switcher" style="margin-bottom:0; flex:1; max-width:580px;">
            <button class="view-switch-btn ${this._viewMode==='calendar'?'active':''}" onclick="window.labourCentre.setViewMode('calendar')">
              <i class="fas fa-calendar-alt"></i> Rotation & Calendar View
            </button>
            <button class="view-switch-btn ${this._viewMode==='table'?'active':''}" onclick="window.labourCentre.setViewMode('table')">
              <i class="fas fa-table-list"></i> Master Personnel Register (Table View)
            </button>
          </div>

          <div style="display:flex; gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="window.labourCentre.openBulkUpload()">
              <i class="fas fa-upload"></i> Bulk Upload
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.app.openAttachLabourModal()">
              <i class="fas fa-user-plus"></i> Attach Sailor
            </button>
          </div>
        </div>

        <!-- Render active view container -->
        <div id="labour-content-container">
          ${this._viewMode === 'calendar' ? this._getCalendarViewHTML() : this._getTableViewHTML()}
        </div>
      `;

      if (this._viewMode === 'calendar') {
        this._renderSailorList();
        if (this._selSailor) {
          this._renderCalendar();
          this._renderSailorStats(this._selSailor);
        } else {
          this.renderHeadcount();
        }
      } else {
        this.renderTable();
      }
    }

    setViewMode(mode) {
      this._viewMode = mode;
      this.render();
    }

    // =========================================================================
    // VIEW 1: ROTATION & CALENDAR VIEW (Enhanced with Photos & V/Out)
    // =========================================================================
    _getCalendarViewHTML() {
      return `
        <div style="display:grid; grid-template-columns:1.05fr 1fr; gap:18px; align-items:start;">
          <!-- LEFT: Sailor Rotation List -->
          <div>
            <div class="section-header" style="margin-bottom:8px;">
              <div class="section-title"><i class="fas fa-users"></i> Sailors on Special Projects</div>
              <span style="font-size:0.75rem; color:var(--text-dim);">Equal Opportunity Rotation</span>
            </div>

            <!-- Active / Inactive Toggle -->
            <div style="display:flex; gap:4px; background:var(--bg-surface); border-radius:8px; padding:4px; margin-bottom:10px;">
              <button id="sec-active-btn" class="btn ${this._activeSection==='active'?'btn-primary':'btn-ghost'} btn-sm" style="flex:1;" onclick="window.labourCentre.setSection('active')">
                <i class="fas fa-circle" style="color:var(--success); font-size:0.6rem;"></i> Active Attached
              </button>
              <button id="sec-inactive-btn" class="btn ${this._activeSection==='inactive'?'btn-primary':'btn-ghost'} btn-sm" style="flex:1;" onclick="window.labourCentre.setSection('inactive')">
                <i class="fas fa-history" style="font-size:0.7rem;"></i> Past Attached
              </button>
            </div>

            <!-- Controls: Search, Sort Mode & Trade Filter -->
            <div style="display:flex; gap:8px; margin-bottom:10px; flex-wrap:wrap;">
              <div style="position:relative; flex:1; min-width:180px;">
                <i class="fas fa-search" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text-dim); font-size:0.82rem;"></i>
                <input class="form-control" id="sailor-search" placeholder="Search name, service no, trade, district..." style="padding-left:32px; height:34px; font-size:0.82rem;"
                       oninput="window.labourCentre.filterSailors()">
              </div>

              <select class="form-control" id="sailor-sort-select" style="width:190px; height:34px; font-size:0.78rem;" onchange="window.labourCentre.setSort(this.value)">
                <option value="least_religious" ${this._sortBy==='least_religious'?'selected':''}>⭐ Least Religious Days (Fair)</option>
                <option value="least_total" ${this._sortBy==='least_total'?'selected':''}>Least Total SP Days</option>
                <option value="most_total" ${this._sortBy==='most_total'?'selected':''}>Most Total SP Days</option>
                <option value="trade" ${this._sortBy==='trade'?'selected':''}>Sort by Trade</option>
              </select>

              <select class="form-control" id="sailor-trade-select" style="width:110px; height:34px; font-size:0.78rem;" onchange="window.labourCentre.setTradeFilter(this.value)">
                <option value="ALL">All Trades</option>
                <option value="MA">MA</option><option value="CA">CA</option><option value="PA">PA</option>
                <option value="PL">PL</option><option value="WE">WE</option><option value="BB">BB</option>
                <option value="AL">AL</option><option value="SW">SW</option>
              </select>
            </div>

            <div id="sailor-list-container" style="display:flex; flex-direction:column; gap:8px; max-height:560px; overflow-y:auto; padding-right:4px;"></div>
          </div>

          <!-- RIGHT: Sailor Detail / Calendar -->
          <div>
            <div class="section-header" style="margin-bottom:8px;">
              <div class="section-title"><i class="fas fa-calendar-alt"></i> Attachment Calendar</div>
              <div id="headcount-date-picker" style="display:flex; align-items:center; gap:8px;">
                <label style="font-size:0.78rem; color:var(--text-muted);">Headcount Date:</label>
                <input type="date" class="form-control" id="hc-date" value="${this._calYear}-10-18"
                       style="width:145px; height:32px; font-size:0.8rem;" onchange="window.labourCentre.renderHeadcount()">
              </div>
            </div>

            <!-- Sailor Calendar Panel -->
            <div id="sailor-calendar-panel" style="display:${this._selSailor?'block':'none'};">
              <div class="panel" style="margin-top:2px;">
                <div class="panel-head" style="flex-wrap:wrap; gap:8px;">
                  <div id="cal-sailor-header" style="display:flex; align-items:center; gap:10px;">
                    <!-- Injected dynamically with photo, name & rank -->
                  </div>
                  <div style="display:flex; align-items:center; gap:6px;">
                    <button class="cal-nav" onclick="window.labourCentre.prevMonth()"><i class="fas fa-chevron-left"></i></button>
                    <span id="cal-month-label" style="font-size:0.82rem; font-weight:700; color:var(--text-secondary); padding:0 6px; align-self:center;"></span>
                    <button class="cal-nav" onclick="window.labourCentre.nextMonth()"><i class="fas fa-chevron-right"></i></button>
                    <button class="btn btn-primary btn-xs" id="btn-open-full-profile" onclick="window.labourCentre.openProfileModal(window.labourCentre._selSailor)">
                      <i class="fas fa-id-card"></i> CMSys Profile ↗
                    </button>
                  </div>
                </div>

                <div class="panel-body">
                  <div id="sailor-calendar-grid"></div>
                  
                  <!-- Enhanced Legend -->
                  <div class="cal-legend" id="cal-legend" style="margin-top:12px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.06);">
                    <div class="cal-legend-item">
                      <div class="legend-dot" style="background:#f59e0b; box-shadow:0 0 6px rgba(245,158,11,0.6);"></div>
                      <strong style="color:#f59e0b;">🥘 Victualing Out (V/Out) / Out Project</strong>
                    </div>
                    <div class="cal-legend-item">
                      <div class="legend-dot dot-housing"></div>
                      <span>⚓ V/In Deployment</span>
                    </div>
                    <div class="cal-legend-item">
                      <div class="legend-dot" style="background:#fbbf24;"></div>
                      <span>🏖️ Leave</span>
                    </div>
                    <div class="cal-legend-item">
                      <div class="legend-dot" style="background:#f43f5e;"></div>
                      <span>🏥 Sick</span>
                    </div>
                    <div class="cal-legend-item">
                      <div class="legend-dot" style="background:#c084fc;"></div>
                      <span>⭐ Religious / Reserve Day</span>
                    </div>
                  </div>

                  <!-- Sailor stats & previous location history -->
                  <div id="sailor-detail-stats" style="margin-top:14px;"></div>
                </div>
              </div>
            </div>

            <!-- Headcount Panel (shown when no sailor selected) -->
            <div id="headcount-panel" style="display:${this._selSailor?'none':'block'}; margin-top:2px;">
              <div class="panel">
                <div class="panel-head">
                  <span class="panel-title"><i class="fas fa-users"></i> Headcount by Project</span>
                  <span id="hc-date-display" style="font-size:0.78rem; color:var(--text-muted);"></span>
                </div>
                <div class="panel-body">
                  <div class="headcount-grid" id="headcount-grid"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    _renderSailorList() {
      const container = document.getElementById('sailor-list-container');
      if (!container) return;
      const today = new Date(this._calYear, this._calMonth, 18); // Reference headcount date: 2026-10-18
      today.setHours(0,0,0,0);
      const query = (document.getElementById('sailor-search')?.value || '').toLowerCase();

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
          (s.name || '').toLowerCase().includes(query) ||
          (s.official_number || '').toLowerCase().includes(query) ||
          (s.trade || '').toLowerCase().includes(query) ||
          (s.district || s.home_location || '').toLowerCase().includes(query)
        );
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
        const currentProjs = history.filter(h => new Date(h.to_date) >= today);
        const isSelected = this._selSailor === s.official_number;

        const photo = window.spsStore.getSailorPhoto(s);
        const isVOut = (s.victualing_type === 'V/Out') || currentProjs.some(p => p.victualing === 'V/Out');

        const projsText = currentProjs.map(h => h.project_title).join(', ');

        return `<div class="sailor-card ${s.status==='Active'?'active-att':'inactive-att'} ${isSelected?'selected-card':''}"
                     onclick="window.labourCentre.selectSailor('${s.official_number}')"
                     style="${isSelected?'border-color:var(--accent); background:var(--bg-card-alt);':''}">
          
          <!-- Sailor ID Photo with Lightbox Enlarge on Click -->
          <div class="sailor-avatar" onclick="event.stopPropagation(); window.labourCentre.openLightbox('${photo.url}', '${this.escapeHtml(s.name)}', '${s.official_number}')" title="Click to view ID photo">
            <img src="${photo.url}" class="sailor-avatar-img" onerror="window.labourCentre.handleCardPicError(this, '${s.rank}', '${s.trade}')">
          </div>

          <div class="sailor-info">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span class="sailor-name">${s.name}</span>
              
              <!-- Fair Rotation Badge -->
              <span style="font-size:0.65rem; font-weight:700; padding:2px 6px; border-radius:10px; background:${metrics.religiousDays===0?'rgba(34,197,94,0.2)':'rgba(245,158,11,0.2)'}; color:${metrics.religiousDays===0?'var(--success)':'var(--warning)'};">
                ${metrics.religiousDays === 0 ? '⭐ 0 Rel Days (High Priority)' : `${metrics.religiousDays} Rel Days`}
              </span>

              <!-- Highlighted Victualing Out / In Badge -->
              ${isVOut 
                ? `<span class="sailor-vic-badge vic-badge-out" title="Victualing Out Allowance / External Site Active"><i class="fas fa-utensils"></i> V/Out</span>`
                : `<span class="sailor-vic-badge vic-badge-in"><i class="fas fa-anchor"></i> V/In</span>`
              }
            </div>

            <div class="sailor-sub" style="margin-top:2px;">
              ${s.official_number} · ${s.rank} · <span style="color:var(--accent); font-weight:700;">${s.trade}</span>
              ${s.district ? ` · <span style="color:var(--text-dim);"><i class="fas fa-map-marker-alt" style="font-size:0.65rem;"></i> ${s.district}</span>` : ''}
            </div>

            ${projsText ? `<div class="sailor-proj"><i class="fas fa-project-diagram" style="font-size:0.65rem; margin-right:4px;"></i>Attached: ${projsText}</div>` : ''}

            <!-- Quick Profile Action Link -->
            <div style="margin-top:4px;">
              <button class="btn btn-ghost btn-xs" style="padding:1px 6px; font-size:0.68rem; color:var(--accent);" onclick="event.stopPropagation(); window.labourCentre.openProfileModal('${s.official_number}')">
                <i class="fas fa-id-card" style="margin-right:3px;"></i> View Full Profile
              </button>
            </div>
          </div>

          <div class="sailor-stats">
            <div class="sailor-days">${metrics.totalDays}</div>
            <div class="sailor-days-lbl">Total SP Days</div>
          </div>
        </div>`;
      }).join('');
    }

    handleCardPicError(img, rank, trade) {
      if (!img) return;
      const parent = img.parentElement;
      if (parent) {
        parent.innerHTML = `
          <div class="sailor-avatar-fallback">
            <span>${rank || 'AB'}</span>
            <span style="font-size:0.55rem; color:#38bdf8;">${trade || 'MA'}</span>
          </div>
        `;
      }
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

    filterSailors(immediate = false) {
      if (immediate) {
        clearTimeout(this._sailorSearchDebounce);
        this._renderSailorList();
        return;
      }
      clearTimeout(this._sailorSearchDebounce);
      this._sailorSearchDebounce = setTimeout(() => {
        this._renderSailorList();
      }, 150);
    }

    selectSailor(officialNumber) {
      this._selSailor = officialNumber;
      this._renderSailorList();
      const calPanel = document.getElementById('sailor-calendar-panel');
      const hcPanel = document.getElementById('headcount-panel');
      if (calPanel) calPanel.style.display = 'block';
      if (hcPanel) hcPanel.style.display = 'none';
      this._renderCalendar();
      this._renderSailorStats(officialNumber);
    }

    // ── Calendar Rendering with Deployment, Leave, Sick & Highlighted V/Out ──
    _renderCalendar() {
      const grid   = document.getElementById('sailor-calendar-grid');
      const label  = document.getElementById('cal-month-label');
      const hdrEl  = document.getElementById('cal-sailor-header');
      if (!grid || !this._selSailor) return;

      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      label.textContent = `${monthNames[this._calMonth]} ${this._calYear}`;

      const sailor = window.spsStore.getSailor(this._selSailor) || { official_number: this._selSailor, name: this._selSailor, rank: 'AB', trade: 'MA' };
      const photo = window.spsStore.getSailorPhoto(sailor);

      // Populate Calendar Header with Sailor ID Pic & Metadata
      if (hdrEl) {
        hdrEl.innerHTML = `
          <div class="pt-avatar" onclick="window.labourCentre.openLightbox('${photo.url}', '${this.escapeHtml(sailor.name)}', '${sailor.official_number}')" title="Click to view ID photo" style="width:36px; height:40px; cursor:pointer;">
            <img src="${photo.url}" onerror="this.src='assets/img/cmsys-emblem.png'">
          </div>
          <div>
            <div style="font-size:0.9rem; font-weight:800; color:#fff;">${sailor.name}</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">
              ${sailor.official_number} · ${sailor.rank} · <strong style="color:var(--accent);">${sailor.trade}</strong>
              ${sailor.district ? ` · <span style="color:#38bdf8;"><i class="fas fa-map-marker-alt"></i> ${sailor.district}</span>` : ''}
            </div>
          </div>
        `;
      }

      // Calculate month period metrics
      const firstDay = new Date(this._calYear, this._calMonth, 1);
      const lastDay  = new Date(this._calYear, this._calMonth + 1, 0);
      const startPad = firstDay.getDay(); // 0 is Sunday
      const todayStr = '2026-10-18'; // Headcount reference date

      const mStartStr = `${this._calYear}-${String(this._calMonth + 1).padStart(2, '0')}-01`;
      const mEndStr   = `${this._calYear}-${String(this._calMonth + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

      const periodMetrics = window.spsStore.getSailorPeriodMetrics(this._selSailor, mStartStr, mEndStr);
      const dayMap = periodMetrics.calendarDayMap;

      const daysOfWeek = ['Su','Mo','Tu','We','Th','Fr','Sa'];
      let html = '<div class="cal-grid">';
      daysOfWeek.forEach(d => { html += `<div class="cal-day-name">${d}</div>`; });

      for (let i = 0; i < startPad; i++) {
        html += '<div class="cal-day empty"></div>';
      }

      for (let d = 1; d <= lastDay.getDate(); d++) {
        const dStr = `${this._calYear}-${String(this._calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = dStr === todayStr;
        const info = dayMap[dStr] || {};

        let cellCls = ['cal-day', isToday ? 'today' : ''];
        let badgesHtml = '';

        if (info.type === 'vout') {
          cellCls.push('day-vout');
          let pTitle = info.details?.project_title;
          const pId = info.details?.project_id || '';
          if ((!pTitle || pTitle === pId) && pId) {
            const p = window.spsStore.getProject(pId) || (window.spsStore.getNavalProject && window.spsStore.getNavalProject(pId));
            if (p) pTitle = p.title || p.projectName || p.name;
          }
          if (!pTitle) pTitle = 'Out Project';

          badgesHtml = `
            <div class="cal-day-badges">
              <span class="cbadge cbadge-vout" title="Victualing Out (V/Out): ${this.escapeHtml(pTitle)}${pId ? ' (' + this.escapeHtml(pId) + ')' : ''}">
                <i class="fas fa-utensils"></i> V/Out
              </span>
              <span class="cal-day-proj proj-vout" style="font-size:0.58rem; color:#f59e0b; font-weight:700; line-height:1.15; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; word-break:break-word;" title="${this.escapeHtml(pTitle)}${pId ? ' (' + this.escapeHtml(pId) + ')' : ''}">
                ${this.escapeHtml(pTitle)}
              </span>
            </div>
          `;
        } else if (info.type === 'vin') {
          cellCls.push('day-vin');
          let pTitle = info.details?.project_title;
          const pId = info.details?.project_id || '';
          if ((!pTitle || pTitle === pId) && pId) {
            const p = window.spsStore.getProject(pId) || (window.spsStore.getNavalProject && window.spsStore.getNavalProject(pId));
            if (p) pTitle = p.title || p.projectName || p.name;
          }
          if (!pTitle) pTitle = 'Naval Duty';

          badgesHtml = `
            <div class="cal-day-badges">
              <span class="cbadge cbadge-vin" title="Victualing In: ${this.escapeHtml(pTitle)}${pId ? ' (' + this.escapeHtml(pId) + ')' : ''}">
                <i class="fas fa-anchor"></i> V/In
              </span>
              <span class="cal-day-proj proj-vin" style="font-size:0.58rem; color:#38bdf8; font-weight:700; line-height:1.15; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; word-break:break-word;" title="${this.escapeHtml(pTitle)}${pId ? ' (' + this.escapeHtml(pId) + ')' : ''}">
                ${this.escapeHtml(pTitle)}
              </span>
            </div>
          `;
        } else if (info.type === 'leave') {
          cellCls.push('day-leave');
          badgesHtml = `
            <div class="cal-day-badges">
              <span class="cbadge cbadge-leave" title="On Leave"><i class="fas fa-umbrella-beach"></i> Leave</span>
            </div>
          `;
        } else if (info.type === 'sick') {
          cellCls.push('day-sick');
          badgesHtml = `
            <div class="cal-day-badges">
              <span class="cbadge cbadge-sick" title="Sick / Medical Attendance (${info.status})"><i class="fas fa-hospital"></i> Sick</span>
            </div>
          `;
        } else if (info.type === 'other') {
          cellCls.push('day-other');
          badgesHtml = `
            <div class="cal-day-badges">
              <span class="cbadge cbadge-other" title="Religious Day / Reserve Duty"><i class="fas fa-star"></i> R/D</span>
            </div>
          `;
        }

        html += `
          <div class="${cellCls.filter(Boolean).join(' ')}" onclick="window.labourCentre.inspectDay('${dStr}')" title="${dStr}: ${info.type ? info.type.toUpperCase() : 'Available'}">
            <span class="cal-day-num">${d}</span>
            ${badgesHtml}
          </div>
        `;
      }

      html += '</div>';
      grid.innerHTML = html;
    }

    inspectDay(dateStr) {
      if (!this._selSailor) return;
      const metrics = window.spsStore.getSailorPeriodMetrics(this._selSailor, dateStr, dateStr);
      const info = metrics.calendarDayMap[dateStr];
      if (!info) return;

      let detailText = 'Available / General Base Duty';
      if (info.type === 'vout') {
        detailText = `🥘 VICTUALING OUT (V/OUT): Attached to ${info.details?.project_title || 'Out Project'} (${info.details?.location || 'External'})`;
      } else if (info.type === 'vin') {
        detailText = `⚓ VICTUALING IN (V/IN): Attached to ${info.details?.project_title || 'Naval Project'}`;
      } else if (info.type === 'leave') {
        detailText = `🏖️ ON LEAVE: Approved annual / regular leave`;
      } else if (info.type === 'sick') {
        detailText = `🏥 SICK QUARTERS: Exempted duty on medical list (${info.status})`;
      } else if (info.type === 'other') {
        detailText = `⭐ RELIGIOUS / RESERVE DUTY (${info.status})`;
      }

      window.app.toast(`📅 ${dateStr} — ${detailText}`, info.type === 'vout' ? 'warning' : 'info');
    }

    _renderSailorStats(officialNumber) {
      const statsEl = document.getElementById('sailor-detail-stats');
      if (!statsEl) return;

      const mStartStr = `${this._calYear}-${String(this._calMonth + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(this._calYear, this._calMonth + 1, 0).getDate();
      const mEndStr   = `${this._calYear}-${String(this._calMonth + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const metrics = window.spsStore.getSailorPeriodMetrics(officialNumber, mStartStr, mEndStr);
      const fairness = window.spsStore.getSailorFairnessMetrics(officialNumber);
      const history = metrics.history;

      let html = `
        <!-- Month Summary KPI Row -->
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-bottom:12px;">
          <!-- Highlighted Victualing Out -->
          <div style="background:linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.1)); border:1px solid rgba(245,158,11,0.4); border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:1.25rem; font-weight:900; font-family:var(--mono); color:#f59e0b;">${metrics.deployedDaysVicOut} d</div>
            <div style="font-size:0.65rem; color:#f59e0b; font-weight:700;">🥘 Deployed (V/Out)</div>
          </div>

          <!-- Victualing In -->
          <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:1.25rem; font-weight:900; font-family:var(--mono); color:#38bdf8;">${metrics.deployedDaysVicIn} d</div>
            <div style="font-size:0.65rem; color:var(--text-dim); font-weight:700;">⚓ Deployed (V/In)</div>
          </div>

          <!-- Leave Days -->
          <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:1.25rem; font-weight:900; font-family:var(--mono); color:#fbbf24;">${metrics.leaveDays} d</div>
            <div style="font-size:0.65rem; color:var(--text-dim); font-weight:700;">🏖️ Leave Days</div>
          </div>

          <!-- Sick Days -->
          <div style="background:var(--bg-surface); border:1px solid var(--border); border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:1.25rem; font-weight:900; font-family:var(--mono); color:${metrics.sickDays > 0 ? '#f43f5e' : 'var(--text-secondary)'};">${metrics.sickDays} d</div>
            <div style="font-size:0.65rem; color:var(--text-dim); font-weight:700;">🏥 Sick Days</div>
          </div>
        </div>

        <!-- Sailor Core Demographics & Fair Rotation Snapshot -->
        <div style="background:var(--bg-surface); border-radius:8px; padding:10px 14px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>
            <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fas fa-home" style="margin-right:4px;"></i>Home Location:</span>
            <strong style="font-size:0.8rem; color:#fff; margin-left:4px;">${metrics.homeLocation}</strong>
          </div>
          <div>
            <span style="font-size:0.75rem; color:var(--text-muted);"><i class="fas fa-star" style="margin-right:4px; color:#f59e0b;"></i>Score:</span>
            <strong style="font-size:0.82rem; color:var(--accent); font-family:var(--mono);">${metrics.performanceScore.toFixed(2)} / 10</strong>
          </div>
          <div>
            <span style="font-size:0.75rem; color:var(--text-muted);">Total Career SP Days:</span>
            <strong style="font-size:0.82rem; color:var(--success); font-family:var(--mono); margin-left:4px;">${fairness.totalDays} d</strong>
          </div>
        </div>

        <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px;">
          <i class="fas fa-history" style="margin-right:5px;"></i> Previous Location & Attachment History
        </div>
      `;

      if (history.length === 0) {
        html += `<div style="font-size:0.8rem; color:var(--text-dim); padding:10px; background:var(--bg-surface); border-radius:6px;">No previous attachment records.</div>`;
      } else {
        html += `<div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">`;
        const today = new Date(this._calYear, this._calMonth, 18);
        history.forEach(h => {
          const catCls = CAT_COLORS[h.category] || 'misc';
          const isActive = new Date(h.to_date) >= today;
          html += `
            <div style="background:var(--bg-surface); border-radius:6px; padding:9px 12px; display:flex; align-items:center; gap:10px; border-left:3px solid var(--${catCls});">
              <div style="flex:1;">
                <div style="font-size:0.82rem; font-weight:700; display:flex; align-items:center; gap:6px;">
                  ${h.project_title}
                  ${h.victualing === 'V/Out' 
                    ? `<span class="sailor-vic-badge vic-badge-out" style="font-size:0.6rem; padding:1px 5px;"><i class="fas fa-utensils"></i> V/Out</span>`
                    : `<span class="sailor-vic-badge vic-badge-in" style="font-size:0.6rem; padding:1px 5px;"><i class="fas fa-anchor"></i> V/In</span>`
                  }
                </div>
                <div style="font-size:0.73rem; color:var(--text-muted);"><i class="fas fa-map-marker-alt" style="margin-right:4px;"></i>${h.location} · Category: ${h.category}</div>
                <div style="font-size:0.7rem; color:var(--text-dim);">${h.from_date} → ${h.to_date}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-family:var(--mono); font-weight:700; font-size:0.85rem; color:var(--accent);">${h.days_attached} days</div>
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
      const dateStr = document.getElementById('hc-date')?.value || `${this._calYear}-10-18`;
      if (dateDisp) dateDisp.textContent = dateStr;

      const counts = window.spsStore.getHeadcountByDate(dateStr);
      const projects = window.spsStore.projects;

      if (projects.length === 0) {
        grid.innerHTML = `<div class="empty-state"><i class="fas fa-users"></i><p>No projects yet.</p></div>`;
        return;
      }

      const totalLabour = Object.values(counts).reduce((s,v) => s+v, 0);
      let html = `<div style="background:linear-gradient(135deg,rgba(56,189,248,0.1),rgba(79,70,229,0.1)); border:1px solid rgba(56,189,248,0.2); border-radius:10px; padding:14px; text-align:center; grid-column:1/-1; margin-bottom:4px;">
        <div style="font-size:2rem; font-weight:900; font-family:var(--mono); color:var(--accent);">${totalLabour}</div>
        <div style="font-size:0.78rem; color:var(--text-muted);">Total Sailors on Special Projects · ${dateStr}</div>
      </div>`;

      projects.filter(p => p.status !== 'Completed').forEach(p => {
        const cnt    = counts[p.id] || 0;
        const catCls = CAT_COLORS[p.category] || 'misc';
        html += `<div class="headcount-card" style="border-top:3px solid var(--${catCls});">
          <div class="hc-count" style="color:var(--${catCls});">${cnt}</div>
          <div class="hc-project" style="color:var(--${catCls});">${p.code}</div>
          <div style="font-size:0.7rem; color:var(--text-dim); margin-top:3px;">${p.category}</div>
        </div>`;
      });
      grid.innerHTML = html;
    }

    prevMonth() {
      this._calMonth--;
      if (this._calMonth < 0) { this._calMonth = 11; this._calYear--; }
      this._renderCalendar();
      if (this._selSailor) this._renderSailorStats(this._selSailor);
    }

    nextMonth() {
      this._calMonth++;
      if (this._calMonth > 11) { this._calMonth = 0; this._calYear++; }
      this._renderCalendar();
      if (this._selSailor) this._renderSailorStats(this._selSailor);
    }

    // =========================================================================
    // VIEW 2: MASTER PERSONNEL REGISTER (TABLE VIEW — Requirement 4)
    // =========================================================================
    _getTableViewHTML() {
      return `
        <!-- KPI Summary Cards for Selected Period -->
        <div class="personnel-kpi-bar" id="table-kpi-bar">
          <!-- Rendered by renderTable() -->
        </div>

        <div class="personnel-table-card">
          <!-- Table Controls & Period Filter Bar -->
          <div class="personnel-filter-bar">
            <!-- Period Preset Selector -->
            <div style="display:flex; align-items:center; gap:6px;">
              <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted);"><i class="fas fa-calendar-range"></i> Period:</label>
              <select class="form-control" id="tbl-period-preset" style="width:180px; height:34px; font-size:0.78rem;" onchange="window.labourCentre.setTablePeriodPreset(this.value)">
                <option value="2026-10" ${this._tablePeriodPreset==='2026-10'?'selected':''}>October 2026 (Selected)</option>
                <option value="2026-09" ${this._tablePeriodPreset==='2026-09'?'selected':''}>September 2026</option>
                <option value="2026-08" ${this._tablePeriodPreset==='2026-08'?'selected':''}>August 2026</option>
                <option value="last_3_months" ${this._tablePeriodPreset==='last_3_months'?'selected':''}>Last 3 Months (Aug–Oct 2026)</option>
                <option value="year_2026" ${this._tablePeriodPreset==='year_2026'?'selected':''}>Year to Date (2026)</option>
                <option value="all_time" ${this._tablePeriodPreset==='all_time'?'selected':''}>All Time (Since Join)</option>
                <option value="custom" ${this._tablePeriodPreset==='custom'?'selected':''}>Custom Date Range...</option>
              </select>
            </div>

            <!-- Custom Date Inputs (shown when custom is picked) -->
            <div id="tbl-custom-dates" style="display:${this._tablePeriodPreset==='custom'?'flex':'none'}; align-items:center; gap:6px;">
              <input type="date" class="form-control" id="tbl-start-date" value="${this._tableStartDate}" style="width:130px; height:34px; font-size:0.78rem;" onchange="window.labourCentre.updateCustomDates()">
              <span style="font-size:0.75rem; color:var(--text-dim);">to</span>
              <input type="date" class="form-control" id="tbl-end-date" value="${this._tableEndDate}" style="width:130px; height:34px; font-size:0.78rem;" onchange="window.labourCentre.updateCustomDates()">
            </div>

            <!-- Search -->
            <div style="position:relative; flex:1; min-width:180px;">
              <i class="fas fa-search" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--text-dim); font-size:0.8rem;"></i>
              <input class="form-control" id="tbl-search-input" value="${this._tableSearch}" placeholder="Search name, official no, trade, district..."
                     style="padding-left:32px; height:34px; font-size:0.8rem;" oninput="window.labourCentre.setTableSearch(this.value)">
            </div>

            <!-- Trade Filter -->
            <select class="form-control" id="tbl-trade-filter" style="width:115px; height:34px; font-size:0.78rem;" onchange="window.labourCentre.setTableTrade(this.value)">
              <option value="ALL">All Trades</option>
              <option value="MA">MA</option><option value="CA">CA</option><option value="PA">PA</option>
              <option value="PL">PL</option><option value="WE">WE</option><option value="BB">BB</option>
              <option value="AL">AL</option><option value="SW">SW</option>
            </select>

            <!-- Victualing Filter -->
            <select class="form-control" id="tbl-vic-filter" style="width:150px; height:34px; font-size:0.78rem;" onchange="window.labourCentre.setTableVictualing(this.value)">
              <option value="ALL">All Victualing</option>
              <option value="V/Out">🥘 V/Out Only</option>
              <option value="V/In">⚓ V/In Only</option>
            </select>

            <!-- Actions -->
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="window.labourCentre.exportCSV()" title="Export table to CSV">
                <i class="fas fa-file-csv"></i> CSV
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.labourCentre.printTable()" title="Print / PDF">
                <i class="fas fa-print"></i> Print
              </button>
            </div>
          </div>

          <!-- Table Container -->
          <div class="personnel-table-wrapper">
            <table class="personnel-table" id="master-personnel-table">
              <thead>
                <tr>
                  <th style="width:36px;">#</th>
                  <th style="width:48px;">Photo</th>
                  <th class="th-sortable ${this._tableSortField==='official_number'?'th-sorted':''}" onclick="window.labourCentre.setTableSort('official_number')">
                    Service No ${this._getSortIcon('official_number')}
                  </th>
                  <th class="th-sortable ${this._tableSortField==='name'?'th-sorted':''}" onclick="window.labourCentre.setTableSort('name')">
                    Rank & Name ${this._getSortIcon('name')}
                  </th>
                  <th class="th-sortable ${this._tableSortField==='trade'?'th-sorted':''}" onclick="window.labourCentre.setTableSort('trade')">
                    Trade ${this._getSortIcon('trade')}
                  </th>
                  <th class="th-sortable ${this._tableSortField==='home_location'?'th-sorted':''}" onclick="window.labourCentre.setTableSort('home_location')">
                    Home Location (District) ${this._getSortIcon('home_location')}
                  </th>
                  <th class="th-sortable ${this._tableSortField==='vic_in'?'th-sorted':''}" onclick="window.labourCentre.setTableSort('vic_in')" style="text-align:right;">
                    Deployed (V/In) ${this._getSortIcon('vic_in')}
                  </th>
                  <th class="th-sortable ${this._tableSortField==='vic_out'?'th-sorted':''}" onclick="window.labourCentre.setTableSort('vic_out')" style="text-align:right; color:#f59e0b;">
                    🥘 Deployed (V/Out) ${this._getSortIcon('vic_out')}
                  </th>
                  <th class="th-sortable ${this._tableSortField==='total_deployed'?'th-sorted':''}" onclick="window.labourCentre.setTableSort('total_deployed')" style="text-align:right;">
                    Total Deployed ${this._getSortIcon('total_deployed')}
                  </th>
                  <th class="th-sortable ${this._tableSortField==='sick_days'?'th-sorted':''}" onclick="window.labourCentre.setTableSort('sick_days')" style="text-align:center;">
                    Sick Days ${this._getSortIcon('sick_days')}
                  </th>
                  <th class="th-sortable ${this._tableSortField==='leave_days'?'th-sorted':''}" onclick="window.labourCentre.setTableSort('leave_days')">
                    Leave Period for Selected Period ${this._getSortIcon('leave_days')}
                  </th>
                  <th class="th-sortable ${this._tableSortField==='performance'?'th-sorted':''}" onclick="window.labourCentre.setTableSort('performance')" style="text-align:center;">
                    Performance Score ${this._getSortIcon('performance')}
                  </th>
                  <th style="text-align:center;">Victualing</th>
                  <th style="text-align:center;">Actions</th>
                </tr>
              </thead>
              <tbody id="master-personnel-tbody">
                <!-- Injected dynamically by renderTable() -->
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    _getSortIcon(field) {
      if (this._tableSortField !== field) {
        return '<span class="sort-indicator" style="opacity:0.3;">↕</span>';
      }
      return this._tableSortOrder === 'asc' 
        ? '<span class="sort-indicator" style="color:#38bdf8;">▲</span>' 
        : '<span class="sort-indicator" style="color:#38bdf8;">▼</span>';
    }

    setTableSort(field) {
      if (this._tableSortField === field) {
        this._tableSortOrder = this._tableSortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this._tableSortField = field;
        this._tableSortOrder = (field === 'name' || field === 'official_number' || field === 'trade' || field === 'home_location') ? 'asc' : 'desc';
      }
      this.render();
    }

    setTablePeriodPreset(preset) {
      this._tablePeriodPreset = preset;
      const customDiv = document.getElementById('tbl-custom-dates');
      if (customDiv) customDiv.style.display = preset === 'custom' ? 'flex' : 'none';

      if (preset === '2026-10') {
        this._tableStartDate = '2026-10-01';
        this._tableEndDate = '2026-10-31';
      } else if (preset === '2026-09') {
        this._tableStartDate = '2026-09-01';
        this._tableEndDate = '2026-09-30';
      } else if (preset === '2026-08') {
        this._tableStartDate = '2026-08-01';
        this._tableEndDate = '2026-08-31';
      } else if (preset === 'last_3_months') {
        this._tableStartDate = '2026-08-01';
        this._tableEndDate = '2026-10-31';
      } else if (preset === 'year_2026') {
        this._tableStartDate = '2026-01-01';
        this._tableEndDate = '2026-10-31';
      } else if (preset === 'all_time') {
        this._tableStartDate = '2024-01-01';
        this._tableEndDate = '2026-12-31';
      }

      this.renderTable();
    }

    updateCustomDates() {
      const s = document.getElementById('tbl-start-date')?.value;
      const e = document.getElementById('tbl-end-date')?.value;
      if (s) this._tableStartDate = s;
      if (e) this._tableEndDate = e;
      this.renderTable();
    }

    setTableSearch(val, immediate = false) {
      this._tableSearch = val;
      if (immediate) {
        clearTimeout(this._tableSearchDebounce);
        this.renderTable();
        return;
      }
      clearTimeout(this._tableSearchDebounce);
      this._tableSearchDebounce = setTimeout(() => {
        this.renderTable();
      }, 150);
    }

    setTableTrade(val) {
      this._tableTradeFilter = val;
      this.renderTable();
    }

    setTableVictualing(val) {
      this._tableVictualingFilter = val;
      this.renderTable();
    }

    renderTable() {
      const tbody = document.getElementById('master-personnel-tbody');
      const kpiBar = document.getElementById('table-kpi-bar');
      if (!tbody) return;

      const filters = {
        search: this._tableSearch,
        trade: this._tableTradeFilter,
        victualing: this._tableVictualingFilter,
        status: this._tableStatusFilter
      };

      const rows = window.spsStore.getAllSailorsPeriodSummary(
        this._tableStartDate, 
        this._tableEndDate, 
        filters, 
        this._tableSortField, 
        this._tableSortOrder
      );

      // KPI Aggregation
      let totalVicIn = 0;
      let totalVicOut = 0;
      let totalSick = 0;
      let totalLeave = 0;
      let scoreSum = 0;

      rows.forEach(r => {
        totalVicIn += r.deployedDaysVicIn;
        totalVicOut += r.deployedDaysVicOut;
        totalSick += r.sickDays;
        totalLeave += r.leaveDays;
        scoreSum += r.performanceScore;
      });

      const avgScore = rows.length > 0 ? (scoreSum / rows.length).toFixed(2) : '0.00';

      if (kpiBar) {
        kpiBar.innerHTML = `
          <div class="pkpi-card">
            <div>
              <div class="pkpi-num" style="color:var(--text-primary);">${rows.length}</div>
              <div class="pkpi-label">Sailors Filtered</div>
            </div>
            <i class="fas fa-users" style="color:var(--text-muted); font-size:1.4rem;"></i>
          </div>

          <!-- Highlighted V/Out Days KPI -->
          <div class="pkpi-card" style="border-color:rgba(245,158,11,0.5); background:linear-gradient(135deg, rgba(245,158,11,0.12), rgba(217,119,6,0.06));">
            <div>
              <div class="pkpi-num" style="color:#f59e0b;">${totalVicOut} d</div>
              <div class="pkpi-label" style="color:#f59e0b;">🥘 Deployed (V/Out)</div>
            </div>
            <i class="fas fa-utensils" style="color:#f59e0b; font-size:1.4rem;"></i>
          </div>

          <!-- V/In Days KPI -->
          <div class="pkpi-card">
            <div>
              <div class="pkpi-num" style="color:#38bdf8;">${totalVicIn} d</div>
              <div class="pkpi-label">⚓ Deployed (V/In)</div>
            </div>
            <i class="fas fa-anchor" style="color:#38bdf8; font-size:1.4rem;"></i>
          </div>

          <!-- Sick Days KPI -->
          <div class="pkpi-card">
            <div>
              <div class="pkpi-num" style="color:#f43f5e;">${totalSick} d</div>
              <div class="pkpi-label">🏥 Sick Days</div>
            </div>
            <i class="fas fa-hospital" style="color:#f43f5e; font-size:1.4rem;"></i>
          </div>

          <!-- Leave Days KPI -->
          <div class="pkpi-card">
            <div>
              <div class="pkpi-num" style="color:#fbbf24;">${totalLeave} d</div>
              <div class="pkpi-label">🏖️ Leave Days</div>
            </div>
            <i class="fas fa-umbrella-beach" style="color:#fbbf24; font-size:1.4rem;"></i>
          </div>

          <!-- Avg Score -->
          <div class="pkpi-card">
            <div>
              <div class="pkpi-num" style="color:var(--accent);">${avgScore}</div>
              <div class="pkpi-label">⭐ Avg Score / 10</div>
            </div>
            <i class="fas fa-star" style="color:var(--accent); font-size:1.4rem;"></i>
          </div>
        `;
      }

      if (rows.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="14" style="text-align:center; padding:40px; color:var(--text-muted);">
              <i class="fas fa-user-slash" style="font-size:2rem; margin-bottom:8px; display:block;"></i>
              No sailors found matching current filter and period criteria.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = rows.map((r, idx) => {
        const photo = window.spsStore.getSailorPhoto(r.officialNumber);
        const hasVOut = r.deployedDaysVicOut > 0 || r.isVictualingOut;

        return `
          <tr>
            <td style="color:var(--text-dim); font-size:0.75rem;">${idx + 1}</td>
            
            <!-- Photo Thumbnail with click to enlarge -->
            <td>
              <div class="pt-avatar" onclick="window.labourCentre.openLightbox('${photo.url}', '${this.escapeHtml(r.name)}', '${r.officialNumber}')" title="Click to enlarge ID picture">
                <img src="${photo.url}" onerror="this.src='assets/img/cmsys-emblem.png'">
              </div>
            </td>

            <!-- Service No -->
            <td class="mono" style="font-weight:700; color:var(--text-secondary); white-space:nowrap;">
              ${r.officialNumber}
            </td>

            <!-- Rank & Name (Clickable to open CMSys Profile) -->
            <td>
              <a href="javascript:void(0)" onclick="window.labourCentre.openProfileModal('${r.officialNumber}')" 
                 style="color:#fff; font-weight:800; text-decoration:none; display:flex; align-items:center; gap:6px;">
                <span>${r.name}</span>
                <i class="fas fa-external-link-alt" style="font-size:0.65rem; color:var(--text-dim); opacity:0.6;"></i>
              </a>
              <div style="font-size:0.7rem; color:var(--text-muted);">${r.rank} · ${r.roll || 'VAS'}</div>
            </td>

            <!-- Trade -->
            <td>
              <span class="badge" style="background:rgba(56,189,248,0.15); color:#38bdf8; font-weight:800;">
                ${TRADE_ICONS[r.trade] || '⚓'} ${r.trade}
              </span>
            </td>

            <!-- Home Location (District) -->
            <td>
              <span style="display:inline-flex; align-items:center; gap:4px; font-weight:600; color:var(--text-secondary);">
                <i class="fas fa-map-marker-alt" style="color:#ef4444; font-size:0.72rem;"></i>
                ${r.homeLocation}
              </span>
            </td>

            <!-- Deployed (V/In) -->
            <td style="text-align:right; font-family:var(--mono); font-weight:700; color:#38bdf8;">
              ${r.deployedDaysVicIn > 0 ? `${r.deployedDaysVicIn} d` : '—'}
            </td>

            <!-- Highlighted Deployed (V/Out) -->
            <td class="vout-highlight-cell" style="text-align:right;">
              ${r.deployedDaysVicOut > 0 
                ? `<span>🥘 ${r.deployedDaysVicOut} d</span>` 
                : `<span style="color:var(--text-dim); font-weight:400;">—</span>`
              }
            </td>

            <!-- Total Deployed -->
            <td style="text-align:right; font-family:var(--mono); font-weight:800; color:${r.totalDeployedDays>0?'var(--success)':'var(--text-dim)'};">
              ${r.totalDeployedDays > 0 ? `${r.totalDeployedDays} d` : '0 d'}
            </td>

            <!-- Sick Days -->
            <td style="text-align:center;">
              ${r.sickDays > 0 
                ? `<span style="display:inline-block; padding:2px 7px; border-radius:10px; font-size:0.72rem; font-weight:800; background:rgba(244,63,94,0.2); color:#f43f5e; border:1px solid rgba(244,63,94,0.4);">🏥 ${r.sickDays} d</span>`
                : `<span style="color:var(--text-dim);">0</span>`
              }
            </td>

            <!-- Leave Period for Selected Period -->
            <td style="font-size:0.75rem;">
              ${r.leaveDays > 0 
                ? `<span style="display:inline-flex; align-items:center; gap:4px; color:#fbbf24; font-weight:700;">
                     <i class="fas fa-umbrella-beach"></i> ${r.leavePeriods}
                   </span>`
                : `<span style="color:var(--text-dim);">None</span>`
              }
            </td>

            <!-- Performance Score -->
            <td style="text-align:center; font-family:var(--mono); font-weight:800; color:var(--accent);">
              ⭐ ${r.performanceScore.toFixed(1)}
            </td>

            <!-- Victualing Status Badge -->
            <td style="text-align:center;">
              ${hasVOut 
                ? `<span class="sailor-vic-badge vic-badge-out"><i class="fas fa-utensils"></i> V/Out</span>`
                : `<span class="sailor-vic-badge vic-badge-in"><i class="fas fa-anchor"></i> V/In</span>`
              }
            </td>

            <!-- Actions -->
            <td style="text-align:center; white-space:nowrap;">
              <button class="btn btn-primary btn-xs" onclick="window.labourCentre.openProfileModal('${r.officialNumber}')" title="Open Full CMSys Profile">
                <i class="fas fa-user-shield"></i> Profile
              </button>
              <button class="btn btn-ghost btn-xs" onclick="window.labourCentre.viewSailorCalendar('${r.officialNumber}')" title="View in Calendar">
                <i class="fas fa-calendar-alt"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    viewSailorCalendar(officialNumber) {
      this._selSailor = officialNumber;
      this.setViewMode('calendar');
    }

    exportCSV() {
      const filters = {
        search: this._tableSearch,
        trade: this._tableTradeFilter,
        victualing: this._tableVictualingFilter,
        status: this._tableStatusFilter
      };

      const rows = window.spsStore.getAllSailorsPeriodSummary(
        this._tableStartDate, 
        this._tableEndDate, 
        filters, 
        this._tableSortField, 
        this._tableSortOrder
      );

      let csv = 'Service No,Rank,Name,Trade,Home Location,Deployed Days (V/In),Deployed Days (V/Out),Total Deployed,Sick Days,Leave Period & Days,Performance Score,Victualing Status\n';
      rows.forEach(r => {
        csv += `"${r.officialNumber}","${r.rank}","${r.name}","${r.trade}","${r.homeLocation}",${r.deployedDaysVicIn},${r.deployedDaysVicOut},${r.totalDeployedDays},${r.sickDays},"${r.leavePeriods}",${r.performanceScore.toFixed(2)},"${r.victualingType}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Personnel_Register_${this._tableStartDate}_to_${this._tableEndDate}.csv`;
      a.click();
      window.app.toast(`Exported ${rows.length} sailors to CSV`, 'success');
    }

    printTable() {
      window.print();
    }

    // =========================================================================
    // VIEW 3: FULL CMSYS MAIN SAILOR PROFILE MODAL (Requirement 2 & 3)
    // =========================================================================
    openProfileModal(identifier) {
      const sailor = window.spsStore.getSailor(identifier);
      if (!sailor) {
        window.app.toast('Sailor profile not found', 'error');
        return;
      }

      this._activeProfileSailor = sailor;
      this._nokRevealed = false;
      const overlay = document.getElementById('sailor-profile-modal-overlay');
      if (!overlay) return;

      const photo = window.spsStore.getSailorPhoto(sailor);
      const mStr = String(this._profCalMonth + 1).padStart(2, '0');
      const lastDayOfMonth = new Date(this._profCalYear, this._profCalMonth + 1, 0).getDate();
      const metrics = window.spsStore.getSailorPeriodMetrics(
        sailor.official_number, 
        `${this._profCalYear}-${mStr}-01`, 
        `${this._profCalYear}-${mStr}-${String(lastDayOfMonth).padStart(2, '0')}`
      );
      const fairness = window.spsStore.getSailorFairnessMetrics(sailor.official_number);

      const perfScore = sailor.performance_score || 8.5;
      const qScore = Math.min(10, (perfScore + 0.3)).toFixed(1);
      const effScore = Math.min(10, Math.max(1, perfScore - 0.2)).toFixed(1);
      const discScore = Math.min(10, (perfScore + 0.5)).toFixed(1);

      overlay.innerHTML = `
        <div class="cmsys-prof-dialog">
          <!-- Dark Naval Header Banner (Pic 2 Style) -->
          <div class="cmsys-prof-header">
            <div style="flex:1; min-width:0;">
              <h2 style="font-size:1.35rem; font-weight:900; color:#fff; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 4px 0;">
                ${sailor.name}
              </h2>
              <div style="font-size:0.82rem; font-family:var(--mono); color:#94a3b8; margin-bottom:8px;">
                ${sailor.rank} | ${sailor.official_number}
              </div>

              <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
                <span class="badge" style="background:#0f172a; border:1px solid #334155; color:#38bdf8; font-weight:700;">
                  UNIT: CE(W/W)
                </span>
                <span class="badge" style="background:#0d9488; color:#fff; font-weight:800;">
                  ${sailor.trade}
                </span>
                <span class="badge" style="background:rgba(16,185,129,0.2); color:#10b981; border:1px solid rgba(16,185,129,0.4);">
                  ${metrics.sickDays > 0 ? '🏥 Sick List' : (metrics.leaveDays > 0 ? '🏖️ On Leave' : 'Available / Active')}
                </span>
                
                <!-- Highlighted Victualing Badge -->
                ${metrics.isVictualingOut 
                  ? `<span class="sailor-vic-badge vic-badge-out" style="padding:3px 8px; font-size:0.72rem;"><i class="fas fa-utensils"></i> 🥘 Victualing Out (V/Out) Active</span>`
                  : `<span class="sailor-vic-badge vic-badge-in" style="padding:3px 8px; font-size:0.72rem;"><i class="fas fa-anchor"></i> ⚓ Victualing In (V/In)</span>`
                }

                <span class="badge" style="background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3);">
                  Tier 1: 1:1.30 (Merit Leave Ratio)
                </span>
              </div>
            </div>

            <div style="display:flex; align-items:flex-start; gap:14px; flex-shrink:0;">
              <!-- ID Photo with Click-to-Enlarge Lightbox -->
              <div class="cmsys-prof-photo-box" onclick="window.labourCentre.openLightbox('${photo.url}', '${this.escapeHtml(sailor.name)}', '${sailor.official_number}')" title="Click to view high-res ID picture">
                <img src="${photo.url}" onerror="this.src='assets/img/cmsys-emblem.png'">
                <div class="cmsys-prof-photo-overlay">
                  <i class="fas fa-magnifying-glass-plus" style="font-size:1.1rem; margin-bottom:2px;"></i>
                  <span>ENLARGE</span>
                </div>
              </div>

              <!-- Close Button -->
              <button onclick="window.labourCentre.closeProfileModal()" class="modal-close" style="color:#94a3b8; font-size:1.1rem;">✕</button>
            </div>
          </div>

          <!-- Two-Column Scrollable Body -->
          <div class="cmsys-prof-body">
            
            <!-- LEFT COLUMN: Detail Summary & Other Info & Medical/BMI -->
            <div style="display:flex; flex-direction:column; gap:16px;">
              
              <!-- 1. DETAIL SUMMARY -->
              <div class="prof-panel">
                <div class="prof-panel-title">
                  <i class="fas fa-circle-info" style="color:#38bdf8;"></i> DETAIL SUMMARY
                </div>
                <div class="prof-row"><span class="prof-lbl">Name</span><span class="prof-val uppercase">${sailor.name}</span></div>
                <div class="prof-row"><span class="prof-lbl">Rank</span><span class="prof-val">${sailor.rank}</span></div>
                <div class="prof-row"><span class="prof-lbl">Off No</span><span class="prof-val mono">${sailor.official_number}</span></div>
                <div class="prof-row"><span class="prof-lbl">Contact No</span><span class="prof-val mono">${sailor.contact_no || '071-8849201'}</span></div>
                <div class="prof-row"><span class="prof-lbl">Trade</span><span class="prof-val" style="color:var(--accent);">${sailor.trade}</span></div>
                <div class="prof-row"><span class="prof-lbl">Roll</span><span class="prof-val">${sailor.roll || 'VAS'}</span></div>
                <div class="prof-row">
                  <span class="prof-lbl">NOK Name</span>
                  <span class="prof-val" id="prof-nok-val">${this._nokRevealed ? (sailor.nok_name || 'Mrs. Perera (Wife) 077-1234567') : '•••••••••••••••• (Masked)'}</span>
                  <button class="btn btn-ghost btn-xs" style="font-size:0.65rem; padding:1px 5px; margin-left:6px;" onclick="window.labourCentre.toggleNokReveal()">
                    <i class="fas ${this._nokRevealed?'fa-eye-slash':'fa-eye'}"></i>
                  </button>
                </div>
                <div class="prof-row"><span class="prof-lbl">Special Skill</span><span class="prof-val">${sailor.special_skill || 'Specialized Structural & Finishing Works'}</span></div>
                <div class="prof-row"><span class="prof-lbl">Join Date</span><span class="prof-val mono">${sailor.join_date || '2024-11-11'}</span></div>
                <div class="prof-row"><span class="prof-lbl">ID Expiry</span><span class="prof-val mono" style="color:#f43f5e;">${sailor.id_expiry || '2029-02-02'}</span></div>
                <div class="prof-row"><span class="prof-lbl">Next B Medical</span><span class="prof-val mono">${sailor.next_b_medical_date || '2027-04-15'}</span></div>
                <div class="prof-row"><span class="prof-lbl">Next GCB Date</span><span class="prof-val mono">${sailor.next_gcb_date || '2027-10-20'}</span></div>
                <div class="prof-row"><span class="prof-lbl">Next NAV3 Date</span><span class="prof-val mono">${sailor.next_nav3_date || '2028-01-10'}</span></div>
              </div>

              <!-- 2. OTHER INFORMATION (HOME LOCATION) -->
              <div class="prof-panel">
                <div class="prof-panel-title">
                  <i class="fas fa-home" style="color:#10b981;"></i> OTHER INFORMATION & HOME LOCATION
                </div>
                <div class="prof-row"><span class="prof-lbl">Home District</span><strong class="prof-val" style="color:#38bdf8;">${sailor.district || 'Trincomalee'}</strong></div>
                <div class="prof-row"><span class="prof-lbl">City / Town</span><span class="prof-val">${sailor.city || sailor.district || 'Trincomalee'}</span></div>
                <div class="prof-row"><span class="prof-lbl">Address</span><span class="prof-val">${sailor.address || 'SLN Dockyard, Trincomalee'}</span></div>
                <div class="prof-row"><span class="prof-lbl">Police Station</span><span class="prof-val">${sailor.police_station || 'Harbour Police'}</span></div>
              </div>

              <!-- 3. PHYSICAL FITNESS & LIVE BMI CALCULATOR -->
              <div class="prof-panel">
                <div class="prof-panel-title">
                  <i class="fas fa-heartbeat" style="color:#f43f5e;"></i> PHYSICAL FITNESS & LIVE BMI
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                  <div>
                    <label style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:3px;">Weight (kg)</label>
                    <input type="number" id="prof-weight-input" class="form-control" value="68.5" step="0.5" style="height:32px; font-size:0.8rem;" oninput="window.labourCentre.calcBmi()">
                  </div>
                  <div>
                    <label style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:3px;">Height (cm)</label>
                    <input type="number" id="prof-height-input" class="form-control" value="172" step="0.5" style="height:32px; font-size:0.8rem;" oninput="window.labourCentre.calcBmi()">
                  </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; background:#0b1322; padding:8px 12px; border-radius:8px; margin-bottom:8px;">
                  <div>
                    <span style="font-size:0.68rem; color:var(--text-dim); text-transform:uppercase;">Calculated BMI:</span>
                    <span id="prof-bmi-score" style="font-size:1.15rem; font-weight:900; font-family:var(--mono); color:#10b981; margin-left:6px;">23.1</span>
                  </div>
                  <span id="prof-bmi-badge" class="badge" style="background:rgba(16,185,129,0.2); color:#10b981; border:1px solid rgba(16,185,129,0.4);">
                    Optimal Weight
                  </span>
                </div>

                <div class="prof-row"><span class="prof-lbl">Naval Med Category</span><span class="prof-val mono">A1 (Fit for Sea/Shore)</span></div>
                <div class="prof-row"><span class="prof-lbl">Blood Group</span><span class="prof-val" style="color:#f43f5e; font-weight:800;">🩸 ${sailor.blood_group || 'O+'}</span></div>
                <div class="prof-row"><span class="prof-lbl">Duty Restrictions</span><span class="prof-val">None (Fully Deployable)</span></div>
              </div>

            </div>

            <!-- RIGHT COLUMN: Performance, Dedicated Calendar, Sick & Deployment Log -->
            <div style="display:flex; flex-direction:column; gap:16px;">

              <!-- 1. PERFORMANCE & INSIGHTS CARD -->
              <div class="prof-panel">
                <div class="prof-panel-title">
                  <i class="fas fa-star" style="color:#f59e0b;"></i> PERFORMANCE & MERIT INSIGHTS
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; text-align:center; margin-bottom:12px;">
                  <div style="background:#0b1322; padding:10px; border-radius:8px;">
                    <div style="font-size:1.35rem; font-weight:900; font-family:var(--mono); color:#f59e0b;">${perfScore.toFixed(2)}</div>
                    <div style="font-size:0.65rem; color:var(--text-dim);">Score / 10</div>
                  </div>
                  <div style="background:#0b1322; padding:10px; border-radius:8px;">
                    <div style="font-size:1.35rem; font-weight:900; font-family:var(--mono); color:#10b981;">32 d</div>
                    <div style="font-size:0.65rem; color:var(--text-dim);">Evaluated</div>
                  </div>
                  <div style="background:#0b1322; padding:10px; border-radius:8px;">
                    <div style="font-size:1.35rem; font-weight:900; font-family:var(--mono); color:#38bdf8;">🏆 Tier 1</div>
                    <div style="font-size:0.65rem; color:var(--text-dim);">Merit Standing</div>
                  </div>
                </div>

                <!-- Competency Breakdown Bars -->
                <div style="display:flex; flex-direction:column; gap:8px;">
                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:3px;">
                      <span style="color:var(--text-muted);">Work Quality & Craftsmanship</span>
                      <strong style="color:#10b981;">${qScore} / 10</strong>
                    </div>
                    <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
                      <div style="width:${qScore*10}%; height:100%; background:#10b981; border-radius:3px;"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:3px;">
                      <span style="color:var(--text-muted);">Operational Speed & Productivity</span>
                      <strong style="color:#38bdf8;">${effScore} / 10</strong>
                    </div>
                    <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
                      <div style="width:${effScore*10}%; height:100%; background:#38bdf8; border-radius:3px;"></div>
                    </div>
                  </div>

                  <div>
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:3px;">
                      <span style="color:var(--text-muted);">Military Discipline & Safety</span>
                      <strong style="color:#c084fc;">${discScore} / 10</strong>
                    </div>
                    <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden;">
                      <div style="width:${discScore*10}%; height:100%; background:#c084fc; border-radius:3px;"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. DEDICATED CALENDAR & PERIOD ATTENDANCE (Pic 2 Requirement) -->
              <div class="prof-panel">
                <div class="prof-panel-title">
                  <i class="fas fa-calendar-check" style="color:#38bdf8;"></i> ATTENDANCE & DEPLOYMENTS CALENDAR
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                  <span style="font-size:0.78rem; font-weight:700; color:#fff;">October 2026</span>
                  <div style="font-size:0.7rem; color:var(--text-dim);">
                    🥘 V/Out: <strong style="color:#f59e0b;">${metrics.deployedDaysVicOut}d</strong> · 
                    ⚓ V/In: <strong style="color:#38bdf8;">${metrics.deployedDaysVicIn}d</strong> · 
                    🏖️ L: <strong style="color:#fbbf24;">${metrics.leaveDays}d</strong> · 
                    🏥 S: <strong style="color:#f43f5e;">${metrics.sickDays}d</strong>
                  </div>
                </div>

                <div id="prof-mini-cal" style="background:#0b1322; border-radius:8px; padding:10px;">
                  <!-- Rendered dynamically -->
                </div>
              </div>

              <!-- 3. SICK & MEDICAL INCIDENTS HISTORY -->
              <div class="prof-panel">
                <div class="prof-panel-title">
                  <i class="fas fa-hospital" style="color:#f43f5e;"></i> SICK & MEDICAL INCIDENTS HISTORY
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">
                  <span class="badge" style="background:rgba(244,63,94,0.15); color:#f43f5e; border:1px solid rgba(244,63,94,0.3);">
                    🏥 SIQ (Quarters): ${metrics.sickDays} Days
                  </span>
                  <span class="badge" style="background:#1e293b; color:#94a3b8;">
                    📋 S/R: 0 Days
                  </span>
                  <span class="badge" style="background:#1e293b; color:#94a3b8;">
                    🏥 ADM (Hospital): 0 Days
                  </span>
                </div>
                ${metrics.sickDays === 0 
                  ? `<div style="font-size:0.75rem; color:var(--text-dim); italic; padding:6px 0;">No active medical or sick quarters admissions recorded in this period.</div>`
                  : `<div style="font-size:0.75rem; color:#f43f5e; padding:6px 0;">Active sick report on Naval Sick Quarters file.</div>`
                }
              </div>

              <!-- 4. NON-NAVAL & EXTERNAL PROJECT DEPLOYMENT LOG (V/OUT HIGHLIGHTED) -->
              <div class="prof-panel">
                <div class="prof-panel-title">
                  <i class="fas fa-landmark" style="color:#f59e0b;"></i> EXTERNAL & SPECIAL PROJECT DEPLOYMENTS
                </div>
                <div style="display:flex; flex-direction:column; gap:6px; max-height:160px; overflow-y:auto;">
                  ${metrics.history.map(h => `
                    <div style="background:#0b1322; padding:8px 10px; border-radius:6px; display:flex; justify-content:space-between; align-items:center; border-left:3px solid ${h.victualing==='V/Out'?'#f59e0b':'#38bdf8'};">
                      <div>
                        <div style="font-size:0.78rem; font-weight:700; color:#fff;">${h.project_title}</div>
                        <div style="font-size:0.68rem; color:var(--text-muted);">${h.from_date} → ${h.to_date} · ${h.location}</div>
                      </div>
                      <div style="text-align:right;">
                        <span class="sailor-vic-badge ${h.victualing==='V/Out'?'vic-badge-out':'vic-badge-in'}" style="font-size:0.62rem;">
                          ${h.victualing==='V/Out'?'🥘 V/Out':'⚓ V/In'}
                        </span>
                        <div style="font-size:0.7rem; font-family:var(--mono); color:var(--accent); margin-top:2px;">${h.days_attached}d</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

            </div>

          </div>
        </div>
      `;

      overlay.classList.add('open');
      this._renderProfMiniCal(sailor, metrics);
    }

    _renderProfMiniCal(sailor, metrics) {
      const container = document.getElementById('prof-mini-cal');
      if (!container) return;

      const firstDay = new Date(this._profCalYear, this._profCalMonth, 1);
      const lastDay  = new Date(this._profCalYear, this._profCalMonth + 1, 0);
      const startPad = firstDay.getDay();
      const dayMap = metrics.calendarDayMap;

      let html = '<div class="cal-grid" style="gap:2px;">';
      ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(d => {
        html += `<div style="text-align:center; font-size:0.6rem; color:#64748b; font-weight:700; padding:2px 0;">${d}</div>`;
      });

      for (let i = 0; i < startPad; i++) {
        html += '<div style="aspect-ratio:1; background:transparent;"></div>';
      }

      for (let d = 1; d <= lastDay.getDate(); d++) {
        const dStr = `${this._profCalYear}-${String(this._profCalMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const info = dayMap[dStr] || {};
        let bg = 'rgba(255,255,255,0.03)';
        let border = 'rgba(255,255,255,0.05)';
        let color = '#94a3b8';

        if (info.type === 'vout') {
          bg = 'rgba(245,158,11,0.25)';
          border = '#f59e0b';
          color = '#f59e0b';
        } else if (info.type === 'vin') {
          bg = 'rgba(56,189,248,0.2)';
          border = '#38bdf8';
          color = '#38bdf8';
        } else if (info.type === 'leave') {
          bg = 'rgba(251,191,36,0.2)';
          border = '#fbbf24';
          color = '#fbbf24';
        } else if (info.type === 'sick') {
          bg = 'rgba(244,63,94,0.3)';
          border = '#f43f5e';
          color = '#f43f5e';
        }

        html += `
          <div style="aspect-ratio:1; background:${bg}; border:1px solid ${border}; border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:0.68rem; font-weight:700; color:${color};" title="${dStr}: ${info.type ? info.type.toUpperCase() : 'Available'}">
            ${d}
          </div>
        `;
      }

      html += '</div>';
      container.innerHTML = html;
    }

    calcBmi() {
      const w = parseFloat(document.getElementById('prof-weight-input')?.value || 0);
      const h = parseFloat(document.getElementById('prof-height-input')?.value || 0);
      const scoreEl = document.getElementById('prof-bmi-score');
      const badgeEl = document.getElementById('prof-bmi-badge');
      if (!scoreEl || !badgeEl) return;

      if (w > 20 && h > 50) {
        const hM = h / 100;
        const bmi = (w / (hM * hM)).toFixed(1);
        scoreEl.textContent = bmi;
        if (bmi < 18.5) {
          badgeEl.textContent = 'Underweight';
          badgeEl.className = 'badge';
          badgeEl.style.background = 'rgba(245,158,11,0.2)';
          badgeEl.style.color = '#f59e0b';
        } else if (bmi <= 24.9) {
          badgeEl.textContent = 'Optimal Weight';
          badgeEl.className = 'badge';
          badgeEl.style.background = 'rgba(16,185,129,0.2)';
          badgeEl.style.color = '#10b981';
        } else if (bmi <= 29.9) {
          badgeEl.textContent = 'Overweight';
          badgeEl.className = 'badge';
          badgeEl.style.background = 'rgba(245,158,11,0.25)';
          badgeEl.style.color = '#f59e0b';
        } else {
          badgeEl.textContent = 'Obese';
          badgeEl.className = 'badge';
          badgeEl.style.background = 'rgba(244,63,94,0.25)';
          badgeEl.style.color = '#f43f5e';
        }
      }
    }

    toggleNokReveal() {
      this._nokRevealed = !this._nokRevealed;
      const nokVal = document.getElementById('prof-nok-val');
      if (nokVal && this._activeProfileSailor) {
        nokVal.textContent = this._nokRevealed 
          ? (this._activeProfileSailor.nok_name || 'Mrs. Perera (Wife) 077-1234567') 
          : '•••••••••••••••• (Masked)';
      }
    }

    closeProfileModal() {
      const overlay = document.getElementById('sailor-profile-modal-overlay');
      if (overlay) overlay.classList.remove('open');
      this._activeProfileSailor = null;
    }

    // =========================================================================
    // VIEW 4: PHOTO LIGHTBOX MODAL (Enlarge / Minimize Photo — Requirement 3)
    // =========================================================================
    openLightbox(photoUrl, name, offNo) {
      const overlay = document.getElementById('sailor-lightbox-modal-overlay');
      if (!overlay) return;

      overlay.innerHTML = `
        <div class="lightbox-dialog">
          <div style="display:flex; justify-content:space-between; align-items:center; width:100%; margin-bottom:12px;">
            <div>
              <h3 style="font-size:1.05rem; font-weight:800; color:#fff; margin:0;">${name}</h3>
              <span style="font-size:0.75rem; color:#38bdf8; font-family:var(--mono);">${offNo} · Official ID Photo</span>
            </div>
            <button onclick="window.labourCentre.closeLightbox()" class="modal-close" style="font-size:1.1rem; color:#94a3b8;">✕</button>
          </div>

          <img src="${photoUrl}" class="lightbox-img" alt="${name}" onerror="this.src='assets/img/cmsys-emblem.png'">

          <div style="margin-top:14px; display:flex; gap:10px; width:100%; justify-content:center;">
            <button class="btn btn-primary btn-sm" onclick="window.labourCentre.closeLightbox(); window.labourCentre.openProfileModal('${offNo}')">
              <i class="fas fa-id-card"></i> View Full CMSys Profile
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.labourCentre.closeLightbox()">
              Close
            </button>
          </div>
        </div>
      `;

      overlay.classList.add('open');
    }

    closeLightbox() {
      const overlay = document.getElementById('sailor-lightbox-modal-overlay');
      if (overlay) overlay.classList.remove('open');
    }

    // =========================================================================
    // BULK UPLOAD & IMPORT ENGINE
    // =========================================================================
    openBulkUpload() {
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `<div class="modal" style="max-width:600px;">
        <div class="modal-header">
          <h2><i class="fas fa-upload" style="margin-right:8px; color:var(--accent);"></i>Bulk Upload Labour Attachments</h2>
          <button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button>
        </div>
        <div class="modal-body">
          <div class="drop-zone" id="bulk-drop-zone">
            <i class="fas fa-file-csv"></i>
            <p>Drag & Drop CSV file here, or click to browse</p>
            <small>Format: project_id, official_number, name, rank, trade, from_date (YYYY-MM-DD), to_date (YYYY-MM-DD)</small>
            <input type="file" id="bulk-csv-input" accept=".csv" style="display:none;" onchange="window.labourCentre.processBulkCSV(this)">
          </div>

          <div style="display:flex; gap:10px; margin-top:10px;">
            <button class="btn btn-secondary btn-sm" onclick="window.labourCentre.downloadTemplate()">
              <i class="fas fa-download"></i> Download Template
            </button>
          </div>

          <div id="bulk-preview" style="margin-top:14px;"></div>
        </div>
        <div style="padding:14px 24px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:10px; background:var(--bg-surface);">
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
          <div style="background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); border-radius:8px; padding:12px; margin-bottom:10px;">
            ✅ Parsed <strong>${rows.length} attachment records</strong> ready to import
          </div>
          <div style="max-height:200px; overflow-y:auto;">
            <table class="sps-table">
              <thead><tr><th>Project ID</th><th>Service No.</th><th>Name</th><th>Trade</th><th>From</th><th>To</th></tr></thead>
              <tbody>${rows.slice(0,10).map(r => `<tr><td class="mono">${r.project_id}</td><td class="mono">${r.official_number}</td><td>${r.name}</td><td>${r.trade}</td><td>${r.from_date}</td><td>${r.to_date}</td></tr>`).join('')}
              ${rows.length > 10 ? `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">...and ${rows.length-10} more rows</td></tr>` : ''}</tbody>
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
      const csv = 'project_id,official_number,name,rank,trade,from_date,to_date\nSP-REL-001,VAS 68960,SARNU KUMARA,LME,MA,2026-10-01,2026-11-20\n';
      const blob = new Blob([csv], {type:'text/csv'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'SPS_Labour_Upload_Template.csv';
      a.click();
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }

  window.labourCentre = new LabourCentre();
})();
