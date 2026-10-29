// ============================================================
// SPS — Master Application Controller
// Routes views, handles modals, new project form, attach labour,
// User Profile & Role Switcher, Trade-Wise Approved Quotas,
// Equal Opportunity Rotation Helper & CMSys Sync migration
// ============================================================
(function() {
  'use strict';

  const CATEGORIES = ['Religious', 'Clean Sri Lanka', 'Housing', 'Miscellaneous'];
  const CAT_CLASS  = { 'Religious':'religious', 'Clean Sri Lanka':'csl', 'Housing':'housing', 'Miscellaneous':'misc' };
  const CAT_ICONS  = { 'Religious':'fa-place-of-worship', 'Clean Sri Lanka':'fa-leaf', 'Housing':'fa-home', 'Miscellaneous':'fa-folder' };
  const TRADES     = ['MA', 'CA', 'PA', 'PL', 'WE', 'BB', 'AL', 'SW', 'RW', 'AA'];

  class SPSApp {
    constructor() {
      this._currentView = 'dashboard';
      this._filterCat   = 'All';
      this._allProjects  = [];
      this._settingsTab = 'officers';
    }

    async init() {
      // Load persisted state, or fetch sample data first
      const loaded = window.spsStore.load();
      if (!loaded || window.spsStore.projects.length === 0 || window.spsStore.navalProjects.length === 0 || window.spsStore.officers.length === 0) {
        await this._loadSampleData();
      }

      this._bindNavigation();
      this._bindGlobalSearch();
      this._renderRoleSwitcher();
      this.navigate('dashboard');

      // Init Firebase sailor sync (cmsys-v2: Read-Only)
      if (window.sailorSync) window.sailorSync.init();

      // Init Firebase cloud operations sync (cmsys-v2: Read-Write)
      if (window.spsCloudSync) window.spsCloudSync.init();

      // Link Gantt click → project detail
      window.spsGantt.onProjectClick = (pid) => window.projectDetail.openProject(pid);

      // Listen to store changes
      window.spsStore.subscribe((event) => {
        if (['PROJECT_ADDED','PROJECT_UPDATED','PROJECT_DELETED'].includes(event)) {
          if (this._currentView === 'dashboard') this.renderDashboard();
          if (this._currentView === 'projects')  this.renderProjectsView();
          if (this._currentView === 'progress-center' && window.progressCenter) window.progressCenter.render();
          this.updateSidebarCounts();
        }
        if (['NAVAL_PROJECT_ADDED','NAVAL_PROJECT_UPDATED','NAVAL_PROJECT_DELETED','PROCUREMENT_FILE_ADDED','PROCUREMENT_FILE_UPDATED','PROCUREMENT_FILE_DELETED','NAVAL_VOTE_CHANGED'].includes(event)) {
          if (this._currentView === 'naval-projects') window.navalProjectsModule.render();
          if (this._currentView === 'dashboard') this.renderDashboard();
          if (this._currentView === 'progress-center' && window.progressCenter) window.progressCenter.render();
          this.updateSidebarCounts();
        }
        if (['ATTACHMENT_ADDED','ATTACHMENT_DELETED','ATTACHMENTS_BULK','ATTACHMENTS_SET'].includes(event)) {
          if (this._currentView === 'dashboard') this.renderDashboard();
          if (this._currentView === 'labour')    window.labourCentre.render();
          this.updateSidebarCounts();
        }
        if (['USER_CHANGED', 'USER_UPDATED', 'OFFICERS_SET'].includes(event)) {
          this._renderRoleSwitcher();
          this._applyRolePermissions();
          if (this._currentView === 'settings') this.renderSettingsView();
          this.updateSidebarCounts();
        }
      });
    }

    async _loadSampleData() {
      try {
        const r = await fetch('data/sample_projects.json');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();
        window.spsStore.setProjects(d.projects || []);
        window.spsStore.setAttachments(d.labour_attachments || []);
        window.spsStore.setJobCards(d.job_cards || []);
        window.spsStore.setDocuments(d.documents || []);
        window.spsStore.setWeatherLogs(d.weather_logs || []);
        if (d.naval_projects && d.naval_projects.length > 0) {
          window.spsStore.setNavalProjects(d.naval_projects);
        }
        if (d.procurement_files && d.procurement_files.length > 0) {
          window.spsStore.setProcurementFiles(d.procurement_files);
        }

        // Additional safeguard for naval_projects.json
        if (window.spsStore.navalProjects.length === 0) {
          try {
            const nr = await fetch('data/naval_projects.json');
            if (nr.ok) {
              const nd = await nr.json();
              if (nd.naval_projects) window.spsStore.setNavalProjects(nd.naval_projects);
              if (nd.procurement_files) window.spsStore.setProcurementFiles(nd.procurement_files);
            }
          } catch(ne) { console.warn('Naval projects standalone load failed:', ne); }
        }

        // Load authoritative CMSys Officers directory
        try {
          const or = await fetch('data/officers.json');
          if (or.ok) {
            const od = await or.json();
            const list = Array.isArray(od) ? od : (od.officers || []);
            if (list.length > 0) window.spsStore.setOfficers(list);
          }
        } catch(oe) { console.warn('Officers directory load fallback:', oe); }

        console.log('✅ CMSys Platform data loaded:', window.spsStore.projects?.length, 'special projects,', window.spsStore.navalProjects?.length, 'naval projects,', window.spsStore.officers?.length, 'officers');
      } catch(e) { console.warn('Sample data load failed:', e); }
    }

    // ── Navigation ──
    _bindNavigation() {
      document.querySelectorAll('.nav-link[data-view]').forEach(link => {
        link.addEventListener('click', () => this.navigate(link.dataset.view));
      });
    }

    navigate(view) {
      if (view === 'officers') {
        this._settingsTab = 'officers';
        return this.navigate('settings');
      }

      this._currentView = view;
      document.querySelectorAll('.nav-link[data-view]').forEach(l => {
        l.classList.toggle('active', l.dataset.view === view);
      });
      document.querySelectorAll('.view').forEach(v => {
        v.classList.toggle('active', v.id === `${view}-view`);
      });

      const titles = { 
        dashboard: 'Executive Dashboard', 
        'progress-center': 'Project Progress & Monitoring Center',
        'naval-projects': 'Naval Projects & Procurement Command Center', 
        projects: 'Special Projects (CSR & Welfare)', 
        labour: 'Labour & Personnel Center', 
        officers: 'Commissioned Officers & Engineering Command Profiles',
        settings: 'Settings & Officers Profiles' 
      };
      const titleEl = document.getElementById('page-title');
      if (titleEl) titleEl.textContent = titles[view] || 'CMSys Project';

      if (view === 'dashboard') this.renderDashboard();
      if (view === 'progress-center' && window.progressCenter) window.progressCenter.render();
      if (view === 'naval-projects') window.navalProjectsModule.render();
      if (view === 'projects')  this.renderProjectsView();
      if (view === 'labour')    window.labourCentre.render();
      if (view === 'settings')  this.renderSettingsView();
    }

    // ── Officer Profile & Role Switcher ──
    _renderRoleSwitcher() {
      const el = document.getElementById('topbar-user-role');
      if (!el) return;
      const user = window.spsStore.currentUser;
      const role = window.spsStore.activeRole;
      const officers = window.spsStore.officers;

      el.innerHTML = `
        <div class="officer-topbar-pill" title="Active Officer Profile — Click to Authenticate or Switch Profile">
          <div class="officer-topbar-avatar" onclick="window.app.openOfficerLoginModal('${user.id}')" style="cursor:pointer;">
            <i class="fas fa-user-shield"></i>
          </div>
          <div class="officer-topbar-info" onclick="window.app.openOfficerLoginModal('${user.id}')" style="cursor:pointer;">
            <span style="font-size:0.75rem;font-weight:700;color:var(--text-primary);line-height:1.1;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:130px;">${user.name}</span>
            <span style="font-size:0.65rem;color:var(--accent);font-weight:600;display:block;">${user.appointment || role.code}</span>
          </div>
          <select style="background:transparent;border:none;color:var(--accent);font-size:0.72rem;font-weight:700;cursor:pointer;outline:none;padding:2px 4px;max-width:130px;" onchange="window.app.switchOfficerQuick(this.value)">
            ${officers.map(u => `<option value="${u.id}" ${u.id===user.id?'selected':''}>${u.name.replace(/^Capt \(S\) |^Lt Cdr |^Cdr |^Lt /i, '')} (${u.role.toUpperCase()})</option>`).join('')}
          </select>
          <button style="background:none;border:none;color:var(--accent);cursor:pointer;padding:2px 6px;font-size:0.75rem;" onclick="window.app.openOfficerLoginModal('${user.id}')" title="Authenticate / Login with CMSys Password">
            <i class="fas fa-key"></i>
          </button>
        </div>
      `;
      this._applyRolePermissions();
    }

    _applyRolePermissions() {
      const settingsNav = document.querySelector('.nav-link[data-view="settings"]');
      if (settingsNav) {
        settingsNav.style.display = 'flex';
      }
    }

    // ── Dashboard ──
    renderDashboard() {
      this._renderKPIs();
      this._renderCategoryTabs();
      this._renderProjectCards();
      window.spsGantt.render();
      this.updateSidebarCounts();
    }

    _renderKPIs() {
      const projects = window.spsStore.projects;
      const navalProjects = window.spsStore.navalProjects;

      const spActive = projects.filter(p => p.status === 'Active').length;
      const npActive = navalProjects.filter(p => p.status === 'Active').length;
      const active = spActive + npActive;

      const spHold = projects.filter(p => p.status === 'On Hold').length;
      const npHold = navalProjects.filter(p => p.status === 'On Hold').length;
      const onHold = spHold + npHold;

      const spBudget = projects.reduce((s,p) => s + (p.budget || 0), 0);
      const npAlloc = navalProjects.reduce((s,p) => s + (p.voteAllocation || 0), 0);
      const totalBudget = spBudget + npAlloc;

      const totalLabour = window.spsStore.attachments.filter(a => {
        const today = new Date(); today.setHours(0,0,0,0);
        const e = new Date(a.to_date); e.setHours(0,0,0,0);
        return e >= today;
      }).length;

      const critical = projects.filter(p => p.material_status === 'Critical').length;

      document.getElementById('kpi-active').textContent   = active;
      document.getElementById('kpi-onhold').textContent   = onHold;
      document.getElementById('kpi-budget').textContent   = 'Rs. ' + (totalBudget/1000000).toFixed(1) + 'M';
      document.getElementById('kpi-labour').textContent   = totalLabour;
      document.getElementById('kpi-critical').textContent = critical;
    }

    _renderCategoryTabs() {
      const projects = window.spsStore.projects;
      CATEGORIES.forEach(cat => {
        const cnt = projects.filter(p => p.category === cat && p.status !== 'Completed').length;
        const el  = document.getElementById(`cat-count-${cat.replace(/ /g,'-').toLowerCase()}`);
        if (el) el.textContent = cnt;
      });
      const allCnt = document.getElementById('cat-count-all');
      if (allCnt) allCnt.textContent = projects.filter(p => p.status !== 'Completed').length;
    }

    filterCategory(cat) {
      this._filterCat = cat;
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      const active = document.querySelector(`.cat-tab[data-cat="${cat}"]`);
      if (active) active.classList.add('active');
      this._renderProjectCards();
    }

    _renderProjectCards() {
      const grid = document.getElementById('projects-grid');
      if (!grid) return;
      let projects = window.spsStore.projects;

      let active = projects.filter(p => p.status !== 'Completed');
      if (this._filterCat !== 'All') active = active.filter(p => p.category === this._filterCat);

      let completed = projects.filter(p => p.status === 'Completed');
      if (this._filterCat !== 'All') completed = completed.filter(p => p.category === this._filterCat);

      let html = '';

      if (active.length === 0 && completed.length === 0) {
        html = `<div class="empty-state" style="grid-column:1/-1;">
          <i class="fas fa-folder-open"></i>
          <p>No projects found. Add a new special project to get started.</p>
        </div>`;
      } else {
        active.forEach(p => { html += this._projectCard(p); });
        if (completed.length > 0) {
          html += `<div class="inactive-banner" style="grid-column:1/-1;"><i class="fas fa-check-circle"></i> Completed Projects (${completed.length})</div>`;
          completed.forEach(p => { html += this._projectCard(p, true); });
        }
      }
      grid.innerHTML = html;
    }

    _projectCard(p, isCompleted = false) {
      const catCls  = CAT_CLASS[p.category]  || 'misc';
      const catIcon = CAT_ICONS[p.category] || 'fa-folder';
      const statusCls = p.status === 'Active' ? 'status-active' : p.status === 'On Hold' ? 'status-hold' : 'status-completed';
      const stripCls  = `strip-${catCls}`;

      const radius  = 22; const circ = 2 * Math.PI * radius;
      const offset  = circ - (p.progress / 100) * circ;
      const ringCls = `ring-${catCls}`;
      const fillCls = `fill-${catCls}`;

      const trades = Object.entries(p.trades_required || {}).map(([t,c]) =>
        `<span class="trade-chip">${t}: <span>${c}</span></span>`).join('');

      const today = new Date(); today.setHours(0,0,0,0);
      const labourNow = window.spsStore.attachments.filter(a => {
        if (a.project_id !== p.id) return false;
        const f = new Date(a.from_date); f.setHours(0,0,0,0);
        const e = new Date(a.to_date);   e.setHours(0,0,0,0);
        return today >= f && today <= e;
      }).length;

      const daysLeft = Math.ceil((new Date(p.end_date) - today) / 86400000);
      const daysStr  = daysLeft < 0 ? 'OVERDUE' : daysLeft + ' days left';
      const daysColor = daysLeft < 0 ? 'var(--danger)' : daysLeft < 14 ? 'var(--warning)' : 'var(--text-muted)';

      const matCls = p.material_status === 'OK' ? 'mat-ok' : p.material_status === 'Low' ? 'mat-low' : 'mat-critical';

      return `<div class="project-card ${isCompleted?'inactive-card':''}" onclick="window.projectDetail.openProject('${p.id}')">
        <div class="card-top-strip ${stripCls}"></div>
        <div class="card-body">
          <div class="card-header-row">
            <div class="card-title-block">
              <div class="card-code"><i class="fas ${catIcon}" style="margin-right:5px;color:var(--${catCls});"></i>${p.code}</div>
              <div class="card-title">${p.title}</div>
              <div class="card-loc"><i class="fas fa-map-marker-alt"></i>${p.location}</div>
            </div>
            <span class="status-badge ${statusCls}">${p.status}</span>
          </div>

          <div class="card-progress-row">
            <div class="progress-ring-wrap">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle class="progress-ring-bg" cx="30" cy="30" r="${radius}"/>
                <circle class="progress-ring-fill ${ringCls}" cx="30" cy="30" r="${radius}"
                  stroke-dasharray="${circ.toFixed(1)}"
                  stroke-dashoffset="${offset.toFixed(1)}"/>
              </svg>
              <div class="ring-pct">${p.progress}%</div>
            </div>
            <div class="progress-details">
              <div class="progress-label">Overall Progress</div>
              <div class="progress-bar-wrap"><div class="progress-bar-fill ${fillCls}" style="width:${p.progress}%;"></div></div>
              <div class="progress-dates">
                <strong>${p.start_date}</strong> → <strong>${p.end_date}</strong>
                <span style="margin-left:8px;color:${daysColor};font-weight:600;">${daysStr}</span>
              </div>
            </div>
          </div>

          <div class="trade-row">${trades || '<span class="trade-chip">—</span>'}</div>

          <div class="card-footer-metrics">
            <div class="metric-item">
              <div class="metric-val" style="color:var(--accent);">${labourNow}</div>
              <div class="metric-lbl">Today's Labour</div>
            </div>
            <div class="metric-item">
              <div class="metric-val">${(p.job_card_cost/1000).toFixed(0)}K</div>
              <div class="metric-lbl">JC Cost (LKR)</div>
            </div>
            <div class="metric-item">
              <div class="metric-val ${matCls}">${p.material_status}</div>
              <div class="metric-lbl">Materials</div>
            </div>
            <div class="metric-item">
              <div class="metric-val">${p.incharge?.split(' ').slice(-1)[0] || '—'}</div>
              <div class="metric-lbl">Incharge</div>
            </div>
          </div>
        </div>
      </div>`;
    }

    // ── Projects View ──
    renderProjectsView() {
      const container = document.getElementById('projects-full-list');
      if (!container) return;
      const projects = window.spsStore.projects;
      if (projects.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><p>No projects yet.</p></div>`;
        return;
      }
      container.innerHTML = `<table class="sps-table">
        <thead><tr>
          <th>Code</th><th>Category</th><th>Title</th><th>Location</th>
          <th>Start</th><th>End</th><th>Progress</th><th>Status</th><th>Budget</th><th>Actions</th>
        </tr></thead>
        <tbody>
          ${projects.map(p => {
            const catCls = CAT_CLASS[p.category] || 'misc';
            const statusCls = p.status === 'Active' ? 'status-active' : p.status === 'On Hold' ? 'status-hold' : 'status-completed';
            return `<tr>
              <td class="mono" style="color:var(--accent);">${p.code}</td>
              <td><span style="color:var(--${catCls});font-weight:600;font-size:0.8rem;">${p.category}</span></td>
              <td style="font-weight:600;max-width:220px;">${p.title}</td>
              <td style="color:var(--text-muted);font-size:0.82rem;">${p.location}</td>
              <td>${p.start_date}</td>
              <td>${p.end_date}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px;">
                  <div style="width:60px;height:5px;background:var(--bg-surface);border-radius:3px;overflow:hidden;">
                    <div style="width:${p.progress}%;height:100%;background:var(--${catCls});border-radius:3px;"></div>
                  </div>
                  <span class="mono" style="font-size:0.8rem;">${p.progress}%</span>
                </div>
              </td>
              <td><span class="status-badge ${statusCls}">${p.status}</span></td>
              <td class="mono">${(p.budget/1000000).toFixed(2)}M</td>
              <td>
                <div style="display:flex;gap:5px;">
                  <button class="btn btn-ghost btn-icon btn-sm" onclick="window.projectDetail.openProject('${p.id}')" title="View Details">
                    <i class="fas fa-eye" style="color:var(--accent);"></i>
                  </button>
                  <button class="btn btn-ghost btn-icon btn-sm" onclick="window.app.openEditProjectModal('${p.id}')" title="Edit">
                    <i class="fas fa-pencil-alt" style="color:var(--text-muted);"></i>
                  </button>
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>`;
    }

    setSettingsTab(tab) {
      this._settingsTab = tab;
      this.renderSettingsView();
    }

    // ── Settings View (Now Featuring Commissioned Officers Profiles) ──
    renderSettingsView() {
      const v = document.getElementById('settings-view');
      if (!v) return;

      const tab = this._settingsTab || 'officers';
      const officers = window.spsStore.officers;
      const users = window.spsStore.users;
      const roles = window.spsStore.navalRoles;
      const attachments = window.spsStore.attachments;
      const projs = window.spsStore.projects;
      const isAdmin = window.spsStore.isAdmin();
      const pkg = { generated: new Date().toISOString(), source: 'SPS v4', total_attachments: attachments.length, total_projects: projs.length, attachments };
      const cloudStatus = window.spsCloudSync ? window.spsCloudSync.getStatus() : {
        connected: false,
        lastSync: 'Offline',
        projectId: 'cmsys-v2',
        databaseURL: 'https://cmsys-v2-default-rtdb.asia-southeast1.firebasedatabase.app',
        region: 'asia-southeast1 (Singapore)'
      };

      const totalCount = officers.length;
      const seniorCmd = officers.filter(o => o.rank.includes('Captain') || o.rank === 'Commander').length;
      const ltCdrs = officers.filter(o => o.rank.includes('Lt Commander')).length;
      const lieutenants = officers.filter(o => o.rank === 'Lieutenant').length;

      let tabContent = '';

      if (tab === 'officers') {
        tabContent = `
          <div class="section-header" style="margin-bottom:16px;">
            <div>
              <div class="section-title" style="font-size:1.2rem;display:flex;align-items:center;gap:10px;">
                <i class="fas fa-user-shield" style="color:var(--accent);"></i>
                <span>Commissioned Officers & Engineering Command Profiles</span>
              </div>
              <div style="font-size:0.8rem;color:var(--text-muted);margin-top:3px;">
                Authoritative Commissioned Naval Officers (Dockyard Trincomalee) • CMSys Synchronized
              </div>
            </div>
            <div style="display:flex;gap:10px;align-items:center;">
              <button class="btn btn-secondary btn-sm" onclick="window.app.triggerGlobalSync()">
                <i class="fas fa-rotate"></i> Sync CMSys
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.app.openOfficerLoginModal()">
                <i class="fas fa-key"></i> Switch / Authenticate
              </button>
              ${isAdmin ? `<button class="btn btn-ghost btn-sm" onclick="window.app.openAddOfficerModal()"><i class="fas fa-user-plus"></i> Add Officer</button>` : ''}
            </div>
          </div>

          <!-- Officers Stats Row -->
          <div class="kpi-row" style="margin-bottom:20px;">
            <div class="kpi-card">
              <div class="kpi-text">
                <label>Commissioned Officers</label>
                <div class="kpi-val" style="color:var(--accent);">${totalCount}</div>
                <div class="kpi-sub">Dockyard Command Registry</div>
              </div>
              <i class="kpi-icon fas fa-user-shield"></i>
            </div>
            <div class="kpi-card kpi-gold">
              <div class="kpi-text">
                <label>Senior Command (Capt / Cdr)</label>
                <div class="kpi-val" style="color:var(--warning);">${seniorCmd}</div>
                <div class="kpi-sub">CCED & CSLOG Directors</div>
              </div>
              <i class="kpi-icon fas fa-medal"></i>
            </div>
            <div class="kpi-card kpi-blue">
              <div class="kpi-text">
                <label>Staff & Executive (Lt Cdr)</label>
                <div class="kpi-val" style="color:#38bdf8;">${ltCdrs}</div>
                <div class="kpi-sub">SCE, CCEO, APO, Welfare</div>
              </div>
              <i class="kpi-icon fas fa-anchor"></i>
            </div>
            <div class="kpi-card kpi-green">
              <div class="kpi-text">
                <label>Civil Engineers (Lt)</label>
                <div class="kpi-val" style="color:var(--success);">${lieutenants}</div>
                <div class="kpi-sub">CLOGD, Marine, Planning</div>
              </div>
              <i class="kpi-icon fas fa-compass"></i>
            </div>
          </div>

          <!-- Filter & Search Toolbar -->
          <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;align-items:center;background:var(--bg-surface);padding:10px 14px;border-radius:10px;border:1px solid var(--border);">
            <div class="search-wrap" style="flex:1;min-width:240px;position:relative;">
              <i class="fas fa-search" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-dim);font-size:0.8rem;"></i>
              <input type="text" class="form-control" id="officer-search-inp" placeholder="Search by name, rank, service no, appointment, department..." style="padding-left:32px;height:34px;font-size:0.82rem;" oninput="window.app.filterOfficers()">
            </div>
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
              <select class="form-control" id="officer-rank-filter" style="width:160px;height:34px;font-size:0.8rem;" onchange="window.app.filterOfficers()">
                <option value="ALL">All Ranks</option>
                <option value="Captain">Captains</option>
                <option value="Commander">Commanders</option>
                <option value="Lt Commander">Lt Commanders</option>
                <option value="Lieutenant">Lieutenants</option>
              </select>
              <select class="form-control" id="officer-dept-filter" style="width:170px;height:34px;font-size:0.8rem;" onchange="window.app.filterOfficers()">
                <option value="ALL">All Departments</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="CSLOG">CSLOG</option>
                <option value="CE / Naval Academy">Naval Academy</option>
              </select>
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('officer-search-inp').value='';document.getElementById('officer-rank-filter').value='ALL';document.getElementById('officer-dept-filter').value='ALL';window.app.filterOfficers();" title="Reset Filters">
                <i class="fas fa-undo"></i> Reset
              </button>
            </div>
          </div>

          <!-- Grid of Officers Cards -->
          <div class="officer-grid" id="officers-cards-grid">
            ${this._renderOfficersCardsList(officers)}
          </div>
        `;
      } else if (tab === 'cloud') {
        tabContent = `
          <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:20px;">
            <div>
              <!-- Dedicated Firebase Cloud Backend Panel -->
              <div class="section-header">
                <div class="section-title"><i class="fas fa-cloud"></i> Firebase Cloud Operations</div>
                <button class="btn btn-secondary btn-sm" onclick="window.app.triggerGlobalSync()"><i class="fas fa-rotate"></i> Sync CMSys</button>
              </div>
              <div class="section-divider"></div>

              <div class="panel" style="margin-bottom:20px;">
                <div class="panel-head">
                  <span class="panel-title"><i class="fas fa-database" style="color:var(--accent);"></i> Realtime Database (cmsys-v2)</span>
                  <span class="badge ${cloudStatus.connected ? 'badge-success' : 'badge-warning'}">
                    <i class="fas ${cloudStatus.connected ? 'fa-signal' : 'fa-triangle-exclamation'}"></i> ${cloudStatus.connected ? 'Cloud Connected' : 'Local Offline'}
                  </span>
                </div>
                <div class="panel-body">
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
                    <div style="background:var(--bg-surface);border-radius:8px;padding:10px 12px;">
                      <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Project ID</div>
                      <div style="font-weight:700;color:var(--text-main);font-size:0.9rem;margin-top:2px;">${cloudStatus.projectId}</div>
                      <div style="font-size:0.7rem;color:var(--text-dim);margin-top:2px;">Separate Dedicated Account</div>
                    </div>
                    <div style="background:var(--bg-surface);border-radius:8px;padding:10px 12px;">
                      <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Location Region</div>
                      <div style="font-weight:700;color:var(--accent);font-size:0.9rem;margin-top:2px;">${cloudStatus.region}</div>
                      <div style="font-size:0.7rem;color:var(--text-dim);margin-top:2px;">Low-latency Asia RTDB</div>
                    </div>
                  </div>

                  <div style="background:var(--bg-app);border:1px solid var(--border);border-radius:8px;padding:10px 12px;margin-bottom:14px;font-size:0.73rem;font-family:var(--mono);line-height:1.6;">
                    <div style="color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">URL: <span style="color:var(--accent);">${cloudStatus.databaseURL}</span></div>
                    <div style="color:var(--text-muted);">Topology: <span style="color:#10b981;font-weight:700;">Dual Firebase (DB #1 Read-Only / DB #2 Read-Write)</span></div>
                    <div style="color:var(--text-muted);">Last Sync: <strong>${cloudStatus.lastSync}</strong></div>
                  </div>

                  <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn btn-primary btn-sm" onclick="window.app.forceCloudSync()"><i class="fas fa-cloud-arrow-up"></i> Push All to Cloud</button>
                    <button class="btn btn-secondary btn-sm" onclick="window.app.forceCloudPull()"><i class="fas fa-cloud-arrow-down"></i> Pull from Cloud</button>
                    <button class="btn btn-secondary btn-sm" onclick="window.app.publishAbsorptionDirect()"><i class="fas fa-paper-plane"></i> Publish to CMSys Cloud</button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <!-- CMSys Absorption Sync Bridge -->
              <div class="section-header">
                <div class="section-title"><i class="fas fa-sync-alt"></i> CMSys Attachment Sync Bridge</div>
              </div>
              <div class="section-divider"></div>

              <div class="panel">
                <div class="panel-head"><span class="panel-title"><i class="fas fa-info-circle"></i> Sync Engine</span></div>
                <div class="panel-body">
                  <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin-bottom:12px;">
                    Export or publish special project sailor attachments for CMSys absorption and headcount reconciliation.
                  </p>
                  <div style="margin-bottom:14px;">
                    <textarea id="sync-payload" readonly style="width:100%;height:180px;background:var(--bg-app);border:1px solid var(--border);border-radius:8px;padding:12px;color:var(--text-secondary);font-family:var(--mono);font-size:0.72rem;resize:none;line-height:1.5;">${JSON.stringify(pkg, null, 2)}</textarea>
                  </div>
                  <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button class="btn btn-primary btn-sm" onclick="window.app.renderSettingsView();window.app.toast('Payload refreshed!','success')"><i class="fas fa-sync"></i> Refresh</button>
                    <button class="btn btn-secondary btn-sm" onclick="window.app.downloadSyncPackage()"><i class="fas fa-download"></i> Download JSON</button>
                    <button class="btn btn-secondary btn-sm" onclick="window.app.copySyncPayload()"><i class="fas fa-copy"></i> Copy Payload</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      } else if (tab === 'roles') {
        tabContent = `
          <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:20px;">
            <div>
              <div class="section-header">
                <div class="section-title"><i class="fas fa-users-cog"></i> User Accounts & Roles</div>
                ${isAdmin ? `<button class="btn btn-primary btn-sm" onclick="window.app.openAddOfficerModal()"><i class="fas fa-user-plus"></i> New User</button>` : ''}
              </div>
              <div class="section-divider"></div>
              
              <div class="panel">
                <div class="panel-head"><span class="panel-title"><i class="fas fa-user-shield"></i> System Accounts (${users.length})</span></div>
                <div class="panel-body" style="padding:0;">
                  <table class="sps-table">
                    <thead><tr><th>Name</th><th>Service No.</th><th>Role</th><th>Designation</th><th>Actions</th></tr></thead>
                    <tbody>
                      ${users.map(u => {
                        const r = roles.find(role => role.id === u.role) || roles[0];
                        const isSelf = u.id === window.spsStore.activeUserId;
                        return `<tr>
                          <td><strong>${u.name}</strong> ${isSelf ? '<span style="font-size:0.65rem;background:var(--accent);color:#07101f;padding:1px 5px;border-radius:4px;font-weight:800;">YOU</span>':''}</td>
                          <td class="mono">${u.serviceNo}</td>
                          <td><span class="status-badge" style="background:rgba(56,189,248,0.15);color:var(--accent);">${r.code}</span></td>
                          <td style="font-size:0.8rem;color:var(--text-muted);">${u.appointment || u.designation || 'Engineering Officer'}</td>
                          <td>
                            <button class="btn btn-ghost btn-icon btn-sm" onclick="window.app.openEditOfficerModal('${u.id}')" title="Edit Profile"><i class="fas fa-edit"></i></button>
                            ${(!isSelf && isAdmin) ? `<button class="btn btn-ghost btn-icon btn-sm" onclick="if(confirm('Delete user profile?')){window.spsStore.deleteUserProfile('${u.id}');window.app.renderSettingsView();}" title="Delete"><i class="fas fa-trash" style="color:var(--danger);"></i></button>` : ''}
                          </td>
                        </tr>`;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div>
              <div class="section-header">
                <div class="section-title"><i class="fas fa-sitemap"></i> Naval Engineering Role Matrix</div>
              </div>
              <div class="section-divider"></div>
              <div class="panel">
                <div class="panel-head"><span class="panel-title"><i class="fas fa-shield-halved"></i> Engineering Privileges & Hierarchy</span></div>
                <div class="panel-body">
                  <div style="display:grid;grid-template-columns:1fr;gap:10px;">
                    ${roles.map(r => `
                      <div style="background:var(--bg-surface);border-radius:8px;padding:10px 12px;border:1px solid rgba(255,255,255,0.05);">
                        <div style="font-weight:700;color:var(--accent);font-size:0.85rem;">${r.name} (${r.code})</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;line-height:1.4;">${r.desc}</div>
                      </div>`).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }

      v.innerHTML = `
        <div class="settings-nav-tabs">
          <button class="settings-tab-btn ${tab === 'officers' ? 'active' : ''}" onclick="window.app.setSettingsTab('officers')">
            <i class="fas fa-user-shield" style="color:var(--accent);"></i> Commissioned Officers Profiles <span class="badge-pill">${officers.length}</span>
          </button>
          <button class="settings-tab-btn ${tab === 'cloud' ? 'active' : ''}" onclick="window.app.setSettingsTab('cloud')">
            <i class="fas fa-cloud" style="color:#38bdf8;"></i> Cloud & CMSys Sync
          </button>
          <button class="settings-tab-btn ${tab === 'roles' ? 'active' : ''}" onclick="window.app.setSettingsTab('roles')">
            <i class="fas fa-sitemap" style="color:#a855f7;"></i> Naval Role Matrix
          </button>
        </div>
        ${tabContent}
      `;
    }

    // ── Overhauled Attach Sailor Modal (Trade Filter, Approved Trade Quotas & Previous Location Breakdown) ──
    openAttachLabourModal(prefillProjectId) {
      const projects = window.spsStore.projects;
      const defaultProjId = prefillProjectId || (projects.find(p => p.status !== 'Completed')?.id || '');
      
      const overlay  = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `<div class="modal" style="max-width:680px;">
        <div class="modal-header">
          <h2><i class="fas fa-user-plus" style="color:var(--accent);margin-right:10px;"></i>Attach Sailor to Special Project</h2>
          <button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <!-- 1. Select Project -->
            <div class="form-group form-full">
              <label>Target Special Project <span style="color:var(--danger)">*</span></label>
              <select class="form-control" id="att-project" onchange="window.app.onProjectSelectInModal(this.value)">
                <option value="">— Select Project —</option>
                ${projects.filter(p => p.status !== 'Completed').map(p =>
                  `<option value="${p.id}" ${defaultProjId===p.id?'selected':''}>${p.code} — ${p.title} (${p.category})</option>`
                ).join('')}
              </select>
            </div>

            <!-- Trade-Wise Approved Quota Panel -->
            <div class="form-group form-full" id="trade-quota-panel" style="display:none;">
              <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:8px;padding:12px;">
                <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
                  <i class="fas fa-tasks" style="color:var(--accent);margin-right:6px;"></i> Approved Trade Headcount Quotas
                </div>
                <div id="trade-quota-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;"></div>
              </div>
            </div>

            <!-- 2. Filter Sailors by Trade -->
            <div class="form-group">
              <label>Filter Pool by Trade</label>
              <select class="form-control" id="att-trade-filter" onchange="window.app.onTradeFilterChange(this.value)">
                <option value="ALL">All Trades</option>
                ${TRADES.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>

            <!-- 3. Select Sailor (Searchable by Trade, Service No, Name) -->
            <div class="form-group">
              <label>Select Sailor (Equal Opportunity Fair Rotation) <span style="color:var(--danger)">*</span></label>
              <select class="form-control" id="att-sailor" onchange="window.app.onSailorSelect()">
                <option value="">— Select Sailor —</option>
              </select>
            </div>

            <!-- 4. Previous Attachments & Location Breakdown Panel -->
            <div class="form-group form-full" id="att-prev-panel" style="display:none;">
              <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:8px;padding:14px;" id="att-prev-content"></div>
            </div>

            <!-- 5. Date Range -->
            <div class="form-group">
              <label>From Date <span style="color:var(--danger)">*</span></label>
              <input type="date" class="form-control" id="att-from" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label>To Date <span style="color:var(--danger)">*</span></label>
              <input type="date" class="form-control" id="att-to">
            </div>
          </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-surface);">
          <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
          <button class="btn btn-primary" onclick="window.app.saveAttachment('${defaultProjId}')">
            <i class="fas fa-user-check"></i> Confirm Attachment
          </button>
        </div>
      </div>`;

      overlay.classList.add('open');

      // Populate initial values
      if (defaultProjId) {
        this.onProjectSelectInModal(defaultProjId);
      }
      this.populateSailorsInModal('ALL');
    }

    onProjectSelectInModal(projectId) {
      const quotaPanel = document.getElementById('trade-quota-panel');
      const quotaGrid  = document.getElementById('trade-quota-grid');
      if (!projectId || !quotaPanel) {
        if (quotaPanel) quotaPanel.style.display = 'none';
        return;
      }

      const quotas = window.spsStore.getProjectTradeQuotas(projectId);
      if (quotas.length === 0) {
        quotaPanel.style.display = 'none';
        return;
      }

      quotaGrid.innerHTML = quotas.map(q => {
        const isFull = q.remaining === 0;
        const color  = isFull ? 'var(--danger)' : q.attached > 0 ? 'var(--warning)' : 'var(--success)';
        return `
          <div style="background:var(--bg-card);border:1px solid ${isFull?'rgba(239,68,68,0.3)':'var(--border)'};border-radius:6px;padding:8px;text-align:center;">
            <div style="font-size:0.75rem;font-weight:700;color:var(--accent);">${q.trade}</div>
            <div style="font-size:1.1rem;font-weight:900;font-family:var(--mono);color:${color};">${q.attached}/${q.required}</div>
            <div style="font-size:0.65rem;color:${color};font-weight:600;">${isFull ? 'FULL' : q.remaining + ' vacant'}</div>
          </div>
        `;
      }).join('');
      quotaPanel.style.display = 'block';
    }

    populateSailorsInModal(tradeFilter) {
      const sailorSel = document.getElementById('att-sailor');
      if (!sailorSel) return;

      // Equal Opportunity Sort: Sailors with 0 or least religious project days first
      const sorted = window.spsStore.getSortedSailors('least_religious', tradeFilter);

      sailorSel.innerHTML = '<option value="">— Select Sailor (Equal Opportunity Sort) —</option>' +
        sorted.map(s => {
          const m = window.spsStore.getSailorFairnessMetrics(s.official_number);
          const star = m.religiousDays === 0 ? '⭐ (0 Rel Days)' : `(${m.religiousDays} Rel Days)`;
          return `<option value="${s.official_number}" data-name="${s.name}" data-rank="${s.rank}" data-trade="${s.trade}">
            [${s.trade}] ${s.official_number} — ${s.name} (${s.rank}) ${star}
          </option>`;
        }).join('');
    }

    onTradeFilterChange(trade) {
      this.populateSailorsInModal(trade);
      const prevPanel = document.getElementById('att-prev-panel');
      if (prevPanel) prevPanel.style.display = 'none';
    }

    onSailorSelect() {
      const sel = document.getElementById('att-sailor');
      const opt = sel.options[sel.selectedIndex];
      if (!opt || !opt.value) {
        document.getElementById('att-prev-panel').style.display = 'none';
        return;
      }

      const officialNumber = opt.value;
      const history = window.spsStore.getSailorAttachmentHistory(officialNumber);
      const metrics = window.spsStore.getSailorFairnessMetrics(officialNumber);
      const panel   = document.getElementById('att-prev-panel');
      const content = document.getElementById('att-prev-content');

      let html = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:8px;">
          <div>
            <div style="font-size:0.9rem;font-weight:800;color:var(--text-primary);">${opt.dataset.name}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${officialNumber} · ${opt.dataset.rank} · Trade: <strong style="color:var(--accent);">${opt.dataset.trade}</strong></div>
          </div>
          <div style="text-align:right;">
            <span style="font-size:0.72rem;font-weight:700;padding:3px 8px;border-radius:10px;background:${metrics.religiousDays===0?'rgba(34,197,94,0.18)':'rgba(245,158,11,0.18)'};color:${metrics.religiousDays===0?'var(--success)':'var(--warning)'};">
              ${metrics.priorityBadge}
            </span>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;text-align:center;">
          <div style="background:var(--bg-card);border-radius:6px;padding:6px;">
            <div style="font-size:0.95rem;font-weight:900;font-family:var(--mono);color:var(--religious);">${metrics.religiousDays} Days</div>
            <div style="font-size:0.68rem;color:var(--text-dim);">Religious Projects</div>
          </div>
          <div style="background:var(--bg-card);border-radius:6px;padding:6px;">
            <div style="font-size:0.95rem;font-weight:900;font-family:var(--mono);color:var(--accent);">${metrics.otherDays} Days</div>
            <div style="font-size:0.68rem;color:var(--text-dim);">Other CSR Projects</div>
          </div>
          <div style="background:var(--bg-card);border-radius:6px;padding:6px;">
            <div style="font-size:0.95rem;font-weight:900;font-family:var(--mono);color:var(--success);">${metrics.totalDays} Days</div>
            <div style="font-size:0.68rem;color:var(--text-dim);">Total SP Days</div>
          </div>
        </div>
      `;

      if (history.length > 0) {
        html += `<div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Previous Attachment Locations & Dates</div>`;
        html += `<div style="display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto;">`;
        history.forEach(h => {
          html += `
            <div style="background:var(--bg-card);border-radius:6px;padding:8px 10px;display:flex;align-items:center;justify-content:space-between;font-size:0.8rem;">
              <div>
                <div style="font-weight:700;color:var(--text-primary);">${h.project_title}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);"><i class="fas fa-map-marker-alt" style="margin-right:4px;"></i>${h.location} · Category: <span style="color:var(--accent);">${h.category}</span></div>
              </div>
              <div style="text-align:right;">
                <div style="font-family:var(--mono);font-weight:700;color:var(--accent);">${h.days_attached} days</div>
                <div style="font-size:0.68rem;color:var(--text-dim);">${h.from_date} → ${h.to_date}</div>
              </div>
            </div>
          `;
        });
        html += `</div>`;
      } else {
        html += `<div style="font-size:0.78rem;color:var(--success);font-weight:600;padding:6px;background:rgba(34,197,94,0.1);border-radius:6px;">
          ✨ No previous special project attachments. Perfect candidate for rotation!
        </div>`;
      }

      content.innerHTML = html;
      panel.style.display = 'block';
    }

    saveAttachment(prefillProjectId) {
      const projId = prefillProjectId || document.getElementById('att-project').value;
      const sailorSel = document.getElementById('att-sailor');
      const opt = sailorSel.options[sailorSel.selectedIndex];
      if (!projId) { this.toast('Select a project', 'warning'); return; }
      if (!opt || !opt.value) { this.toast('Select a sailor', 'warning'); return; }
      const from = document.getElementById('att-from').value;
      const to   = document.getElementById('att-to').value;
      if (!from || !to) { this.toast('Set from and to dates', 'warning'); return; }
      if (new Date(to) < new Date(from)) { this.toast('To date must be after From date', 'warning'); return; }

      const att = {
        project_id:      projId,
        official_number: opt.value,
        name:            opt.dataset.name,
        rank:            opt.dataset.rank,
        trade:           opt.dataset.trade,
        from_date:       from,
        to_date:         to,
        status:          'Active'
      };
      window.spsStore.addAttachment(att);
      document.getElementById('generic-modal-overlay').classList.remove('open');
      this.toast(`${att.name} attached to project!`, 'success');
      this.renderDashboard();
      if (this._currentView === 'labour') window.labourCentre.render();
    }

    // ── Other Modals & Utilities ──
    openAddUserModal() {
      const roles = window.spsStore.navalRoles;
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `<div class="modal" style="max-width:500px;">
        <div class="modal-header"><h2><i class="fas fa-user-plus"></i> Add New System User</h2><button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group form-full"><label>Full Name</label><input class="form-control" id="nu-name" placeholder="e.g. Lt Cdr A. Perera"></div>
            <div class="form-group"><label>Service Number</label><input class="form-control" id="nu-sno" placeholder="N/00999"></div>
            <div class="form-group"><label>Role</label>
              <select class="form-control" id="nu-role">
                ${roles.map(r => `<option value="${r.id}">${r.name} (${r.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group form-full"><label>Designation / Post</label><input class="form-control" id="nu-desig" placeholder="e.g. Senior Civil Engineer"></div>
          </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-surface);">
          <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
          <button class="btn btn-primary" onclick="window.app.saveNewUser()">Save User Profile</button>
        </div>
      </div>`;
      overlay.classList.add('open');
    }

    saveNewUser() {
      const name = document.getElementById('nu-name').value;
      const sno  = document.getElementById('nu-sno').value;
      const role = document.getElementById('nu-role').value;
      const desig= document.getElementById('nu-desig').value;
      if (!name || !sno) { this.toast('Enter name and service number', 'warning'); return; }

      window.spsStore.addUserProfile({ name, serviceNo: sno, role, designation: desig });
      document.getElementById('generic-modal-overlay').classList.remove('open');
      this.toast(`User profile "${name}" created!`, 'success');
      this.renderSettingsView();
    }

    openEditUserModal(userId) {
      const user = window.spsStore.users.find(u => u.id === userId);
      if (!user) return;
      const roles = window.spsStore.navalRoles;
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `<div class="modal" style="max-width:500px;">
        <div class="modal-header"><h2>Edit User Profile</h2><button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group form-full"><label>Full Name</label><input class="form-control" id="eu-name" value="${user.name}"></div>
            <div class="form-group"><label>Service Number</label><input class="form-control" id="eu-sno" value="${user.serviceNo}"></div>
            <div class="form-group"><label>Role</label>
              <select class="form-control" id="eu-role">
                ${roles.map(r => `<option value="${r.id}" ${r.id===user.role?'selected':''}>${r.name} (${r.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group form-full"><label>Designation</label><input class="form-control" id="eu-desig" value="${user.designation||''}"></div>
          </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-surface);">
          <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
          <button class="btn btn-primary" onclick="window.app.saveEditUser('${user.id}')">Save Changes</button>
        </div>
      </div>`;
      overlay.classList.add('open');
    }

    saveEditUser(userId) {
      const changes = {
        name:        document.getElementById('eu-name').value,
        serviceNo:   document.getElementById('eu-sno').value,
        role:        document.getElementById('eu-role').value,
        designation: document.getElementById('eu-desig').value
      };
      window.spsStore.updateUserProfile(userId, changes);
      document.getElementById('generic-modal-overlay').classList.remove('open');
      this.toast('User profile updated!', 'success');
      this.renderSettingsView();
    }

    openNewProjectModal() {
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `<div class="modal" style="max-width:760px;">
        <div class="modal-header">
          <h2><i class="fas fa-plus-circle" style="color:var(--accent);margin-right:10px;"></i>Add New Special Project</h2>
          <button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group">
              <label>Category <span style="color:var(--danger)">*</span></label>
              <select class="form-control" id="np-category">
                ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Project Code</label>
              <input class="form-control" id="np-code" value="SP-${Date.now().toString().slice(-5)}">
            </div>
            <div class="form-group form-full">
              <label>Project Title <span style="color:var(--danger)">*</span></label>
              <input class="form-control" id="np-title" placeholder="e.g. Temple renovation at...">
            </div>
            <div class="form-group form-full">
              <label>Location</label>
              <input class="form-control" id="np-location" placeholder="City, District or coordinates">
            </div>
            <div class="form-group">
              <label>Approval Reference</label>
              <input class="form-control" id="np-ref" placeholder="e.g. NCW/SIG/2026/045">
            </div>
            <div class="form-group">
              <label>Document Type</label>
              <select class="form-control" id="np-reftype">
                <option>Signal</option><option>Minute Sheet</option><option>Letter</option><option>Order</option>
              </select>
            </div>
            <div class="form-group form-full">
              <label>Approval Authority</label>
              <input class="form-control" id="np-authority" placeholder="e.g. Commander Eastern Naval Command">
            </div>
            <div class="form-group">
              <label>Commencement Date <span style="color:var(--danger)">*</span></label>
              <input type="date" class="form-control" id="np-start">
            </div>
            <div class="form-group">
              <label>Approval End Date <span style="color:var(--danger)">*</span></label>
              <input type="date" class="form-control" id="np-end">
            </div>
            <div class="form-group">
              <label>Budget (LKR)</label>
              <input type="number" class="form-control" id="np-budget" value="0">
            </div>
            <div class="form-group">
              <label>Progress %</label>
              <input type="number" class="form-control" id="np-progress" value="0" min="0" max="100">
            </div>
            <div class="form-group">
              <label>End User / Client Name</label>
              <input class="form-control" id="np-enduser" placeholder="Organisation / Person">
            </div>
            <div class="form-group">
              <label>End User Contact</label>
              <input class="form-control" id="np-contact">
            </div>
            <div class="form-group">
              <label>Officer In-Charge</label>
              <input class="form-control" id="np-incharge">
            </div>
            <div class="form-group">
              <label>Status</label>
              <select class="form-control" id="np-status">
                <option>Active</option><option>On Hold</option><option>Completed</option>
              </select>
            </div>
            <div class="form-group form-full">
              <label>Work Scope</label>
              <textarea class="form-control" id="np-scope" placeholder="Describe the work to be performed..." style="min-height:90px;"></textarea>
            </div>
            <div class="form-group form-full">
              <label>Notes</label>
              <textarea class="form-control" id="np-notes" style="min-height:60px;"></textarea>
            </div>
          </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-surface);">
          <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
          <button class="btn btn-primary" onclick="window.app.saveNewProject()">
            <i class="fas fa-save"></i> Save Project
          </button>
        </div>
      </div>`;
      overlay.classList.add('open');
    }

    saveNewProject() {
      const title = document.getElementById('np-title').value.trim();
      const start = document.getElementById('np-start').value;
      const end   = document.getElementById('np-end').value;
      if (!title) { this.toast('Project title is required', 'warning'); return; }
      if (!start || !end) { this.toast('Start and end dates are required', 'warning'); return; }

      const cat = document.getElementById('np-category').value;
      const p = {
        id: `SP-${cat.substring(0,3).toUpperCase().replace(/ /g,'')}-${Date.now().toString().slice(-4)}`,
        code:              document.getElementById('np-code').value,
        category:          cat,
        title,
        location:          document.getElementById('np-location').value,
        start_date:        start,
        end_date:          end,
        budget:            parseFloat(document.getElementById('np-budget').value) || 0,
        progress:          parseInt(document.getElementById('np-progress').value) || 0,
        approval_ref:      document.getElementById('np-ref').value,
        approval_type:     document.getElementById('np-reftype').value,
        approval_authority:document.getElementById('np-authority').value,
        end_user_name:     document.getElementById('np-enduser').value,
        end_user_contact:  document.getElementById('np-contact').value,
        incharge:          document.getElementById('np-incharge').value,
        status:            document.getElementById('np-status').value,
        work_scope:        document.getElementById('np-scope').value,
        notes:             document.getElementById('np-notes').value,
        previous_approvals: [],
        trades_required:   {},
        job_card_cost:     0,
        material_status:   'OK'
      };
      window.spsStore.addProject(p);
      document.getElementById('generic-modal-overlay').classList.remove('open');
      this.toast(`Project "${title}" added successfully!`, 'success');
      this.renderDashboard();
    }

    openEditProjectModal(projectId) {
      const p = window.spsStore.getProject(projectId);
      if (!p) return;
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `<div class="modal" style="max-width:600px;">
        <div class="modal-header">
          <h2>Edit Project — ${p.code}</h2>
          <button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group form-full"><label>Title</label><input class="form-control" id="ep-title" value="${p.title}"></div>
            <div class="form-group"><label>Progress %</label><input type="number" class="form-control" id="ep-progress" value="${p.progress}" min="0" max="100"></div>
            <div class="form-group"><label>Status</label>
              <select class="form-control" id="ep-status">
                <option ${p.status==='Active'?'selected':''}>Active</option>
                <option ${p.status==='On Hold'?'selected':''}>On Hold</option>
                <option ${p.status==='Completed'?'selected':''}>Completed</option>
              </select>
            </div>
            <div class="form-group"><label>Material Status</label>
              <select class="form-control" id="ep-mat">
                <option ${p.material_status==='OK'?'selected':''}>OK</option>
                <option ${p.material_status==='Low'?'selected':''}>Low</option>
                <option ${p.material_status==='Critical'?'selected':''}>Critical</option>
              </select>
            </div>
            <div class="form-group"><label>Job Card Cost (LKR)</label><input type="number" class="form-control" id="ep-cost" value="${p.job_card_cost||0}"></div>
            <div class="form-group form-full"><label>End Date</label><input type="date" class="form-control" id="ep-end" value="${p.end_date}"></div>
            <div class="form-group form-full"><label>Notes</label><textarea class="form-control" id="ep-notes">${p.notes||''}</textarea></div>
          </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:space-between;background:var(--bg-surface);">
          <button class="btn btn-danger btn-sm" onclick="if(confirm('Delete this project?')){window.spsStore.deleteProject('${p.id}');document.getElementById('generic-modal-overlay').classList.remove('open');window.app.renderDashboard();window.app.toast('Project deleted','success');}">
            <i class="fas fa-trash"></i> Delete
          </button>
          <div style="display:flex;gap:10px;">
            <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
            <button class="btn btn-primary" onclick="window.app.saveEditProject('${p.id}')">
              <i class="fas fa-save"></i> Save Changes
            </button>
          </div>
        </div>
      </div>`;
      overlay.classList.add('open');
    }

    saveEditProject(projectId) {
      const changes = {
        title:           document.getElementById('ep-title').value,
        progress:        parseInt(document.getElementById('ep-progress').value) || 0,
        status:          document.getElementById('ep-status').value,
        material_status: document.getElementById('ep-mat').value,
        job_card_cost:   parseFloat(document.getElementById('ep-cost').value) || 0,
        end_date:        document.getElementById('ep-end').value,
        notes:           document.getElementById('ep-notes').value
      };
      window.spsStore.updateProject(projectId, changes);
      document.getElementById('generic-modal-overlay').classList.remove('open');
      this.toast('Project updated!', 'success');
      this.renderDashboard();
      if (this._currentView === 'projects') this.renderProjectsView();
    }

    updateSidebarCounts() {
      const projects = window.spsStore.projects;
      const naval = window.spsStore.navalProjects;

      // Special categories
      CATEGORIES.forEach(cat => {
        const id  = `nb-${cat.replace(/ /g,'').toLowerCase()}`;
        const cnt = projects.filter(p => p.category === cat && p.status !== 'Completed').length;
        const el  = document.getElementById(id);
        if (el) el.textContent = cnt;
      });

      const spEl = document.getElementById('nb-special');
      if (spEl) spEl.textContent = projects.length;

      // Officers total badge
      const nbOfficers = document.getElementById('nb-officers');
      if (nbOfficers) nbOfficers.textContent = window.spsStore.officers.length;
      const nbSettingsOfficers = document.getElementById('nb-settings-officers');
      if (nbSettingsOfficers) nbSettingsOfficers.textContent = window.spsStore.officers.length;

      // Labour total attached badge
      const nbLabour = document.getElementById('nb-labour-total');
      if (nbLabour) nbLabour.textContent = window.spsStore.attachments.length;

      // Naval projects total badge
      const nbNaval = document.getElementById('nb-naval');
      if (nbNaval) nbNaval.textContent = naval.length;

      // Progress Center badge
      const nbProg = document.getElementById('nb-progress-center');
      if (nbProg) nbProg.textContent = (naval.length + projects.length) || 'LIVE';

      // Naval Vote counts
      const v2104 = document.getElementById('nb-vote-2104');
      if (v2104) v2104.textContent = window.spsStore.getNavalProjectsByVote('2104').length;

      const v2001 = document.getElementById('nb-vote-2001');
      if (v2001) v2001.textContent = window.spsStore.getNavalProjectsByVote('2001').length;

      const v2506 = document.getElementById('nb-vote-2506');
      if (v2506) v2506.textContent = window.spsStore.getNavalProjectsByVote('2506').length;

      const v1303 = document.getElementById('nb-vote-1303');
      if (v1303) v1303.textContent = window.spsStore.getNavalProjectsByVote('1303').length;

      const vNon = document.getElementById('nb-vote-non');
      if (vNon) vNon.textContent = window.spsStore.getNavalProjectsByVote('Non-Naval').length;

      const v2103 = document.getElementById('nb-vote-2103');
      if (v2103) v2103.textContent = window.spsStore.getNavalProjectsByVote('2103').length;
    }

    _bindGlobalSearch() {
      const inp = document.getElementById('global-search');
      if (!inp) return;
      inp.addEventListener('input', () => {
        const q = inp.value.toLowerCase();
        if (!q) { this.renderDashboard(); return; }
        const matches = window.spsStore.projects.filter(p =>
          p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        const grid = document.getElementById('projects-grid');
        if (grid) grid.innerHTML = matches.length === 0
          ? `<div class="empty-state" style="grid-column:1/-1;"><i class="fas fa-search"></i><p>No projects matching "${q}"</p></div>`
          : matches.map(p => this._projectCard(p)).join('');
      });
    }

    // ═════════════════════════════════════════════════════════
    // REQUIREMENT 2: OFFICERS PROFILES & AUTHENTICATION
    // ═════════════════════════════════════════════════════════
    renderOfficersView() {
      this._settingsTab = 'officers';
      this.navigate('settings');
    }

    _renderOfficersCardsList(officers) {
      const activeOfficer = window.spsStore.activeOfficer;
      const isAdmin = window.spsStore.isAdmin();

      if (!officers || officers.length === 0) {
        return `<div class="empty-state" style="grid-column:1/-1;padding:40px;">
          <i class="fas fa-user-shield" style="font-size:2rem;color:var(--text-dim);margin-bottom:10px;"></i>
          <p>No commissioned officers found matching the filter criteria.</p>
        </div>`;
      }

      return officers.map(off => {
        const isActive = activeOfficer && (activeOfficer.id === off.id);
        const projects = off.assignedProjects || [];
        const roleObj = window.spsStore.navalRoles.find(r => r.id === off.role) || { code: (off.role || 'OFFICER').toUpperCase() };

        return `
          <div class="officer-card ${isActive ? 'officer-card-active' : ''}">
            <div class="officer-card-header">
              <div class="officer-card-avatar">
                ${off.name.charAt(0) || 'O'}
              </div>
              <div class="officer-card-info">
                <div class="officer-card-name" title="${off.name}">${off.name}</div>
                <div class="officer-card-appointment"><i class="fas fa-briefcase" style="font-size:0.7rem;margin-right:4px;"></i>${off.appointment}</div>
                <div class="officer-card-svc">${off.serviceNo || 'NRC'} · ${off.department || 'Dockyard'}</div>
              </div>
            </div>

            <div class="officer-tags-row">
              <span class="officer-tag rank">${off.rank}</span>
              <span class="officer-tag role">${roleObj.code}</span>
              <span class="officer-tag"><i class="fas fa-circle" style="color:var(--success);font-size:0.5rem;margin-right:4px;"></i>${off.status || 'Active'}</span>
            </div>

            <table class="officer-details-table">
              <tr>
                <td><i class="fas fa-envelope" style="margin-right:4px;"></i> Email</td>
                <td style="font-family:var(--mono);">${off.email || '—'}</td>
              </tr>
              <tr>
                <td><i class="fas fa-phone" style="margin-right:4px;"></i> Mobile</td>
                <td>${off.phone || '—'}</td>
              </tr>
              ${off.officeNo ? `<tr><td><i class="fas fa-building" style="margin-right:4px;"></i> Office Ext</td><td>${off.officeNo}</td></tr>` : ''}
              <tr>
                <td><i class="fas fa-user" style="margin-right:4px;"></i> CMSys User</td>
                <td style="font-family:var(--mono);color:var(--accent);">${off.username}</td>
              </tr>
            </table>

            <div style="font-size:0.72rem;color:var(--text-muted);display:flex;flex-direction:column;gap:4px;">
              <span style="font-weight:700;letter-spacing:0.4px;">ASSIGNED / COMMAND PROJECTS</span>
              <div style="display:flex;gap:4px;flex-wrap:wrap;">
                ${projects.map(p => `<span class="officer-tag" style="background:rgba(56,189,248,0.08);color:#38bdf8;cursor:pointer;" onclick="window.app.searchProjectQuick('${p}')" title="Filter project">${p}</span>`).join('')}
              </div>
            </div>

            <div class="officer-card-footer">
              ${isActive ? `
                <span style="font-size:0.75rem;font-weight:800;color:var(--success);display:flex;align-items:center;gap:6px;">
                  <i class="fas fa-check-circle"></i> Active Session
                </span>
              ` : `
                <button class="btn btn-primary btn-sm" onclick="window.app.switchOfficerQuick('${off.id}')" title="Switch active profile">
                  <i class="fas fa-arrow-right-to-bracket"></i> Select Officer
                </button>
              `}
              <div style="display:flex;gap:6px;">
                <button class="btn btn-secondary btn-sm" onclick="window.app.openOfficerLoginModal('${off.id}')" title="Authenticate with CMSys Password">
                  <i class="fas fa-key"></i> Authenticate
                </button>
                ${isAdmin ? `
                  <button class="btn btn-ghost btn-sm" onclick="window.app.openEditOfficerModal('${off.id}')" title="Edit Officer Profile">
                    <i class="fas fa-edit"></i>
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    filterOfficers() {
      const q = (document.getElementById('officer-search-inp')?.value || '').toLowerCase();
      const rankFilter = document.getElementById('officer-rank-filter')?.value || 'ALL';
      const deptFilter = document.getElementById('officer-dept-filter')?.value || 'ALL';

      let list = window.spsStore.officers;
      if (rankFilter !== 'ALL') {
        list = list.filter(o => o.rank.includes(rankFilter));
      }
      if (deptFilter !== 'ALL') {
        list = list.filter(o => o.department && o.department.includes(deptFilter));
      }
      if (q) {
        list = list.filter(o =>
          o.name.toLowerCase().includes(q) ||
          (o.rank && o.rank.toLowerCase().includes(q)) ||
          (o.serviceNo && o.serviceNo.toLowerCase().includes(q)) ||
          (o.appointment && o.appointment.toLowerCase().includes(q)) ||
          (o.department && o.department.toLowerCase().includes(q)) ||
          (o.username && o.username.toLowerCase().includes(q))
        );
      }
      const grid = document.getElementById('officers-cards-grid');
      if (grid) grid.innerHTML = this._renderOfficersCardsList(list);
    }

    switchOfficerQuick(officerId) {
      const officer = window.spsStore.officers.find(o => o.id === officerId);
      if (!officer) return;
      window.spsStore.setActiveUser(officer.id);
      const modal = document.getElementById('officer-login-modal');
      if (modal) modal.classList.remove('open');
      this.toast(`Switched active profile to ${officer.name} (${officer.appointment})`, 'success');
      this._renderRoleSwitcher();
      this._applyRolePermissions();
      if (this._currentView === 'officers') this.renderOfficersView();
      if (this._currentView === 'settings') this.renderSettingsView();
    }

    searchProjectQuick(keyword) {
      if (!keyword || keyword === 'ALL') {
        this.navigate('dashboard');
        return;
      }
      this.navigate('projects');
      const searchInp = document.getElementById('global-search');
      if (searchInp) {
        searchInp.value = keyword;
        searchInp.dispatchEvent(new Event('input'));
      }
    }

    openOfficerLoginModal(preselectedId = null) {
      const modal = document.getElementById('officer-login-modal');
      if (!modal) return;
      const officers = window.spsStore.officers;
      const selId = preselectedId || window.spsStore.activeUserId || officers[0]?.id;
      const selected = officers.find(o => o.id === selId) || officers[0];

      modal.innerHTML = `
        <div class="login-dialog-box" onclick="event.stopPropagation()">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:38px;height:38px;border-radius:10px;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);display:flex;align-items:center;justify-content:center;color:var(--accent);">
                <i class="fas fa-shield-halved" style="font-size:1.15rem;"></i>
              </div>
              <div>
                <h3 style="font-size:1rem;font-weight:800;color:#fff;margin:0;">Officer Authentication</h3>
                <p style="font-size:0.72rem;color:var(--accent);margin:0;font-weight:600;">CMSys Naval Engineering System</p>
              </div>
            </div>
            <button class="modal-close" onclick="document.getElementById('officer-login-modal').classList.remove('open')" style="color:var(--text-muted);font-size:1.1rem;background:none;border:none;cursor:pointer;">
              ✕
            </button>
          </div>

          <div style="margin-bottom:14px;">
            <label style="font-size:0.72rem;font-weight:700;color:var(--text-secondary);display:block;margin-bottom:6px;letter-spacing:0.5px;">COMMISSIONED OFFICER</label>
            <select class="form-control" id="login-officer-select" onchange="window.app.onLoginOfficerChange(this.value)">
              ${officers.map(o => `<option value="${o.id}" ${o.id===selId?'selected':''}>${o.name} — ${o.appointment} (${o.serviceNo})</option>`).join('')}
            </select>
          </div>

          <div id="login-officer-preview" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:12px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">
            <div style="width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#0369a1,#1e3a8a);border:1px solid var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.1rem;">
              <i class="fas fa-user-shield"></i>
            </div>
            <div style="flex:1;min-width:0;">
              <div id="login-preview-name" style="font-size:0.86rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${selected.name}</div>
              <div id="login-preview-app" style="font-size:0.72rem;color:var(--accent);">${selected.appointment}</div>
              <div id="login-preview-svc" style="font-size:0.68rem;color:var(--text-muted);">Service: ${selected.serviceNo} · Role: ${selected.role.toUpperCase()}</div>
            </div>
          </div>

          <div style="margin-bottom:16px;">
            <label style="font-size:0.72rem;font-weight:700;color:var(--text-secondary);display:block;margin-bottom:6px;letter-spacing:0.5px;">CMSYS PASSWORD / PASSCODE</label>
            <div style="position:relative;">
              <input type="password" class="form-control" id="login-officer-pwd" placeholder="Enter password (e.g. arjuna@1991, Navy@2025)" style="padding-right:38px;" onkeydown="if(event.key==='Enter')window.app.submitOfficerLogin()">
              <button type="button" onclick="const p=document.getElementById('login-officer-pwd');p.type=p.type==='password'?'text':'password';" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-muted);cursor:pointer;">
                <i class="fas fa-eye"></i>
              </button>
            </div>
            <div style="font-size:0.68rem;color:var(--text-dim);margin-top:5px;">
              Authorized credentials: <code style="color:var(--accent);background:rgba(245,158,11,0.1);padding:1px 4px;border-radius:3px;">arjuna@1991</code> or <code style="color:var(--accent);background:rgba(245,158,11,0.1);padding:1px 4px;border-radius:3px;">Navy@2025</code>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid rgba(255,255,255,0.08);padding-top:14px;">
            <button class="btn btn-secondary btn-sm" onclick="window.app.switchOfficerQuick(document.getElementById('login-officer-select').value)">
              <i class="fas fa-user-check"></i> Quick Select
            </button>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-ghost btn-sm" onclick="document.getElementById('officer-login-modal').classList.remove('open')">Cancel</button>
              <button class="btn btn-primary btn-sm" id="btn-submit-officer-login" onclick="window.app.submitOfficerLogin()">
                <i class="fas fa-shield-alt"></i> Authenticate
              </button>
            </div>
          </div>
        </div>
      `;
      modal.classList.add('open');
      setTimeout(() => {
        const inp = document.getElementById('login-officer-pwd');
        if (inp) inp.focus();
      }, 100);
    }

    onLoginOfficerChange(officerId) {
      const officer = window.spsStore.officers.find(o => o.id === officerId);
      if (!officer) return;
      const nameEl = document.getElementById('login-preview-name');
      const appEl = document.getElementById('login-preview-app');
      const svcEl = document.getElementById('login-preview-svc');
      if (nameEl) nameEl.textContent = officer.name;
      if (appEl) appEl.textContent = officer.appointment;
      if (svcEl) svcEl.textContent = `Service: ${officer.serviceNo} · Role: ${officer.role.toUpperCase()}`;
    }

    async submitOfficerLogin() {
      const selEl = document.getElementById('login-officer-select');
      const pwdEl = document.getElementById('login-officer-pwd');
      const btn = document.getElementById('btn-submit-officer-login');
      if (!selEl || !pwdEl) return;

      const officerId = selEl.value;
      const password = pwdEl.value.trim();
      const officer = window.spsStore.officers.find(o => o.id === officerId);
      if (!officer) return;

      if (!password) {
        this.toast('Please enter your CMSys password', 'warning');
        pwdEl.focus();
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
      }

      try {
        const res = await fetch('api/api.php?action=login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: officer.username,
            password: password
          })
        });
        const data = await res.json();
        if (data.status === 'success') {
          window.spsStore.setActiveUser(officer.id);
          document.getElementById('officer-login-modal').classList.remove('open');
          this.toast(`Authenticated as ${officer.name} (${officer.appointment})`, 'success');
          this._renderRoleSwitcher();
          this._applyRolePermissions();
          if (this._currentView === 'officers') this.renderOfficersView();
          if (this._currentView === 'settings') this.renderSettingsView();
        } else {
          this.toast(data.message || 'Authentication failed', 'error');
        }
      } catch(e) {
        // Fallback local verification if offline
        if (password === 'arjuna@1991' || password === 'Navy@2025' || password === 'admin123') {
          window.spsStore.setActiveUser(officer.id);
          document.getElementById('officer-login-modal').classList.remove('open');
          this.toast(`Authenticated as ${officer.name} (Local mode)`, 'success');
          this._renderRoleSwitcher();
          this._applyRolePermissions();
          if (this._currentView === 'officers') this.renderOfficersView();
        } else {
          this.toast('Invalid password: ' + e.message, 'error');
        }
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<i class="fas fa-shield-alt"></i> Authenticate';
        }
      }
    }

    openEditOfficerModal(officerId) {
      const off = window.spsStore.officers.find(o => o.id === officerId);
      if (!off) return;
      const roles = window.spsStore.navalRoles;
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `
        <div class="modal" style="max-width:560px;">
          <div class="modal-header">
            <h2><i class="fas fa-user-edit" style="color:var(--accent);margin-right:8px;"></i> Edit Officer Profile</h2>
            <button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group form-full"><label>Full Name</label><input class="form-control" id="eo-name" value="${off.name}"></div>
              <div class="form-group"><label>Rank</label><input class="form-control" id="eo-rank" value="${off.rank}"></div>
              <div class="form-group"><label>Service Number</label><input class="form-control" id="eo-sno" value="${off.serviceNo}"></div>
              <div class="form-group"><label>Appointment</label><input class="form-control" id="eo-app" value="${off.appointment}"></div>
              <div class="form-group"><label>Department</label><input class="form-control" id="eo-dept" value="${off.department||''}"></div>
              <div class="form-group"><label>Role / Privileges</label>
                <select class="form-control" id="eo-role">
                  ${roles.map(r => `<option value="${r.id}" ${r.id===off.role?'selected':''}>${r.name} (${r.code})</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label>Email</label><input class="form-control" id="eo-email" value="${off.email||''}"></div>
              <div class="form-group"><label>Phone</label><input class="form-control" id="eo-phone" value="${off.phone||''}"></div>
              <div class="form-group"><label>Office Extension</label><input class="form-control" id="eo-offno" value="${off.officeNo||''}"></div>
            </div>
          </div>
          <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-surface);">
            <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
            <button class="btn btn-primary" onclick="window.app.saveEditOfficer('${off.id}')">Save Officer</button>
          </div>
        </div>
      `;
      overlay.classList.add('open');
    }

    saveEditOfficer(officerId) {
      const changes = {
        name:        document.getElementById('eo-name').value.trim(),
        rank:        document.getElementById('eo-rank').value.trim(),
        serviceNo:   document.getElementById('eo-sno').value.trim(),
        appointment: document.getElementById('eo-app').value.trim(),
        department:  document.getElementById('eo-dept').value.trim(),
        role:        document.getElementById('eo-role').value,
        email:       document.getElementById('eo-email').value.trim(),
        phone:       document.getElementById('eo-phone').value.trim(),
        officeNo:    document.getElementById('eo-offno').value.trim()
      };
      window.spsStore.updateUserProfile(officerId, changes);
      document.getElementById('generic-modal-overlay').classList.remove('open');
      this.toast('Officer profile updated!', 'success');
      this._renderRoleSwitcher();
      if (this._currentView === 'officers') this.renderOfficersView();
      if (this._currentView === 'settings') this.renderSettingsView();
    }

    openAddOfficerModal() {
      const roles = window.spsStore.navalRoles;
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `
        <div class="modal" style="max-width:560px;">
          <div class="modal-header">
            <h2><i class="fas fa-user-plus" style="color:var(--accent);margin-right:8px;"></i> Add Commissioned Officer</h2>
            <button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group form-full"><label>Full Name</label><input class="form-control" id="ao-name" placeholder="e.g. Lt Cdr S. Rajapaksa"></div>
              <div class="form-group"><label>Rank</label><input class="form-control" id="ao-rank" placeholder="e.g. Lt Commander"></div>
              <div class="form-group"><label>Service Number</label><input class="form-control" id="ao-sno" placeholder="e.g. NRX 4501"></div>
              <div class="form-group"><label>Appointment</label><input class="form-control" id="ao-app" placeholder="e.g. Resident Engineer"></div>
              <div class="form-group"><label>Department</label><input class="form-control" id="ao-dept" value="Civil Engineering"></div>
              <div class="form-group"><label>Role / Privileges</label>
                <select class="form-control" id="ao-role">
                  ${roles.map(r => `<option value="${r.id}">${r.name} (${r.code})</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label>Email</label><input class="form-control" id="ao-email" placeholder="name@navy.lk"></div>
              <div class="form-group"><label>Phone</label><input class="form-control" id="ao-phone" placeholder="071-XXXXXXX"></div>
              <div class="form-group"><label>Office Ext</label><input class="form-control" id="ao-offno" placeholder="026-XXXXXXX"></div>
            </div>
          </div>
          <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-surface);">
            <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
            <button class="btn btn-primary" onclick="window.app.saveNewOfficer()">Add Officer</button>
          </div>
        </div>
      `;
      overlay.classList.add('open');
    }

    saveNewOfficer() {
      const name = document.getElementById('ao-name').value.trim();
      const rank = document.getElementById('ao-rank').value.trim();
      const sno  = document.getElementById('ao-sno').value.trim();
      if (!name || !sno) { this.toast('Name and service number required', 'warning'); return; }

      const officer = {
        name,
        rank: rank || 'Lieutenant',
        serviceNo: sno,
        username: name.toLowerCase().replace(/[^a-z0-9]/g, '.'),
        appointment: document.getElementById('ao-app').value.trim() || 'Engineering Officer',
        department: document.getElementById('ao-dept').value.trim() || 'Civil Engineering',
        role: document.getElementById('ao-role').value,
        category: 'Officer',
        email: document.getElementById('ao-email').value.trim(),
        phone: document.getElementById('ao-phone').value.trim(),
        officeNo: document.getElementById('ao-offno').value.trim(),
        status: 'Active',
        assignedProjects: []
      };

      window.spsStore.addUserProfile(officer);
      document.getElementById('generic-modal-overlay').classList.remove('open');
      this.toast(`Officer ${officer.name} added!`, 'success');
      this._renderRoleSwitcher();
      if (this._currentView === 'officers') this.renderOfficersView();
      if (this._currentView === 'settings') this.renderSettingsView();
    }

    // ═════════════════════════════════════════════════════════
    // REQUIREMENT 3: LIVE CMSYS BI-DIRECTIONAL SYNCHRONIZATION
    // ═════════════════════════════════════════════════════════
    async triggerGlobalSync() {
      const syncBtn = document.getElementById('btn-sync-all');
      if (syncBtn) {
        syncBtn.classList.add('syncing');
        const span = syncBtn.querySelector('span');
        if (span) span.textContent = 'Syncing...';
      }
      this.toast('Synchronizing CMSys Projects, Labours & Officers across Cloud...', 'info');

      try {
        const res = await fetch('api/api.php?action=sync_all_cmsys');
        const data = await res.json();
        if (data.status === 'success') {
          if (window.spsCloudSync) {
            await window.spsCloudSync.forceSyncToCloud();
          }

          this.toast(`CMSys Synced: ${data.synced.officers} Officers, ${data.synced.ongoing_special_projects} Special Projects, ${data.synced.naval_capital_projects} Naval Projects, ${data.synced.attached_labours} Sailors`, 'success');
          this.updateSidebarCounts();
          if (this._currentView === 'dashboard') this.renderDashboard();
          if (this._currentView === 'projects')  this.renderProjectsView();
          if (this._currentView === 'naval-projects' && window.navalProjectsModule) window.navalProjectsModule.render();
          if (this._currentView === 'labour' && window.labourCentre) window.labourCentre.render();
          if (this._currentView === 'settings') this.renderSettingsView();
        } else {
          this.toast('Sync returned error: ' + (data.message || 'Unknown'), 'warning');
        }
      } catch (e) {
        if (window.spsCloudSync) {
          try {
            await window.spsCloudSync.forceSyncToCloud();
            this.toast('Synced directly with CMSys Firebase Cloud', 'success');
            if (this._currentView === 'settings') this.renderSettingsView();
          } catch(ce) {
            this.toast('Sync completed with local cache: ' + e.message, 'info');
          }
        } else {
          this.toast('Sync completed with local cache: ' + e.message, 'info');
        }
      } finally {
        if (syncBtn) {
          syncBtn.classList.remove('syncing');
          const span = syncBtn.querySelector('span');
          if (span) span.textContent = 'Sync CMSys';
        }
      }
    }

    downloadSyncPackage() {
      const atts  = window.spsStore.attachments;
      const projs = window.spsStore.projects;
      const pkg = { generated: new Date().toISOString(), source: 'SPS v4', attachments: atts, project_index: projs };
      const blob = new Blob([JSON.stringify(pkg, null, 2)], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `SPS_CMSys_Sync_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      this.toast('Sync package downloaded!', 'success');
    }

    copySyncPayload() {
      const ta = document.getElementById('sync-payload');
      if (ta) { navigator.clipboard.writeText(ta.value).then(() => this.toast('Copied to clipboard!', 'success')); }
    }

    async forceCloudSync() {
      if (!window.spsCloudSync) {
        this.toast('Cloud sync engine not available', 'error');
        return;
      }
      try {
        this.toast('Pushing all data to Firebase cmsys-v2...', 'info');
        const res = await window.spsCloudSync.forceSyncToCloud();
        this.toast(`Cloud Sync Complete! (${res.count} projects synced)`, 'success');
        this.renderSettingsView();
      } catch (e) {
        this.toast(`Cloud Sync Error: ${e.message}`, 'error');
      }
    }

    async forceCloudPull() {
      if (!window.spsCloudSync) {
        this.toast('Cloud sync engine not available', 'error');
        return;
      }
      try {
        this.toast('Pulling latest data from Firebase cloud...', 'info');
        await window.spsCloudSync.forcePullFromCloud();
        this.toast('Refreshed data from cmsys-v2 cloud!', 'success');
        this.renderSettingsView();
      } catch (e) {
        this.toast(`Cloud Pull Error: ${e.message}`, 'error');
      }
    }

    async publishAbsorptionDirect() {
      if (window.cmsysBridge) {
        await window.cmsysBridge.triggerServerRESTSync();
        this.renderSettingsView();
        return;
      }
      const atts = window.spsStore.attachments;
      const activeProj = window.spsStore.projects[0];
      const payload = {
        source_system: "SPECIAL_PROJECT_SYSTEM_V1",
        sync_timestamp: new Date().toISOString(),
        project_meta: activeProj ? { id: activeProj.id, code: activeProj.code, title: activeProj.title } : {},
        attached_sailors_count: atts.length,
        attachments: atts
      };
      if (window.spsCloudSync) {
        await window.spsCloudSync.publishAbsorptionPackage(payload);
        this.toast(`Published ${atts.length} attachments to cmsys-v2!`, 'success');
        this.renderSettingsView();
      }
    }

    toast(msg, type = 'info') {
      const container = document.getElementById('toasts');
      const t = document.createElement('div');
      t.className = `toast ${type === 'success' ? 't-success' : type === 'warning' ? 't-warning' : type === 'error' ? 't-error' : ''}`;
      const icons = { success: 'fa-check-circle', warning: 'fa-exclamation-triangle', error: 'fa-times-circle', info: 'fa-info-circle' };
      t.innerHTML = `<i class="fas ${icons[type] || 'fa-info-circle'}" style="color:${type==='success'?'var(--success)':type==='warning'?'var(--warning)':type==='error'?'var(--danger)':'var(--accent)'};"></i> ${msg}`;
      container.appendChild(t);
      setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(100%)'; t.style.transition = 'all 0.4s'; setTimeout(() => t.remove(), 400); }, 3200);
    }
  }

  window.app = new SPSApp();
  document.addEventListener('DOMContentLoaded', async () => window.app.init());
})();
