// ============================================================
// SPS — Multi-Project Gantt Chart Engine
// Compact 34px rows, 5-Year Past to 2-Year Future Date Range,
// Emoji Badges (📅📡📄) with Rich Hover Tooltip Popover
// ============================================================
(function() {
  'use strict';

  const CAT_COLORS = {
    'Religious':       { bar: 'bar-religious', cat: 'gl-cat-religious' },
    'Clean Sri Lanka': { bar: 'bar-csl',      cat: 'gl-cat-csl' },
    'Housing':         { bar: 'bar-housing',   cat: 'gl-cat-housing' },
    'Miscellaneous':   { bar: 'bar-misc',      cat: 'gl-cat-misc' }
  };

  const ZOOM_DAY_WIDTH = { 'Days': 48, 'Weeks': 28, 'Months': 14 };
  const ROW_H = 34; // Compact row height

  class MultiProjectGantt {
    constructor(wrapperId) {
      this.wrapperId = wrapperId;
      this.zoom = 'Weeks';
      this.dayW = ZOOM_DAY_WIDTH['Weeks'];
      this.onProjectClick = null;
      this.startYear = window.spsStore.ganttStartYear || 2026;
    }

    setZoom(z) {
      this.zoom = z;
      this.dayW = ZOOM_DAY_WIDTH[z] || 28;
      window.spsStore.setGanttZoom(z);
      this.render();
    }

    setStartYear(yr) {
      this.startYear = parseInt(yr);
      window.spsStore.setGanttStartYear(this.startYear);
      this.render();
    }

    render() {
      const container = document.getElementById(this.wrapperId);
      if (!container) return;

      const allProjects = window.spsStore.projects;
      const active   = allProjects.filter(p => p.status === 'Active');
      const inactive = allProjects.filter(p => p.status === 'On Hold');
      const visible  = [...active, ...inactive];

      if (visible.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding:40px;">
          <i class="fas fa-stream"></i>
          <p>No active projects to display on Gantt.<br>Add a special project to get started.</p>
        </div>`;
        return;
      }

      // Determine date range for rendering:
      // Allow viewing 5 years past (e.g. 2021) to 2 years future (e.g. 2028)
      const curYear = this.startYear;
      let startD = new Date(curYear - 1, 0, 1); // Jan 1 of selected range
      let endD   = new Date(curYear + 1, 11, 31); // Dec 31 of next year

      // Calculate total timeline days
      const totalDays = Math.max(30, Math.ceil((endD - startD) / 86400000) + 1);
      const timelineW = totalDays * this.dayW;
      const today     = new Date(); today.setHours(0,0,0,0);
      const todayOffset = Math.floor((today - startD) / 86400000);

      // Get daily totals
      const dailyTotals = window.spsStore.getDailyTotals(
        this._toLocalDateStr(startD),
        this._toLocalDateStr(endD)
      );
      const maxDailyTotal = Math.max(1, ...Object.values(dailyTotals));

      // Build timeline header cells
      const headerCells = this._buildHeaderCells(startD, totalDays, today);
      // Build daily total cells
      const totalCells  = this._buildTotalCells(startD, totalDays, dailyTotals, maxDailyTotal);

      // Build project rows (Compact 34px)
      const activeRows   = active.map(p => this._buildRow(p, startD, totalDays, today, false));
      const inactiveRows = inactive.map(p => this._buildRow(p, startD, totalDays, today, true));

      const inactiveSep = inactive.length > 0 ? `
        <div class="gantt-inactive-sep"><i class="fas fa-pause-circle"></i> On Hold Projects</div>
      ` : '';

      // Years list for 5 years past to 2 years future (2021 to 2028)
      const baseYr = 2026;
      const yearOptions = [];
      for (let y = baseYr - 5; y <= baseYr + 2; y++) {
        yearOptions.push(`<option value="${y}" ${y===this.startYear?'selected':''}>Year ${y}</option>`);
      }

      container.innerHTML = `
        <div class="gantt-wrap" style="height:100%;min-height:360px;">
          <!-- Toolbar -->
          <div class="gantt-toolbar">
            <div style="display:flex;align-items:center;gap:10px;">
              <i class="fas fa-stream" style="color:var(--accent)"></i>
              <span style="font-weight:700;font-size:0.88rem;">Resource Allocation Gantt</span>
              <span style="font-size:0.75rem;color:var(--text-muted);">${active.length} Active · ${inactive.length} On Hold</span>
            </div>
            
            <div class="gantt-controls-group">
              <!-- Timeline Range Year Selector (5Y Past / 2Y Future) -->
              <span style="font-size:0.75rem;color:var(--text-muted);font-weight:600;">Timeline Window:</span>
              <select class="gantt-year-select" onchange="window.spsGantt.setStartYear(this.value)">
                ${yearOptions.join('')}
              </select>

              <!-- Zoom Buttons -->
              <div class="gantt-zoom-btns">
                ${['Days','Weeks','Months'].map(z => `<button class="gz-btn ${z===this.zoom?'active':''}" onclick="window.spsGantt.setZoom('${z}')">${z}</button>`).join('')}
              </div>
            </div>
          </div>

          <!-- Scrollable body with synced left col -->
          <div class="gantt-scroll-sync" style="flex:1;overflow:hidden;max-height:380px;">
            <!-- Left labels column -->
            <div class="gantt-left-col" style="overflow-y:auto;" id="gantt-label-col">
              <div class="gantt-col-head">Project / Location</div>
              <div class="gantt-label-list" id="gantt-labels">
                ${activeRows.map(r => r.label).join('')}
                ${inactiveSep}
                ${inactiveRows.map(r => r.label).join('')}
              </div>
            </div>

            <!-- Right scrollable timeline -->
            <div class="gantt-right-col" id="gantt-chart-col">
              <!-- Timeline header (sticky) -->
              <div class="gantt-tl-head" style="width:${timelineW}px;" id="gantt-tl-head">
                ${headerCells}
              </div>
              <!-- Grid rows with bars -->
              <div class="gantt-rows-container" style="width:${timelineW}px;position:relative;" id="gantt-rows">
                ${this._buildTodayLine(todayOffset, ROW_H * (active.length + inactive.length))}
                ${activeRows.map(r => r.bar).join('')}
                ${inactive.length > 0 ? `<div style="height:24px;background:var(--bg-surface);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 10px;font-size:0.65rem;color:var(--text-dim);font-weight:700;text-transform:uppercase;">On Hold</div>` : ''}
                ${inactiveRows.map(r => r.bar).join('')}
              </div>
            </div>
          </div>

          <!-- Daily Labour Total Row -->
          <div style="display:flex;border-top:2px solid var(--border);background:var(--bg-surface);flex-shrink:0;">
            <div class="gantt-daily-total-labels">
              <i class="fas fa-users" style="color:var(--accent);font-size:0.85rem;margin-right:6px;"></i>
              <span>Total Labour / Day</span>
            </div>
            <div style="flex:1;overflow-x:hidden;" id="gantt-totals-scroll">
              <div class="daily-totals-row" style="width:${timelineW}px;" id="gantt-totals">
                ${totalCells}
              </div>
            </div>
          </div>
        </div>
      `;

      this._syncScrolling();
    }

    _buildHeaderCells(startD, totalDays, today) {
      let html = '';
      let cur  = new Date(startD);
      for (let i = 0; i < totalDays; i++) {
        const isToday   = cur.toDateString() === today.toDateString();
        const isWeekend = cur.getDay() === 0 || cur.getDay() === 6;
        const dayNames  = ['Su','Mo','Tu','We','Th','Fr','Sa'];
        const monthNames= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        html += `<div class="tl-cell ${isWeekend?'weekend':''} ${isToday?'today-col':''}"
                      style="width:${this.dayW}px;">
          <span class="tl-date">${cur.getDate()}</span>
          <span class="tl-day">${this.zoom==='Days'?dayNames[cur.getDay()]:monthNames[cur.getMonth()]}</span>
        </div>`;
        cur.setDate(cur.getDate() + 1);
      }
      return html;
    }

    _toLocalDateStr(d) {
      if (!d || isNaN(d.getTime())) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }

    _buildTotalCells(startD, totalDays, dailyTotals, maxDailyTotal) {
      let html = '';
      let cur  = new Date(startD);
      for (let i = 0; i < totalDays; i++) {
        const key   = this._toLocalDateStr(cur);
        const val   = dailyTotals[key] || 0;
        const pct   = maxDailyTotal > 0 ? (val / maxDailyTotal) * 100 : 0;
        const cls   = pct > 80 ? 'high-load' : pct > 50 ? 'med-load' : '';
        html += `<div class="daily-total-cell" style="width:${this.dayW}px;" title="${key}: ${val} sailors">
          <span class="dtc-val">${val > 0 ? val : ''}</span>
          <div class="dtc-bar-wrap"><div class="dtc-bar ${cls}" style="width:${pct}%;"></div></div>
        </div>`;
        cur.setDate(cur.getDate() + 1);
      }
      return html;
    }

    _buildRow(project, startD, totalDays, today, isInactive) {
      const pStart = new Date(project.start_date);
      const pEnd   = new Date(project.end_date);
      const daysFromStart = Math.floor((pStart - startD) / 86400000);
      const barDays       = Math.max(1, Math.ceil((pEnd - pStart) / 86400000) + 1);
      const colors = CAT_COLORS[project.category] || { bar: 'bar-misc', cat: 'gl-cat-misc' };

      const todayAttachments = window.spsStore.attachments.filter(a => {
        if (a.project_id !== project.id) return false;
        const f = new Date(a.from_date); f.setHours(0,0,0,0);
        const t = new Date(a.to_date);   t.setHours(0,0,0,0);
        return today >= f && today <= t;
      }).length;

      const totalAtt = window.spsStore.attachments.filter(a => a.project_id === project.id).length;

      const label = `
        <div class="gantt-label-row ${isInactive ? 'inactive-row' : ''}" onclick="window.spsGantt.clickProject('${project.id}')">
          <span class="gl-cat-dot ${colors.cat}"></span>
          <span class="gl-name" title="${project.title}">${project.title}</span>
          <span class="gl-headcount" title="Labour headcount">${todayAttachments > 0 ? todayAttachments + ' 👤' : totalAtt + ' tot'}</span>
        </div>`;

      const barLeft = daysFromStart * this.dayW;
      const barW    = barDays * this.dayW;
      const progW   = (project.progress / 100) * barW;

      // Emojis for dates, signals, and letters
      const docTypeEmoji = project.approval_type === 'Signal' ? '📡' : project.approval_type === 'Letter' ? '📄' : '📋';

      // Popover Tooltip HTML
      const popoverHtml = `
        <div class="gantt-tooltip-popover">
          <div class="gtp-header">${project.code} — ${project.title}</div>
          <div class="gtp-sub"><i class="fas fa-map-marker-alt"></i> ${project.location}</div>
          <div class="gtp-row"><span>Ref:</span> <strong>${docTypeEmoji} ${project.approval_ref || 'N/A'}</strong></div>
          <div class="gtp-row"><span>Authority:</span> <strong>${project.approval_authority || 'N/A'}</strong></div>
          <div class="gtp-row"><span>Start & End:</span> <strong>📅 ${project.start_date} → ${project.end_date}</strong></div>
          <div class="gtp-row"><span>Progress:</span> <strong>${project.progress}%</strong></div>
          <div class="gtp-row"><span>Labour:</span> <strong>👤 ${todayAttachments} attached</strong></div>
        </div>`;

      const bar = `
        <div class="gantt-grid-row ${isInactive ? 'inactive-g-row' : ''}" style="--day-w:${this.dayW}px;">
          <div class="gantt-bar ${colors.bar}"
               style="left:${barLeft}px;width:${barW}px;"
               onclick="window.spsGantt.clickProject('${project.id}')">
            <div class="bar-progress-fill" style="width:${progW}px;"></div>
            <span class="bar-label">${project.code} · ${project.progress}%</span>

            <!-- Emoji Badges for Dates, Signal & Letter details -->
            <div class="gantt-emoji-group">
              <span class="gantt-emoji" title="Start & End: ${project.start_date} to ${project.end_date}">📅</span>
              <span class="gantt-emoji" title="${project.approval_type}: ${project.approval_ref}"> ${docTypeEmoji}</span>
            </div>

            ${popoverHtml}
          </div>
        </div>`;

      return { label, bar };
    }

    _buildTodayLine(todayOffset, totalH) {
      if (todayOffset < 0) return '';
      const x = todayOffset * this.dayW + this.dayW / 2;
      return `<div class="today-line" style="left:${x}px;height:${totalH}px;"></div>`;
    }

    clickProject(projectId) {
      if (this.onProjectClick) this.onProjectClick(projectId);
    }

    _syncScrolling() {
      const chartCol  = document.getElementById('gantt-chart-col');
      const labelCol  = document.getElementById('gantt-label-col');
      const totalsScr = document.getElementById('gantt-totals-scroll');
      if (!chartCol) return;

      chartCol.addEventListener('scroll', () => {
        if (totalsScr) totalsScr.scrollLeft = chartCol.scrollLeft;
        if (labelCol)  labelCol.scrollTop   = chartCol.scrollTop;
      });
    }
  }

  window.spsGantt = new MultiProjectGantt('gantt-render-target');
})();
