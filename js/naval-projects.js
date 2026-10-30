// ===================================================================
// SLN Project Platform — Naval Projects & Procurement Command Center
// Dedicated Window for Sri Lanka Navy Capital Engineering Works,
// Government Vote Allocations & Detailed Procurement PR Register
// ===================================================================
(function() {
  'use strict';

  const VOTE_CONFIG = {
    '2104': { label: 'Vote 2104 (Major Constructions)', color: '#06b6d4', icon: 'fa-hard-hat', desc: 'Slipway Hangar, Workshop Buildings, Academy Complex, Security Points' },
    '2001': { label: 'Vote 2001 (Renovations)', color: '#f59e0b', icon: 'fa-tools', desc: 'Fences, Marine Home, Wardrooms, Store Yards, Married Quarters, Hospital' },
    '2506': { label: 'Vote 2506 (Maritime & Coastal)', color: '#10b981', icon: 'fa-anchor', desc: 'Guide Pier, Floating Dock, Chlorination Plants, Road Works, Security' },
    '1303': { label: 'Vote 1303 (Station Maintenance)', color: '#8b5cf6', icon: 'fa-wrench', desc: 'Base Maintenance, Water Purification Plants, Annual Upkeep' },
    'NON-NAVAL': { label: 'Non-Naval (Funds & Contractual)', color: '#ec4899', icon: 'fa-handshake', desc: 'Sobar Island Resort, Malima Hospitality, Paper Port Facilities' },
    '2103': { label: 'Vote 2103 (Plant Machinery & EQ)', color: '#3b82f6', icon: 'fa-cogs', desc: 'Capital Machinery, CNC Plasma Cutters, Industrial Plant Equipment' }
  };

  const POSITION_CONFIG = {
    'Processing File': { badgeClass: 'pos-processing', icon: 'fa-file-invoice', label: 'Processing File' },
    'Awaiting Financial Approval': { badgeClass: 'pos-approval', icon: 'fa-stamp', label: 'Awaiting Approval' },
    'Order Placed': { badgeClass: 'pos-order', icon: 'fa-shopping-cart', label: 'Order Placed' },
    'Items Dispatched': { badgeClass: 'pos-dispatched', icon: 'fa-truck', label: 'Items Dispatched' },
    'Items Received': { badgeClass: 'pos-received', icon: 'fa-check-circle', label: 'Items Received' }
  };

  class NavalProjectsModule {
    constructor() {
      this.currentTab = 'projects'; // 'projects' | 'procurement' | 'votes'
      this.selectedVote = 'All';
      this.selectedPosition = 'All';
      this.searchQuery = '';
      this.viewMode = 'grid'; // 'grid' | 'table'
      this.selectedProjectId = null;
    }

    init() {
      // Subscribe to store updates
      if (window.spsStore) {
        window.spsStore.subscribe((event) => {
          if ([
            'NAVAL_PROJECTS_SET', 'NAVAL_PROJECT_ADDED', 'NAVAL_PROJECT_UPDATED', 'NAVAL_PROJECT_DELETED',
            'PROCUREMENT_FILES_SET', 'PROCUREMENT_FILE_ADDED', 'PROCUREMENT_FILE_UPDATED', 'PROCUREMENT_FILE_DELETED',
            'NAVAL_VOTE_CHANGED'
          ].includes(event)) {
            const activeView = document.getElementById('naval-projects-view');
            if (activeView && activeView.classList.contains('active')) {
              this.render();
            }
          }
        });
      }
    }

    // ── Helper: Format Currency ──
    formatLKR(val) {
      const num = Number(val || 0);
      return 'Rs. ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    formatLKRCompact(val) {
      const num = Number(val || 0);
      if (num >= 1000000) return 'Rs. ' + (num / 1000000).toFixed(2) + ' M';
      if (num >= 1000) return 'Rs. ' + (num / 1000).toFixed(1) + ' k';
      return 'Rs. ' + num.toLocaleString('en-US');
    }

    getVoteBadgeHtml(voteNumber) {
      if (!voteNumber) return '<span class="vote-badge vote-generic">General</span>';
      for (const [key, conf] of Object.entries(VOTE_CONFIG)) {
        if (voteNumber.includes(key)) {
          return `<span class="vote-badge" style="background:${conf.color}20; color:${conf.color}; border:1px solid ${conf.color}50;">
            <i class="fas ${conf.icon}" style="margin-right:4px;"></i>${key}
          </span>`;
        }
      }
      return `<span class="vote-badge vote-generic">${voteNumber}</span>`;
    }

    getPositionBadgeHtml(position) {
      const pos = position || 'Processing File';
      const conf = POSITION_CONFIG[pos] || { badgeClass: 'pos-processing', icon: 'fa-circle', label: pos };
      return `<span class="position-badge ${conf.badgeClass}">
        <i class="fas ${conf.icon}"></i> ${pos}
      </span>`;
    }

    // ── Master Render Method ──
    render() {
      const container = document.getElementById('naval-projects-view');
      if (!container) return;

      const stats = window.spsStore.getVoteStatistics();
      const allNaval = window.spsStore.navalProjects;
      const allFiles = window.spsStore.procurementFiles;

      // Calculate position counts
      const posCounts = {
        'Processing File': 0,
        'Awaiting Financial Approval': 0,
        'Order Placed': 0,
        'Items Received': 0
      };
      allFiles.forEach(f => {
        const p = f.presentPosition || 'Processing File';
        if (posCounts[p] !== undefined) posCounts[p]++;
        else posCounts['Processing File']++;
      });

      container.innerHTML = `
        <!-- Naval Projects Top Command Banner -->
        <div class="naval-header-banner">
          <div class="naval-header-content">
            <div class="naval-header-badge">
              <i class="fas fa-anchor"></i> SRI LANKA NAVY CIVIL ENGINEERING
            </div>
            <h2>Naval Projects & Procurement Command Center</h2>
            <p>Capital Engineering Works, Government Votes, Parliamentary Allocations & Real-Time Procurement PR Register</p>
          </div>
          <div class="naval-header-actions">
            <button class="btn btn-primary" onclick="window.navalProjectsModule.openNewNavalProjectModal()">
              <i class="fas fa-plus"></i> New Naval Project
            </button>
            <button class="btn btn-success" onclick="window.navalProjectsModule.openInitiateFileModal()">
              <i class="fas fa-file-invoice-dollar"></i> Initiate PR / File
            </button>
            <button class="btn btn-secondary" onclick="window.navalProjectsModule.exportProcurementCSV()" title="Export PR Register to CSV">
              <i class="fas fa-file-csv"></i> Export CSV
            </button>
          </div>
        </div>

        <!-- Strategic KPI Metrics Bar -->
        <div class="kpi-row" style="margin-bottom: 20px;">
          <div class="kpi-card" style="border-left: 4px solid var(--accent);">
            <div class="kpi-text">
              <label>Naval Projects</label>
              <div class="kpi-val" style="color:var(--accent);">${stats.grandTotalProjects}</div>
              <div class="kpi-sub">Across 6 Vote Headings</div>
            </div>
            <i class="kpi-icon fas fa-ship" style="color:var(--accent);"></i>
          </div>

          <div class="kpi-card" style="border-left: 4px solid #10b981;">
            <div class="kpi-text">
              <label>Total Vote Allocation</label>
              <div class="kpi-val" style="color:#10b981; font-size:1.4rem;">${this.formatLKRCompact(stats.grandTotalAlloc)}</div>
              <div class="kpi-sub">Consolidated Budget</div>
            </div>
            <i class="kpi-icon fas fa-coins" style="color:#10b981;"></i>
          </div>

          <div class="kpi-card" style="border-left: 4px solid #f59e0b;">
            <div class="kpi-text">
              <label>Committed Funds</label>
              <div class="kpi-val" style="color:#f59e0b; font-size:1.4rem;">${this.formatLKRCompact(stats.grandTotalCommitted)}</div>
              <div class="kpi-sub">${stats.grandTotalAlloc > 0 ? ((stats.grandTotalCommitted / stats.grandTotalAlloc) * 100).toFixed(1) : 0}% of Allocation</div>
            </div>
            <i class="kpi-icon fas fa-file-signature" style="color:#f59e0b;"></i>
          </div>

          <div class="kpi-card" style="border-left: 4px solid #3b82f6;">
            <div class="kpi-text">
              <label>Actual Expenditure</label>
              <div class="kpi-val" style="color:#3b82f6; font-size:1.4rem;">${this.formatLKRCompact(stats.grandTotalSpent)}</div>
              <div class="kpi-sub">${stats.grandTotalAlloc > 0 ? ((stats.grandTotalSpent / stats.grandTotalAlloc) * 100).toFixed(1) : 0}% Realized</div>
            </div>
            <i class="kpi-icon fas fa-receipt" style="color:#3b82f6;"></i>
          </div>

          <div class="kpi-card" style="border-left: 4px solid #ec4899;">
            <div class="kpi-text">
              <label>Procurement Files</label>
              <div class="kpi-val" style="color:#ec4899;">${stats.grandTotalFiles}</div>
              <div class="kpi-sub">Active in Pipeline</div>
            </div>
            <i class="kpi-icon fas fa-layer-group" style="color:#ec4899;"></i>
          </div>
        </div>

        <!-- Present Position Quick Summary Bar -->
        <div class="procurement-pipeline-summary">
          <div class="pipeline-step-pill" onclick="window.navalProjectsModule.switchTabAndPosition('procurement', 'Processing File')">
            <span class="pip-dot" style="background:#f59e0b;"></span>
            <span class="pip-label">Processing File:</span>
            <span class="pip-count">${posCounts['Processing File']}</span>
          </div>
          <div class="pipeline-step-pill" onclick="window.navalProjectsModule.switchTabAndPosition('procurement', 'Awaiting Financial Approval')">
            <span class="pip-dot" style="background:#8b5cf6;"></span>
            <span class="pip-label">Awaiting Approval:</span>
            <span class="pip-count">${posCounts['Awaiting Financial Approval']}</span>
          </div>
          <div class="pipeline-step-pill" onclick="window.navalProjectsModule.switchTabAndPosition('procurement', 'Order Placed')">
            <span class="pip-dot" style="background:#3b82f6;"></span>
            <span class="pip-label">Order Placed:</span>
            <span class="pip-count">${posCounts['Order Placed']}</span>
          </div>
          <div class="pipeline-step-pill" onclick="window.navalProjectsModule.switchTabAndPosition('procurement', 'Items Received')">
            <span class="pip-dot" style="background:#10b981;"></span>
            <span class="pip-label">Items Received:</span>
            <span class="pip-count">${posCounts['Items Received']}</span>
          </div>
        </div>

        <!-- Window Sub-Tabs Navigation -->
        <div class="naval-subnav-bar">
          <div class="naval-tabs">
            <button class="naval-tab ${this.currentTab === 'projects' ? 'active' : ''}" onclick="window.navalProjectsModule.setTab('projects')">
              <i class="fas fa-th-large"></i> Naval Projects Directory
              <span class="badge-count">${allNaval.length}</span>
            </button>
            <button class="naval-tab ${this.currentTab === 'procurement' ? 'active' : ''}" onclick="window.navalProjectsModule.setTab('procurement')">
              <i class="fas fa-file-invoice-dollar"></i> Procurement PR Register
              <span class="badge-count">${allFiles.length}</span>
            </button>
            <button class="naval-tab ${this.currentTab === 'votes' ? 'active' : ''}" onclick="window.navalProjectsModule.setTab('votes')">
              <i class="fas fa-chart-pie"></i> Vote Budget Matrix
              <span class="badge-count">6 Votes</span>
            </button>
          </div>

          <!-- Secondary Toolbar: Search & View Switcher -->
          <div class="naval-toolbar">
            <div class="search-input-wrap">
              <i class="fas fa-search"></i>
              <input type="text" id="naval-search-box" value="${this.escapeHtml(this.searchQuery)}" placeholder="Search projects, PR numbers, items, suppliers..." oninput="window.navalProjectsModule.handleSearch(this.value)">
            </div>
            ${this.currentTab === 'projects' ? `
              <div class="view-toggle-btns">
                <button class="btn btn-icon ${this.viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}" onclick="window.navalProjectsModule.setViewMode('grid')" title="Grid View">
                  <i class="fas fa-th"></i>
                </button>
                <button class="btn btn-icon ${this.viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}" onclick="window.navalProjectsModule.setViewMode('table')" title="Table View">
                  <i class="fas fa-list"></i>
                </button>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Dynamic Content Target -->
        <div id="naval-subcontent-target">
          ${this.currentTab === 'projects' ? this.renderProjectsTab() : ''}
          ${this.currentTab === 'procurement' ? this.renderProcurementTab() : ''}
          ${this.currentTab === 'votes' ? this.renderVotesTab() : ''}
        </div>
      `;
    }

    // ── Tab 1: Naval Projects Directory ──
    renderProjectsTab() {
      let projects = window.spsStore.navalProjects;

      // Filter by Vote
      if (this.selectedVote && this.selectedVote !== 'All') {
        projects = window.spsStore.getNavalProjectsByVote(this.selectedVote);
      }

      // Filter by Search Query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        projects = projects.filter(p => 
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.voteNumber && p.voteNumber.toLowerCase().includes(q)) ||
          (p.projectOfficer && p.projectOfficer.toLowerCase().includes(q)) ||
          (p.benefactor && p.benefactor.toLowerCase().includes(q))
        );
      }

      const voteOptions = [
        { id: 'All', label: 'All Votes', count: window.spsStore.navalProjects.length },
        { id: '2104', label: 'Vote 2104 (Major Works)', count: window.spsStore.getNavalProjectsByVote('2104').length },
        { id: '2001', label: 'Vote 2001 (Renovations)', count: window.spsStore.getNavalProjectsByVote('2001').length },
        { id: '2506', label: 'Vote 2506 (Maritime & Pier)', count: window.spsStore.getNavalProjectsByVote('2506').length },
        { id: '1303', label: 'Vote 1303 (Maintenance)', count: window.spsStore.getNavalProjectsByVote('1303').length },
        { id: 'Non-Naval', label: 'Non-Naval Funds', count: window.spsStore.getNavalProjectsByVote('Non-Naval').length },
        { id: '2103', label: 'Vote 2103 (Machinery)', count: window.spsStore.getNavalProjectsByVote('2103').length }
      ];

      let filterPills = `
        <div class="vote-pills-bar">
          ${voteOptions.map(v => `
            <button class="vote-pill ${this.selectedVote === v.id ? 'active' : ''}" onclick="window.navalProjectsModule.filterVote('${v.id}')">
              ${v.label} <span class="pill-count">${v.count}</span>
            </button>
          `).join('')}
        </div>
      `;

      if (projects.length === 0) {
        return `
          ${filterPills}
          <div class="empty-state-box">
            <i class="fas fa-folder-open empty-icon"></i>
            <h3>No Naval Projects Found</h3>
            <p>No project matches your search query or vote selection filter.</p>
            <button class="btn btn-secondary btn-sm" onclick="window.navalProjectsModule.filterVote('All')">Clear Filters</button>
          </div>
        `;
      }

      if (this.viewMode === 'table') {
        return `
          ${filterPills}
          <div class="panel" style="margin-top:16px;">
            <div class="panel-body" style="overflow-x:auto; padding:0;">
              <table class="naval-data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Vote Number</th>
                    <th>Project Name</th>
                    <th>Officer In-Charge</th>
                    <th>Vote Allocation</th>
                    <th>Committed</th>
                    <th>Actual Spent</th>
                    <th>PR Files</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${projects.map(p => {
                    const alloc = Number(p.voteAllocation || 0);
                    const comm = Number(p.committed || 0);
                    const spent = Number(p.actualSpent || 0);
                    const prog = p.progress || Math.min(100, Math.round((spent / (alloc || 1)) * 100));
                    const filesCount = p.files ? p.files.length : (p.filesCount || 0);

                    return `
                      <tr>
                        <td><span class="code-badge">${this.escapeHtml(p.code || p.id)}</span></td>
                        <td>${this.getVoteBadgeHtml(p.voteNumber)}</td>
                        <td>
                          <div class="table-proj-title">${this.escapeHtml(p.name)}</div>
                          <div class="table-proj-sub"><i class="fas fa-map-marker-alt"></i> ${this.escapeHtml(p.benefactor || 'CED East')} &bull; ${this.escapeHtml(p.projectType || 'Civil Works')}</div>
                        </td>
                        <td><i class="fas fa-user-shield text-accent"></i> ${this.escapeHtml(p.projectOfficer || 'Site Incharge')}</td>
                        <td class="font-mono text-emerald font-bold">${this.formatLKR(alloc)}</td>
                        <td class="font-mono text-amber">${this.formatLKR(comm)}</td>
                        <td class="font-mono text-blue">${this.formatLKR(spent)}</td>
                        <td>
                          <button class="badge-button" onclick="window.navalProjectsModule.openProjectDetailsModal('${p.id}')">
                            <i class="fas fa-file-invoice"></i> ${filesCount} Files
                          </button>
                        </td>
                        <td>
                          <div style="display:flex; align-items:center; gap:8px;">
                            <div class="mini-progress-bar">
                              <div class="mini-progress-fill" style="width:${Math.min(100, prog)}%;"></div>
                            </div>
                            <span style="font-size:0.75rem; font-weight:700;">${prog}%</span>
                          </div>
                        </td>
                        <td>
                          <div class="table-actions">
                            <button class="btn btn-icon btn-sm btn-ghost" onclick="window.navalProjectsModule.openProjectDetailsModal('${p.id}')" title="View Full Details">
                              <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-icon btn-sm btn-ghost" onclick="window.navalProjectsModule.openInitiateFileModal('${p.id}')" title="Initiate PR File">
                              <i class="fas fa-plus-circle text-emerald"></i>
                            </button>
                            <button class="btn btn-icon btn-sm btn-ghost" onclick="window.navalProjectsModule.openNewNavalProjectModal('${p.id}')" title="Edit Project">
                              <i class="fas fa-pen"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      }

      // Grid Card View
      return `
        ${filterPills}
        <div class="naval-cards-grid">
          ${projects.map(p => {
            const alloc = Number(p.voteAllocation || 0);
            const comm = Number(p.committed || 0);
            const spent = Number(p.actualSpent || 0);
            const balance = Math.max(0, alloc - (comm + spent));
            const prog = p.progress || Math.min(100, Math.round((spent / (alloc || 1)) * 100));
            const filesCount = p.files ? p.files.length : (p.filesCount || 0);

            return `
              <div class="naval-project-card" onclick="window.navalProjectsModule.openProjectDetailsModal('${p.id}')">
                <div class="npc-header">
                  <div class="npc-badges">
                    <span class="code-badge">${this.escapeHtml(p.code || p.id)}</span>
                    ${this.getVoteBadgeHtml(p.voteNumber)}
                  </div>
                  <span class="status-pill status-${(p.status || 'Active').toLowerCase().replace(' ', '')}">
                    ${this.escapeHtml(p.status || 'Active')}
                  </span>
                </div>

                <h3 class="npc-title" title="${this.escapeHtml(p.name)}">${this.escapeHtml(p.name)}</h3>

                <div class="npc-meta">
                  <div class="npc-meta-item">
                    <i class="fas fa-user-shield"></i>
                    <span>${this.escapeHtml(p.projectOfficer || 'Officer Incharge')}</span>
                  </div>
                  <div class="npc-meta-item">
                    <i class="fas fa-building"></i>
                    <span>${this.escapeHtml(p.benefactor || 'Civil Works Dept')}</span>
                  </div>
                  <div class="npc-meta-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${p.startDate || '2025'} &rarr; ${p.endDate || '2026'}</span>
                  </div>
                </div>

                <!-- Financial Burn-down Bar -->
                <div class="npc-financials">
                  <div class="npc-fin-row">
                    <span class="fin-label">Vote Allocation</span>
                    <span class="fin-val font-mono text-emerald">${this.formatLKR(alloc)}</span>
                  </div>
                  <div class="npc-fin-bars">
                    <div class="bar-segment bar-spent" style="width:${alloc > 0 ? (spent/alloc)*100 : 0}%;" title="Spent: ${this.formatLKR(spent)}"></div>
                    <div class="bar-segment bar-committed" style="width:${alloc > 0 ? (comm/alloc)*100 : 0}%;" title="Committed: ${this.formatLKR(comm)}"></div>
                  </div>
                  <div class="npc-fin-sub">
                    <span><i class="fas fa-check-circle text-blue"></i> Spent: ${this.formatLKRCompact(spent)}</span>
                    <span><i class="fas fa-clock text-amber"></i> Committed: ${this.formatLKRCompact(comm)}</span>
                    <span><i class="fas fa-wallet text-muted"></i> Bal: ${this.formatLKRCompact(balance)}</span>
                  </div>
                </div>

                <!-- Footer with Procurement Files count & Progress -->
                <div class="npc-footer">
                  <div class="npc-procurement-tag">
                    <i class="fas fa-file-invoice"></i> <strong>${filesCount}</strong> PR Files Linked
                  </div>
                  <div class="npc-progress-badge">
                    <span>${prog}%</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // ── Tab 2: Master Procurement PR Register ──
    renderProcurementTab() {
      let files = window.spsStore.procurementFiles;

      // Filter by Position
      if (this.selectedPosition && this.selectedPosition !== 'All') {
        files = files.filter(f => f.presentPosition === this.selectedPosition);
      }

      // Filter by Vote
      if (this.selectedVote && this.selectedVote !== 'All') {
        files = files.filter(f => {
          if (!f.voteNumber) return false;
          if (this.selectedVote === 'Non-Naval') return f.voteNumber.includes('NON-NAVAL');
          return f.voteNumber.includes(this.selectedVote);
        });
      }

      // Search Query
      if (this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase();
        files = files.filter(f => 
          (f.prNumber && f.prNumber.toLowerCase().includes(q)) ||
          (f.itemCode && f.itemCode.toLowerCase().includes(q)) ||
          (f.itemName && f.itemName.toLowerCase().includes(q)) ||
          (f.supplier && f.supplier.toLowerCase().includes(q)) ||
          (f.projectName && f.projectName.toLowerCase().includes(q)) ||
          (f.projectCode && f.projectCode.toLowerCase().includes(q))
        );
      }

      const totalValue = files.reduce((sum, f) => sum + Number(f.fileCost || 0), 0);

      const posPills = [
        { id: 'All', label: 'All Positions', count: window.spsStore.procurementFiles.length },
        { id: 'Processing File', label: 'Processing File', count: window.spsStore.procurementFiles.filter(f => f.presentPosition === 'Processing File').length },
        { id: 'Awaiting Financial Approval', label: 'Awaiting Approval', count: window.spsStore.procurementFiles.filter(f => f.presentPosition === 'Awaiting Financial Approval').length },
        { id: 'Order Placed', label: 'Order Placed', count: window.spsStore.procurementFiles.filter(f => f.presentPosition === 'Order Placed').length },
        { id: 'Items Received', label: 'Items Received', count: window.spsStore.procurementFiles.filter(f => f.presentPosition === 'Items Received').length }
      ];

      return `
        <div class="procurement-toolbar-box">
          <div class="pos-pills-bar">
            ${posPills.map(p => `
              <button class="pos-pill ${this.selectedPosition === p.id ? 'active' : ''}" onclick="window.navalProjectsModule.filterPosition('${p.id}')">
                ${p.label} <span class="pill-count">${p.count}</span>
              </button>
            `).join('')}
          </div>
          <div class="procurement-summary-chip">
            <span>Filtered Total:</span>
            <strong class="font-mono text-emerald">${this.formatLKR(totalValue)}</strong>
            <span style="color:var(--text-dim);">(${files.length} PRs)</span>
          </div>
        </div>

        ${files.length === 0 ? `
          <div class="empty-state-box">
            <i class="fas fa-file-invoice empty-icon"></i>
            <h3>No Procurement Files Found</h3>
            <p>No procurement action matches the selected filter.</p>
            <button class="btn btn-secondary btn-sm" onclick="window.navalProjectsModule.filterPosition('All')">Show All Files</button>
          </div>
        ` : `
          <div class="panel" style="margin-top:16px;">
            <div class="panel-body" style="overflow-x:auto; padding:0;">
              <table class="naval-data-table">
                <thead>
                  <tr>
                    <th>PR Number</th>
                    <th>Project</th>
                    <th>Item Code & Description</th>
                    <th>Qty / Unit</th>
                    <th>Unit Price</th>
                    <th>File Cost with Tax</th>
                    <th>Supplier</th>
                    <th>Present Position</th>
                    <th>Authorized Officer</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${files.map(f => `
                    <tr>
                      <td>
                        <span class="pr-badge">${this.escapeHtml(f.prNumber)}</span>
                        ${f.date ? `<div style="font-size:0.65rem; color:var(--text-dim); margin-top:2px;">${f.date}</div>` : ''}
                      </td>
                      <td>
                        <div class="table-proj-title" style="font-size:0.8rem;">${this.escapeHtml(f.projectName || f.projectId)}</div>
                        <span class="code-badge" style="font-size:0.65rem;">${this.escapeHtml(f.projectCode || f.projectId)}</span>
                      </td>
                      <td>
                        <div class="item-name-text">${this.escapeHtml(f.itemName)}</div>
                        <div class="item-code-text">${this.escapeHtml(f.itemCode)}</div>
                      </td>
                      <td class="font-mono" style="font-weight:600;">${f.qty} ${this.escapeHtml(f.unit || "No's")}</td>
                      <td class="font-mono text-muted" style="font-size:0.8rem;">${this.formatLKR(f.unitPrice)}</td>
                      <td class="font-mono text-emerald font-bold">${this.formatLKR(f.fileCost)}</td>
                      <td>
                        <span class="supplier-pill"><i class="fas fa-truck-loading" style="font-size:0.7rem;"></i> ${this.escapeHtml(f.supplier || 'Naval Stores')}</span>
                      </td>
                      <td>
                        <div style="cursor:pointer;" onclick="window.navalProjectsModule.openUpdatePositionModal('${f.id}')" title="Click to update position">
                          ${this.getPositionBadgeHtml(f.presentPosition)}
                        </div>
                      </td>
                      <td style="font-size:0.78rem;">
                        <i class="fas fa-user-shield text-accent"></i> ${this.escapeHtml(f.authorizedBy || 'OIC')}
                      </td>
                      <td>
                        <div class="table-actions">
                          <button class="btn btn-icon btn-sm btn-primary" onclick="window.navalProjectsModule.openUpdatePositionModal('${f.id}')" title="Update Procurement Stage">
                            <i class="fas fa-exchange-alt"></i>
                          </button>
                          <button class="btn btn-icon btn-sm btn-danger" onclick="window.navalProjectsModule.deleteFile('${f.id}')" title="Delete PR File">
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `}
      `;
    }

    // ── Tab 3: Vote Budget Allocation Matrix ──
    renderVotesTab() {
      const stats = window.spsStore.getVoteStatistics();

      return `
        <div class="vote-matrix-container">
          <div class="vote-matrix-grid">
            ${stats.breakdown.map(v => `
              <div class="vote-card" style="border-top: 4px solid ${v.color};">
                <div class="vc-header">
                  <div>
                    <h3 class="vc-title">${this.escapeHtml(v.label)}</h3>
                    <p class="vc-desc">${this.escapeHtml(VOTE_CONFIG[v.id] ? VOTE_CONFIG[v.id].desc : 'Budget Vote Category')}</p>
                  </div>
                  <span class="vote-badge" style="background:${v.color}20; color:${v.color}; border:1px solid ${v.color}50; font-size:0.85rem;">
                    ${v.count} Projects
                  </span>
                </div>

                <div class="vc-metrics-row">
                  <div class="vc-metric">
                    <label>Vote Allocation</label>
                    <div class="val text-emerald font-mono font-bold">${this.formatLKR(v.allocation)}</div>
                  </div>
                  <div class="vc-metric">
                    <label>Committed</label>
                    <div class="val text-amber font-mono">${this.formatLKR(v.committed)}</div>
                  </div>
                  <div class="vc-metric">
                    <label>Actual Spent</label>
                    <div class="val text-blue font-mono">${this.formatLKR(v.spent)}</div>
                  </div>
                  <div class="vc-metric">
                    <label>Uncommitted Balance</label>
                    <div class="val text-muted font-mono">${this.formatLKR(v.balance)}</div>
                  </div>
                </div>

                <!-- Tri-Color Progress Burn-Down -->
                <div class="vc-progress-wrap">
                  <div class="vc-progress-labels">
                    <span>Burn-Down Utilization</span>
                    <span><strong>${v.percentCommitted}%</strong> Committed &bull; <strong>${v.percentSpent}%</strong> Spent</span>
                  </div>
                  <div class="vc-progress-bar">
                    <div class="bar-fill-spent" style="width:${Math.min(100, Number(v.percentSpent))}%;" title="Spent: ${this.formatLKR(v.spent)}"></div>
                    <div class="bar-fill-comm" style="width:${Math.min(100 - Number(v.percentSpent), Number(v.percentCommitted))}%;" title="Committed: ${this.formatLKR(v.committed)}"></div>
                  </div>
                </div>

                <div class="vc-footer">
                  <span><i class="fas fa-layer-group text-accent"></i> ${v.fileCount} PR Procurement Files</span>
                  <button class="btn btn-ghost btn-sm" onclick="window.navalProjectsModule.filterVote('${v.match}'); window.navalProjectsModule.setTab('projects');">
                    View ${v.count} Projects <i class="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // ── Interactive Actions & Tab Switchers ──
    setTab(tab) {
      this.currentTab = tab;
      this.render();
    }

    setViewMode(mode) {
      this.viewMode = mode;
      this.render();
    }

    filterVote(vote) {
      this.selectedVote = vote;
      this.render();
    }

    filterPosition(pos) {
      this.selectedPosition = pos;
      this.render();
    }

    handleSearch(val, immediate = false) {
      this.searchQuery = val;
      const doSearch = () => {
        const target = document.getElementById('naval-subcontent-target');
        if (target) {
          if (this.currentTab === 'projects') target.innerHTML = this.renderProjectsTab();
          else if (this.currentTab === 'procurement') target.innerHTML = this.renderProcurementTab();
          else if (this.currentTab === 'votes') target.innerHTML = this.renderVotesTab();
        }
      };
      if (immediate) {
        clearTimeout(this._searchDebounce);
        doSearch();
        return;
      }
      clearTimeout(this._searchDebounce);
      this._searchDebounce = setTimeout(doSearch, 150);
    }

    switchTabAndPosition(tab, position) {
      this.currentTab = tab;
      this.selectedPosition = position;
      this.render();
    }

    // ── Modal: Comprehensive Naval Project Details ──
    openProjectDetailsModal(projectId) {
      const proj = window.spsStore.getNavalProject(projectId);
      if (!proj) return;

      const overlay = document.getElementById('generic-modal-overlay');
      if (!overlay) return;

      const alloc = Number(proj.voteAllocation || 0);
      const comm = Number(proj.committed || 0);
      const spent = Number(proj.actualSpent || 0);
      const balance = Math.max(0, alloc - (comm + spent));
      const files = proj.files || window.spsStore.getProcurementFilesByProject(proj.id);

      overlay.innerHTML = `
        <div class="modal-dialog modal-lg">
          <div class="modal-header">
            <div>
              <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                <span class="code-badge" style="font-size:0.85rem;">${this.escapeHtml(proj.code || proj.id)}</span>
                ${this.getVoteBadgeHtml(proj.voteNumber)}
                <span class="status-pill status-${(proj.status || 'Active').toLowerCase()}">${this.escapeHtml(proj.status || 'Active')}</span>
              </div>
              <h2 style="font-size:1.2rem; font-weight:800; color:var(--text-primary);">${this.escapeHtml(proj.name)}</h2>
            </div>
            <button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">&times;</button>
          </div>

          <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
            <!-- Key Financials Banner -->
            <div class="project-modal-kpis">
              <div class="pm-kpi">
                <label>Vote Allocation</label>
                <div class="val text-emerald font-mono">${this.formatLKR(alloc)}</div>
              </div>
              <div class="pm-kpi">
                <label>Committed Amount</label>
                <div class="val text-amber font-mono">${this.formatLKR(comm)}</div>
              </div>
              <div class="pm-kpi">
                <label>Actual Expenditure</label>
                <div class="val text-blue font-mono">${this.formatLKR(spent)}</div>
              </div>
              <div class="pm-kpi">
                <label>Remaining Balance</label>
                <div class="val text-muted font-mono">${this.formatLKR(balance)}</div>
              </div>
            </div>

            <!-- Scope & Metadata -->
            <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-md); padding:16px; margin-bottom:20px;">
              <h4 style="font-size:0.85rem; text-transform:uppercase; color:var(--accent); letter-spacing:0.05em; margin-bottom:8px;">
                <i class="fas fa-info-circle"></i> Project Scope & Command Directives
              </h4>
              <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.6;">
                ${this.escapeHtml(proj.workScope || proj.description || 'Full scope of Naval Civil Engineering works and dockyard infrastructure enhancements under Commander Eastern Naval Command.')}
              </p>
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-top:12px; font-size:0.8rem; border-top:1px solid var(--border); padding-top:12px;">
                <div><strong style="color:var(--text-dim);">Project Officer:</strong> ${this.escapeHtml(proj.projectOfficer || 'Site Incharge')}</div>
                <div><strong style="color:var(--text-dim);">Benefactor / Dept:</strong> ${this.escapeHtml(proj.benefactor || 'Civil Works Dept')}</div>
                <div><strong style="color:var(--text-dim);">Financial Mean:</strong> ${this.escapeHtml(proj.financialMean || 'Vote')}</div>
                <div><strong style="color:var(--text-dim);">Timeline:</strong> ${proj.startDate || '2025'} to ${proj.endDate || '2026'}</div>
              </div>
            </div>

            <!-- Procurement Files Linked to this Project -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-primary);">
                <i class="fas fa-file-invoice text-emerald"></i> Procurement PR Register (${files.length} Items)
              </h4>
              <button class="btn btn-primary btn-sm" onclick="window.navalProjectsModule.openInitiateFileModal('${proj.id}')">
                <i class="fas fa-plus"></i> Initiate New PR
              </button>
            </div>

            ${files.length === 0 ? `
              <div style="background:rgba(255,255,255,0.02); border:1px dashed var(--border); border-radius:var(--radius-md); padding:24px; text-align:center;">
                <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:8px;">No procurement files initiated for this project yet.</p>
                <button class="btn btn-primary btn-sm" onclick="window.navalProjectsModule.openInitiateFileModal('${proj.id}')">
                  Initiate First PR File
                </button>
              </div>
            ` : `
              <div style="overflow-x:auto; border:1px solid var(--border); border-radius:var(--radius-md);">
                <table class="naval-data-table" style="font-size:0.8rem;">
                  <thead>
                    <tr>
                      <th>PR Number</th>
                      <th>Item Specification</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>File Cost</th>
                      <th>Supplier</th>
                      <th>Present Position</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${files.map(f => `
                      <tr>
                        <td><span class="pr-badge">${this.escapeHtml(f.prNumber)}</span></td>
                        <td>
                          <div class="item-name-text">${this.escapeHtml(f.itemName)}</div>
                          <div class="item-code-text">${this.escapeHtml(f.itemCode)}</div>
                        </td>
                        <td class="font-mono">${f.qty} ${this.escapeHtml(f.unit || "No's")}</td>
                        <td class="font-mono">${this.formatLKR(f.unitPrice)}</td>
                        <td class="font-mono text-emerald font-bold">${this.formatLKR(f.fileCost)}</td>
                        <td style="font-size:0.75rem;">${this.escapeHtml(f.supplier || 'Naval Stores')}</td>
                        <td>
                          <div style="cursor:pointer;" onclick="window.navalProjectsModule.openUpdatePositionModal('${f.id}')">
                            ${this.getPositionBadgeHtml(f.presentPosition)}
                          </div>
                        </td>
                        <td>
                          <button class="btn btn-icon btn-sm btn-ghost" onclick="window.navalProjectsModule.openUpdatePositionModal('${f.id}')" title="Update Position">
                            <i class="fas fa-exchange-alt"></i>
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Close</button>
            <button class="btn btn-primary" onclick="window.navalProjectsModule.openNewNavalProjectModal('${proj.id}')">
              <i class="fas fa-pen"></i> Edit Project
            </button>
          </div>
        </div>
      `;
      overlay.classList.add('open');
    }

    // ── Modal: Add / Edit Naval Project ──
    openNewNavalProjectModal(projectId) {
      const isEdit = Boolean(projectId);
      const proj = isEdit ? window.spsStore.getNavalProject(projectId) : {};

      const overlay = document.getElementById('generic-modal-overlay');
      if (!overlay) return;

      overlay.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3><i class="fas fa-ship text-accent"></i> ${isEdit ? 'Edit Naval Project' : 'New Naval Project Registration'}</h3>
            <button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">&times;</button>
          </div>
          <form id="naval-project-form" onsubmit="window.navalProjectsModule.handleSaveProject(event, '${projectId || ''}')">
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
              <div class="form-group">
                <label>Project Title *</label>
                <input type="text" name="name" class="form-control" required value="${this.escapeHtml(proj.name || '')}" placeholder="e.g. CONSTRUCTION OF NO.03 SLIPWAY HANGAR">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Abbreviation / Code *</label>
                  <input type="text" name="code" class="form-control" required value="${this.escapeHtml(proj.code || proj.nameAbbreviation || '')}" placeholder="e.g. NSH, EFS, SGP">
                </div>
                <div class="form-group">
                  <label>Vote Number *</label>
                  <select name="voteNumber" class="form-control" required>
                    <option value="VOTE 223-1-01-2104" ${proj.voteNumber === 'VOTE 223-1-01-2104' ? 'selected' : ''}>VOTE 223-1-01-2104 (Major Constructions)</option>
                    <option value="VOTE 223-1-01-2001" ${proj.voteNumber === 'VOTE 223-1-01-2001' ? 'selected' : ''}>VOTE 223-1-01-2001 (Renovations)</option>
                    <option value="VOTE 223-1-01-2506" ${proj.voteNumber === 'VOTE 223-1-01-2506' ? 'selected' : ''}>VOTE 223-1-01-2506 (Coastal & Pier Works)</option>
                    <option value="VOTE 223-1-01-1303" ${proj.voteNumber === 'VOTE 223-1-01-1303' ? 'selected' : ''}>VOTE 223-1-01-1303 (Maintenance Works)</option>
                    <option value="NON-NAVAL" ${proj.voteNumber === 'NON-NAVAL' ? 'selected' : ''}>NON-NAVAL (Non-Public / Contractual)</option>
                    <option value="VOTE 223-1-01-2103" ${proj.voteNumber === 'VOTE 223-1-01-2103' ? 'selected' : ''}>VOTE 223-1-01-2103 (Machinery Acquisition)</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Vote Allocation (Rs.) *</label>
                  <input type="number" step="0.01" name="voteAllocation" class="form-control" required value="${proj.voteAllocation || 0}">
                </div>
                <div class="form-group">
                  <label>Committed Amount (Rs.)</label>
                  <input type="number" step="0.01" name="committed" class="form-control" value="${proj.committed || 0}">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Actual Spent (Rs.)</label>
                  <input type="number" step="0.01" name="actualSpent" class="form-control" value="${proj.actualSpent || 0}">
                </div>
                <div class="form-group">
                  <label>Project Officer *</label>
                  <input type="text" name="projectOfficer" class="form-control" required value="${this.escapeHtml(proj.projectOfficer || 'Cdr. R. Perera')}" placeholder="Rank & Name">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Benefactor / Department</label>
                  <input type="text" name="benefactor" class="form-control" value="${this.escapeHtml(proj.benefactor || 'Civil Works Dept')}">
                </div>
                <div class="form-group">
                  <label>Project Type</label>
                  <select name="projectType" class="form-control">
                    <option value="New Construction" ${proj.projectType === 'New Construction' ? 'selected' : ''}>New Construction</option>
                    <option value="Renovation" ${proj.projectType === 'Renovation' ? 'selected' : ''}>Renovation</option>
                    <option value="Maintenance" ${proj.projectType === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
                    <option value="General Requirement" ${proj.projectType === 'General Requirement' ? 'selected' : ''}>General Requirement</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Start Date</label>
                  <input type="date" name="startDate" class="form-control" value="${proj.startDate || '2025-01-15'}">
                </div>
                <div class="form-group">
                  <label>End Date</label>
                  <input type="date" name="endDate" class="form-control" value="${proj.endDate || '2025-12-31'}">
                </div>
              </div>

              <div class="form-group">
                <label>Scope of Works & Directive</label>
                <textarea name="workScope" class="form-control" rows="3" placeholder="Technical specifications, structural design, materials...">${this.escapeHtml(proj.workScope || proj.description || '')}</textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
              <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Project</button>
            </div>
          </form>
        </div>
      `;
      overlay.classList.add('open');
    }

    handleSaveProject(e, projectId) {
      e.preventDefault();
      const form = e.target;
      const data = {
        name: form.name.value.trim(),
        code: form.code.value.trim(),
        voteNumber: form.voteNumber.value,
        voteAllocation: parseFloat(form.voteAllocation.value) || 0,
        committed: parseFloat(form.committed.value) || 0,
        actualSpent: parseFloat(form.actualSpent.value) || 0,
        projectOfficer: form.projectOfficer.value.trim(),
        benefactor: form.benefactor.value.trim(),
        projectType: form.projectType.value,
        startDate: form.startDate.value,
        endDate: form.endDate.value,
        workScope: form.workScope.value.trim()
      };

      if (projectId) {
        window.spsStore.updateNavalProject(projectId, data);
        window.app.toast('Naval project updated successfully', 'success');
      } else {
        window.spsStore.addNavalProject(data);
        window.app.toast('New Naval project created successfully', 'success');
      }

      document.getElementById('generic-modal-overlay').classList.remove('open');
      this.render();
    }

    // ── Modal: Initiate PR / Procurement File ──
    openInitiateFileModal(defaultProjectId) {
      const projects = window.spsStore.navalProjects;
      const overlay = document.getElementById('generic-modal-overlay');
      if (!overlay) return;

      const randomSerial = String(Math.floor(Math.random() * 900) + 100);
      const defaultPr = `ENA/CEWS/PR/2026/0${randomSerial}`;
      const defaultCode = `ENA/APOE/RCFO/ENG/2026/1${randomSerial}`;

      overlay.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-header">
            <h3><i class="fas fa-file-invoice-dollar text-emerald"></i> Initiate Procurement PR File</h3>
            <button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">&times;</button>
          </div>
          <form id="initiate-pr-form" onsubmit="window.navalProjectsModule.handleSaveInitiateFile(event)">
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
              <div class="form-group">
                <label>Target Naval Project *</label>
                <select name="projectId" class="form-control" required onchange="window.navalProjectsModule.handleProjectSelectChange(this)">
                  <option value="">-- Select Project --</option>
                  ${projects.map(p => `
                    <option value="${p.id}" ${p.id === defaultProjectId ? 'selected' : ''}>
                      [${this.escapeHtml(p.code || p.id)}] ${this.escapeHtml(p.name.substring(0, 50))} (${this.escapeHtml(p.voteNumber)})
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>PR Number *</label>
                  <input type="text" name="prNumber" class="form-control font-mono" required value="${defaultPr}" placeholder="e.g. ENA/CEWS/NSGORF/2026/0531">
                </div>
                <div class="form-group">
                  <label>Item Code *</label>
                  <input type="text" name="itemCode" class="form-control font-mono" required value="${defaultCode}" placeholder="e.g. ENA/APOE/RCFO/ENG/2026/1278">
                </div>
              </div>

              <div class="form-group">
                <label>Item Name & Detailed Specification *</label>
                <input type="text" name="itemName" class="form-control" required placeholder="e.g. ANGLE IRON MILD STEEL EQUAL 65MM X 63MM X 6MM (5.8M)">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Quantity *</label>
                  <input type="number" step="0.01" name="qty" id="pr-qty-input" class="form-control" required value="1" oninput="window.navalProjectsModule.recalcFileCost()">
                </div>
                <div class="form-group">
                  <label>Unit of Measure *</label>
                  <select name="unit" class="form-control">
                    <option value="No's">No's</option>
                    <option value="Cube">Cube</option>
                    <option value="LFT">LFT (Linear Feet)</option>
                    <option value="Sqm">Sqm (Square Meters)</option>
                    <option value="Cu.m">Cu.m (Cubic Meters)</option>
                    <option value="Set">Set</option>
                    <option value="Roll">Roll</option>
                    <option value="Kg">Kg</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Unit Price (Rs.) *</label>
                  <input type="number" step="0.01" name="unitPrice" id="pr-price-input" class="form-control" required value="0" oninput="window.navalProjectsModule.recalcFileCost()">
                </div>
                <div class="form-group">
                  <label>Computed Total File Cost with Tax (Rs.)</label>
                  <input type="number" step="0.01" name="fileCost" id="pr-cost-input" class="form-control font-mono font-bold text-emerald" readonly value="0">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Supplier / Vendor *</label>
                  <input type="text" name="supplier" class="form-control" required placeholder="e.g. AARA LANKA PVT LTD / M/S BEN Vision">
                </div>
                <div class="form-group">
                  <label>Present Position Stage *</label>
                  <select name="presentPosition" class="form-control" required>
                    <option value="Processing File">Processing File</option>
                    <option value="Awaiting Financial Approval">Awaiting Financial Approval</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="Items Dispatched">Items Dispatched</option>
                    <option value="Items Received">Items Received</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Authorized By (Officer)</label>
                  <input type="text" name="authorizedBy" class="form-control" value="Cdr. R. Perera">
                </div>
                <div class="form-group">
                  <label>Created By (Sailor)</label>
                  <input type="text" name="createdBy" class="form-control" value="PO1 R. Jayasena">
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
              <button type="submit" class="btn btn-primary"><i class="fas fa-check"></i> Initiate File</button>
            </div>
          </form>
        </div>
      `;
      overlay.classList.add('open');
    }

    recalcFileCost() {
      const q = parseFloat(document.getElementById('pr-qty-input')?.value || 0);
      const p = parseFloat(document.getElementById('pr-price-input')?.value || 0);
      const c = document.getElementById('pr-cost-input');
      if (c) c.value = (q * p).toFixed(2);
    }

    handleProjectSelectChange(sel) {
      // Auto-populate officer if available
      const pId = sel.value;
      const proj = window.spsStore.getNavalProject(pId);
      if (proj && proj.projectOfficer) {
        const authInput = document.querySelector('#initiate-pr-form input[name="authorizedBy"]');
        if (authInput) authInput.value = proj.projectOfficer;
      }
    }

    handleSaveInitiateFile(e) {
      e.preventDefault();
      const form = e.target;
      const projId = form.projectId.value;
      const proj = window.spsStore.getNavalProject(projId);

      const qty = parseFloat(form.qty.value) || 0;
      const unitPrice = parseFloat(form.unitPrice.value) || 0;
      const fileCost = parseFloat(form.fileCost.value) || (qty * unitPrice);

      const fileObj = {
        projectId: projId,
        projectCode: proj ? (proj.code || proj.id) : '',
        projectName: proj ? proj.name : '',
        voteNumber: proj ? proj.voteNumber : 'VOTE 2104',
        prNumber: form.prNumber.value.trim(),
        itemCode: form.itemCode.value.trim(),
        itemName: form.itemName.value.trim(),
        unit: form.unit.value,
        qty,
        unitPrice,
        fileCost,
        supplier: form.supplier.value.trim(),
        presentPosition: form.presentPosition.value,
        authorizedBy: form.authorizedBy.value.trim(),
        createdBy: form.createdBy.value.trim(),
        date: new Date().toISOString().split('T')[0]
      };

      window.spsStore.addProcurementFile(fileObj);
      window.app.toast(`PR File ${fileObj.prNumber} initiated successfully`, 'success');
      document.getElementById('generic-modal-overlay').classList.remove('open');
      this.render();
    }

    // ── Modal: Update Procurement Position ──
    openUpdatePositionModal(fileId) {
      const file = window.spsStore.procurementFiles.find(f => f.id === fileId);
      if (!file) return;

      const overlay = document.getElementById('generic-modal-overlay');
      if (!overlay) return;

      overlay.innerHTML = `
        <div class="modal-dialog modal-sm">
          <div class="modal-header">
            <h3><i class="fas fa-exchange-alt text-accent"></i> Update Procurement Stage</h3>
            <button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">&times;</button>
          </div>
          <form onsubmit="window.navalProjectsModule.handleSavePositionUpdate(event, '${file.id}')">
            <div class="modal-body">
              <div style="background:var(--bg-card); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px; margin-bottom:14px; font-size:0.8rem;">
                <div><strong style="color:var(--text-dim);">PR Number:</strong> <span class="font-mono">${this.escapeHtml(file.prNumber)}</span></div>
                <div style="margin-top:2px;"><strong style="color:var(--text-dim);">Item:</strong> ${this.escapeHtml(file.itemName)}</div>
                <div style="margin-top:2px;"><strong style="color:var(--text-dim);">Current Stage:</strong> ${this.getPositionBadgeHtml(file.presentPosition)}</div>
              </div>

              <div class="form-group">
                <label>New Procurement Position Stage *</label>
                <select name="presentPosition" class="form-control" required>
                  <option value="Processing File" ${file.presentPosition === 'Processing File' ? 'selected' : ''}>Processing File</option>
                  <option value="Awaiting Financial Approval" ${file.presentPosition === 'Awaiting Financial Approval' ? 'selected' : ''}>Awaiting Financial Approval</option>
                  <option value="Order Placed" ${file.presentPosition === 'Order Placed' ? 'selected' : ''}>Order Placed</option>
                  <option value="Items Dispatched" ${file.presentPosition === 'Items Dispatched' ? 'selected' : ''}>Items Dispatched</option>
                  <option value="Items Received" ${file.presentPosition === 'Items Received' ? 'selected' : ''}>Items Received</option>
                </select>
              </div>

              <div class="form-group">
                <label>Remarks / Action Notes</label>
                <textarea name="remarks" class="form-control" rows="2" placeholder="e.g. Signal reference, PO issued, QC pass..."></textarea>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
              <button type="submit" class="btn btn-primary"><i class="fas fa-check"></i> Update Stage</button>
            </div>
          </form>
        </div>
      `;
      overlay.classList.add('open');
    }

    handleSavePositionUpdate(e, fileId) {
      e.preventDefault();
      const pos = e.target.presentPosition.value;
      window.spsStore.updateProcurementFile(fileId, {
        presentPosition: pos,
        lastUpdated: new Date().toISOString()
      });

      window.app.toast(`Procurement position updated to "${pos}"`, 'success');
      document.getElementById('generic-modal-overlay').classList.remove('open');
      this.render();
    }

    deleteFile(fileId) {
      if (confirm('Are you sure you want to remove this procurement file?')) {
        window.spsStore.deleteProcurementFile(fileId);
        window.app.toast('Procurement file removed', 'warning');
        this.render();
      }
    }

    // ── Export Procurement Register to CSV ──
    exportProcurementCSV() {
      const files = window.spsStore.procurementFiles;
      if (files.length === 0) {
        window.app.toast('No procurement files to export', 'warning');
        return;
      }

      const headers = ['SR NO', 'PR NUMBER', 'PROJECT CODE', 'PROJECT NAME', 'VOTE NUMBER', 'ITEM CODE', 'ITEM NAME', 'UNIT', 'QTY', 'UNIT PRICE', 'FILE COST WITH TAX', 'PRESENT POSITION', 'SUPPLIER', 'AUTHORIZED BY', 'DATE'];
      const rows = files.map((f, i) => [
        i + 1,
        `"${(f.prNumber || '').replace(/"/g, '""')}"`,
        `"${(f.projectCode || f.projectId || '').replace(/"/g, '""')}"`,
        `"${(f.projectName || '').replace(/"/g, '""')}"`,
        `"${(f.voteNumber || '').replace(/"/g, '""')}"`,
        `"${(f.itemCode || '').replace(/"/g, '""')}"`,
        `"${(f.itemName || '').replace(/"/g, '""')}"`,
        `"${(f.unit || '').replace(/"/g, '""')}"`,
        f.qty || 0,
        f.unitPrice || 0,
        f.fileCost || 0,
        `"${(f.presentPosition || '').replace(/"/g, '""')}"`,
        `"${(f.supplier || '').replace(/"/g, '""')}"`,
        `"${(f.authorizedBy || '').replace(/"/g, '""')}"`,
        `"${(f.date || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SLN_Procurement_Register_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.app.toast('Procurement Register exported as CSV', 'success');
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

  window.navalProjectsModule = new NavalProjectsModule();
  window.navalProjectsModule.init();
})();
