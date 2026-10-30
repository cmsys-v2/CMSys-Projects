// ============================================================
// SPS — Project Detail Module
// Popup modal with full project information:
// Overview, Work Scope, Labour Log, Job Cards, Documents,
// Media & Drive Links, Weather Logs, Admin Edit Mode
// ============================================================
(function() {
  'use strict';

  const CAT_ICONS = {
    'Religious': 'fa-place-of-worship',
    'Clean Sri Lanka': 'fa-leaf',
    'Housing': 'fa-home',
    'Miscellaneous': 'fa-folder'
  };

  const CAT_CLASS = {
    'Religious': 'religious',
    'Clean Sri Lanka': 'csl',
    'Housing': 'housing',
    'Miscellaneous': 'misc'
  };

  class ProjectDetailModule {
    constructor() {
      this.currentProjectId = null;
      this.isEditMode = false;
    }

    openProject(projectId) {
      this.currentProjectId = projectId;
      this.isEditMode = false;
      const p = window.spsStore.getProject(projectId);
      if (!p) return;

      const attachments = window.spsStore.getAttachmentsByProject(projectId);
      const jobCards    = window.spsStore.getJobCardsByProject(projectId);
      const docs        = window.spsStore.getDocumentsByProject(projectId);
      const weatherLogs = window.spsStore.getWeatherLogsByProject(projectId);

      const catCls  = CAT_CLASS[p.category]  || 'misc';
      const catIcon = CAT_ICONS[p.category] || 'fa-folder';

      const endD = p.end_date ? new Date(p.end_date) : null;
      const isValidEnd = endD && !isNaN(endD.getTime());
      const daysRemaining = isValidEnd ? Math.ceil((endD - new Date()) / 86400000) : null;
      const daysStr = daysRemaining !== null 
        ? (daysRemaining > 0 ? `${daysRemaining} days remaining` : (daysRemaining === 0 ? 'Last day!' : 'OVERDUE'))
        : 'Ongoing';
      const daysColor = daysRemaining === null ? 'var(--accent)' : (daysRemaining < 0 ? 'var(--danger)' : daysRemaining < 14 ? 'var(--warning)' : 'var(--success)');

      const totalLabDays = attachments.reduce((sum, a) => sum + (a.days_attached || 0), 0);
      const totalJobCost = jobCards.reduce((sum, j) => sum + (parseFloat(j.material_cost) || 0), 0);

      const isAdmin = window.spsStore.isAdmin();

      const overlay = document.getElementById('project-detail-overlay');
      overlay.innerHTML = `
        <div class="modal" style="max-width:980px;">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:38px;height:38px;border-radius:8px;background:var(--${catCls}-bg);border:1px solid var(--${catCls}-border);
                          display:flex;align-items:center;justify-content:center;color:var(--${catCls});">
                <i class="fas ${catIcon}"></i>
              </div>
              <div>
                <div style="font-size:0.72rem;color:var(--text-muted);font-family:var(--mono);">${p.code} · ${p.category}</div>
                <h2 style="font-size:1.1rem;">${p.title}</h2>
              </div>
            </div>
            
            <div style="display:flex;align-items:center;gap:10px;">
              ${isAdmin ? `
                <button class="btn btn-secondary btn-sm" id="admin-edit-toggle-btn" onclick="window.projectDetail.toggleEditMode('${p.id}')">
                  <i class="fas fa-edit"></i> Edit Project (Admin)
                </button>
              ` : ''}
              <span style="font-size:0.82rem;font-weight:700;color:${daysColor};">${daysStr}</span>
              <button class="modal-close" onclick="window.projectDetail.close()">✕</button>
            </div>
          </div>

          <div class="modal-body">
            <!-- Normal Read-Only Tabs -->
            <div class="modal-tabs" id="proj-tabs">
              <button class="modal-tab active" onclick="window.projectDetail.switchTab('overview')">Overview</button>
              <button class="modal-tab" onclick="window.projectDetail.switchTab('workscope')">Work Scope</button>
              <button class="modal-tab" onclick="window.projectDetail.switchTab('labour')">Labour Log <span class="tab-badge">${attachments.length}</span></button>
              <button class="modal-tab" onclick="window.projectDetail.switchTab('jobcards')">Job Cards <span class="tab-badge">${jobCards.length}</span></button>
              <button class="modal-tab" onclick="window.projectDetail.switchTab('media')">Drive & Photos <span class="tab-badge">${(p.drive_links?.length||0) + (p.photos?.length||0)}</span></button>
              <button class="modal-tab" onclick="window.projectDetail.switchTab('weather')">Weather Log <span class="tab-badge">${weatherLogs.length}</span></button>
              <button class="modal-tab" onclick="window.projectDetail.switchTab('documents')">Documents</button>
            </div>

            <!-- VIEW CONTAINER -->
            <div id="proj-tab-contents">
              <!-- TAB 1: OVERVIEW -->
              <div class="modal-tab-pane active" id="tab-overview">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
                  ${this._infoRow('Approval Reference', p.approval_ref, 'fa-file-alt')}
                  ${this._infoRow('Document Type', p.approval_type, 'fa-stamp')}
                  ${this._infoRow('Approval Authority', p.approval_authority, 'fa-user-shield')}
                  ${this._infoRow('Commencement Date', p.start_date, 'fa-calendar-check')}
                  ${this._infoRow('Approval End Date', p.end_date, 'fa-calendar-times')}
                  ${this._infoRow('Location', p.location, 'fa-map-marker-alt')}
                  ${this._infoRow('End User / Client', p.end_user_name, 'fa-building')}
                  ${this._infoRow('End User Contact', p.end_user_contact, 'fa-phone')}
                  ${this._infoRow('Officer In-Charge', p.incharge, 'fa-star')}
                  ${this._infoRow('Status', p.status, 'fa-circle')}
                </div>

                ${p.previous_approvals && p.previous_approvals.length > 0 ? `
                  <div style="margin-bottom:14px;">
                    <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">Previous Approvals</div>
                    ${p.previous_approvals.map(ap => `
                      <div style="background:var(--bg-surface);border-radius:6px;padding:8px 12px;font-size:0.82rem;color:var(--text-secondary);margin-bottom:4px;font-family:var(--mono);">
                        <i class="fas fa-history" style="color:var(--text-dim);margin-right:8px;"></i>${ap}
                      </div>`).join('')}
                  </div>` : ''}

                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
                  ${this._kpiMini('Progress', p.progress + '%', 'fa-tasks', daysColor)}
                  ${this._kpiMini('Budget', 'LKR ' + (p.budget/1000000).toFixed(1)+'M', 'fa-coins', 'var(--accent)')}
                  ${this._kpiMini('Labour Days', totalLabDays + ' days', 'fa-user-clock', 'var(--success)')}
                  ${this._kpiMini('Job Card Cost', 'LKR ' + (totalJobCost/1000).toFixed(0)+'K', 'fa-receipt', 'var(--warning)')}
                </div>
              </div>

              <!-- TAB 2: WORK SCOPE -->
              <div class="modal-tab-pane" id="tab-workscope">
                <div class="panel">
                  <div class="panel-head"><span class="panel-title"><i class="fas fa-clipboard-list"></i> Current Work Scope</span></div>
                  <div class="panel-body">
                    <p style="font-size:0.9rem;line-height:1.7;color:var(--text-secondary);">${p.work_scope || 'Not specified.'}</p>
                  </div>
                </div>
                <div style="margin-top:14px;" class="panel">
                  <div class="panel-head">
                    <span class="panel-title"><i class="fas fa-tools"></i> Trade Requirement Plan</span>
                  </div>
                  <div class="panel-body">
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;">
                      ${Object.entries(p.trades_required || {}).map(([trade, count]) => `
                        <div style="background:var(--bg-surface);border-radius:8px;padding:12px;text-align:center;">
                          <div style="font-size:1.4rem;font-weight:900;font-family:var(--mono);color:var(--accent);">${count}</div>
                          <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);">${trade}</div>
                          <div style="font-size:0.68rem;color:var(--text-dim);">Sailors Req.</div>
                        </div>`).join('')}
                    </div>
                  </div>
                </div>
                ${p.notes ? `<div style="margin-top:14px;background:rgba(245,158,11,0.05);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:12px 14px;font-size:0.85rem;color:var(--text-secondary);">
                  <i class="fas fa-sticky-note" style="color:var(--warning);margin-right:8px;"></i>${p.notes}</div>` : ''}
              </div>

              <!-- TAB 3: LABOUR LOG -->
              <div class="modal-tab-pane" id="tab-labour">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                  <div style="font-size:0.85rem;color:var(--text-muted);">
                    Total: <strong style="color:var(--text-primary);">${attachments.length} sailors · ${totalLabDays} man-days</strong>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="window.projectDetail.openAddLabourModal('${p.id}')">
                    <i class="fas fa-user-plus"></i> Add Labour
                  </button>
                </div>
                <div class="panel">
                  <table class="sps-table">
                    <thead><tr>
                      <th>Service No.</th><th>Name</th><th>Rank</th><th>Trade</th>
                      <th>From Date</th><th>To Date</th><th>Days</th><th>Status</th><th></th>
                    </tr></thead>
                    <tbody>
                      ${attachments.length === 0 ? `<tr><td colspan="9" style="text-align:center;padding:20px;color:var(--text-dim);">No labour records. Add attachments above.</td></tr>` :
                        attachments.map(a => {
                          const statusCls = a.status === 'Active' ? 'status-active' : 'status-completed';
                          return `<tr>
                            <td class="mono">${a.official_number}</td>
                            <td><strong>${a.name}</strong></td>
                            <td>${a.rank}</td>
                            <td><span class="trade-chip">${a.trade}</span></td>
                            <td>${a.from_date}</td>
                            <td>${a.to_date}</td>
                            <td class="mono" style="font-weight:700;color:var(--accent);">${a.days_attached}</td>
                            <td><span class="status-badge ${statusCls}">${a.status}</span></td>
                            <td>
                              <button class="btn btn-ghost btn-icon btn-sm" onclick="window.spsStore.deleteAttachment('${a.id}');window.projectDetail.openProject('${p.id}');" title="Remove">
                                <i class="fas fa-times" style="color:var(--danger);"></i>
                              </button>
                            </td>
                          </tr>`;
                        }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- TAB 4: JOB CARDS -->
              <div class="modal-tab-pane" id="tab-jobcards">
                <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
                  <button class="btn btn-primary btn-sm" onclick="window.projectDetail.openAddJobCardModal('${p.id}')">
                    <i class="fas fa-plus"></i> New Job Card
                  </button>
                </div>
                <div class="panel">
                  <table class="sps-table">
                    <thead><tr><th>Job No.</th><th>Description</th><th>Start</th><th>End</th><th>Mat. Cost (LKR)</th><th>Labour Hrs</th><th>Status</th></tr></thead>
                    <tbody>
                      ${jobCards.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-dim);">No job cards yet.</td></tr>` :
                        jobCards.map(j => `<tr>
                          <td class="mono" style="color:var(--accent);">${j.job_number}</td>
                          <td>${j.description}</td>
                          <td>${j.start_date}</td>
                          <td>${j.end_date || '—'}</td>
                          <td class="mono" style="text-align:right;">${parseFloat(j.material_cost||0).toLocaleString()}</td>
                          <td class="mono" style="text-align:right;">${j.labour_hours || 0}</td>
                          <td><span class="status-badge ${j.status==='Completed'?'status-completed':j.status==='Active'?'status-active':'status-hold'}">${j.status}</span></td>
                        </tr>`).join('')}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- TAB 5: DRIVE & PHOTOS -->
              <div class="modal-tab-pane" id="tab-media">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                  <div style="font-size:0.88rem;font-weight:700;"><i class="fab fa-google-drive" style="color:#0F9D58;margin-right:6px;"></i> Google Drive & Site Photos/PDFs</div>
                  <div style="display:flex;gap:8px;">
                    <button class="btn btn-secondary btn-sm" onclick="window.projectDetail.openAddDriveLinkModal('${p.id}')">
                      <i class="fab fa-google-drive"></i> Add Drive Link
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="window.projectDetail.openAddPhotoModal('${p.id}')">
                      <i class="fas fa-image"></i> Add Photo/PDF
                    </button>
                  </div>
                </div>

                <!-- Google Drive Links -->
                <div style="margin-bottom:16px;">
                  <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Google Drive Folders</div>
                  ${(!p.drive_links || p.drive_links.length === 0) ? `
                    <div style="background:var(--bg-surface);border-radius:8px;padding:12px;font-size:0.82rem;color:var(--text-dim);">No Google Drive links added yet.</div>
                  ` : p.drive_links.map(dl => `
                    <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:8px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                      <div style="display:flex;align-items:center;gap:10px;">
                        <i class="fab fa-google-drive" style="font-size:1.2rem;color:#0F9D58;"></i>
                        <div>
                          <div style="font-size:0.85rem;font-weight:700;">${dl.title}</div>
                          <div style="font-size:0.72rem;color:var(--text-muted);font-family:var(--mono);">${dl.url}</div>
                        </div>
                      </div>
                      <a href="${dl.url}" target="_blank" class="btn btn-secondary btn-sm"><i class="fas fa-external-link-alt"></i> Open Drive</a>
                    </div>
                  `).join('')}
                </div>

                <!-- Photos & PDF Gallery -->
                <div>
                  <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Photos & PDF Documents</div>
                  ${(!p.photos || p.photos.length === 0) ? `
                    <div style="background:var(--bg-surface);border-radius:8px;padding:20px;text-align:center;font-size:0.82rem;color:var(--text-dim);">No photos or PDF documents uploaded.</div>
                  ` : `
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
                      ${p.photos.map(ph => `
                        <div style="background:var(--bg-surface);border:1px solid var(--border);border-radius:8px;overflow:hidden;">
                          ${ph.type === 'PDF' ? `
                            <div style="height:120px;background:rgba(239,68,68,0.1);display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--danger);">
                              <i class="fas fa-file-pdf" style="font-size:2.5rem;margin-bottom:6px;"></i>
                              <span style="font-size:0.7rem;font-weight:700;">PDF Document</span>
                            </div>
                          ` : `
                            <img src="${ph.url}" style="width:100%;height:120px;object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=500&auto=format&fit=crop&q=60'">
                          `}
                          <div style="padding:8px 10px;">
                            <div style="font-size:0.8rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ph.title}</div>
                            <a href="${ph.url}" target="_blank" style="font-size:0.7rem;color:var(--accent);text-decoration:none;display:inline-block;margin-top:4px;"><i class="fas fa-external-link-alt"></i> View Full</a>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  `}
                </div>
              </div>

              <!-- TAB 6: WEATHER LOG -->
              <div class="modal-tab-pane" id="tab-weather">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                  <div style="font-size:0.88rem;font-weight:700;"><i class="fas fa-cloud-sun-rain" style="color:var(--warning);margin-right:6px;"></i> Weather & Site Conditions Log</div>
                  <button class="btn btn-primary btn-sm" onclick="window.projectDetail.openAddWeatherModal('${p.id}')">
                    <i class="fas fa-plus"></i> Log Today's Weather
                  </button>
                </div>

                <!-- Weather Log Table -->
                <div class="panel">
                  <table class="sps-table">
                    <thead><tr><th>Date</th><th>Condition</th><th>Temp</th><th>Impact & Work Notes</th></tr></thead>
                    <tbody>
                      ${weatherLogs.length === 0 ? `<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-dim);">No weather logs recorded. Log today's weather above.</td></tr>` :
                        weatherLogs.map(w => `<tr>
                          <td class="mono">${w.date}</td>
                          <td><span style="font-size:1.1rem;margin-right:6px;">${w.icon||'☀️'}</span> <strong>${w.condition}</strong></td>
                          <td class="mono">${w.temp||'—'}</td>
                          <td style="color:var(--text-secondary);">${w.notes}</td>
                        </tr>`).join('')}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- TAB 7: DOCUMENTS -->
              <div class="modal-tab-pane" id="tab-documents">
                <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
                  <button class="btn btn-primary btn-sm" onclick="window.projectDetail.openAddDocModal('${p.id}')">
                    <i class="fas fa-plus"></i> Add Signal / Reference
                  </button>
                </div>
                ${docs.length === 0 ? `<div class="empty-state"><i class="fas fa-file-alt"></i><p>No documents attached.</p></div>` :
                  `<div style="display:flex;flex-direction:column;gap:10px;">` +
                  docs.map(d => `
                    <div class="doc-ref">
                      <i class="fas ${d.type.includes('Signal')?'fa-satellite-dish':d.type.includes('Approval')?'fa-stamp':'fa-file-alt'}"></i>
                      <div class="doc-ref-info">
                        <div class="doc-ref-type">${d.type}</div>
                        <div class="doc-ref-num">${d.ref_no}</div>
                        <div class="doc-ref-auth">
                          <i class="fas fa-user-tie" style="margin-right:4px;color:var(--text-dim);"></i>${d.authority} · ${d.date}
                        </div>
                        <div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;">${d.description}</div>
                      </div>
                    </div>`).join('') + `</div>`}
              </div>
            </div>

            <!-- ADMIN EDIT CONTAINER (Shown when Admin Edit is active) -->
            <div id="admin-edit-container" style="display:none;">
              <div style="background:rgba(56,189,248,0.08);border:1px solid var(--accent);border-radius:8px;padding:12px;margin-bottom:14px;font-size:0.83rem;color:var(--accent);">
                <i class="fas fa-shield-alt" style="margin-right:6px;"></i> <strong>Admin Edit Mode Active</strong> — Modify project parameters below.
              </div>
              <div class="form-grid">
                <div class="form-group form-full"><label>Project Title</label><input class="form-control" id="aedit-title" value="${p.title}"></div>
                <div class="form-group"><label>Category</label>
                  <select class="form-control" id="aedit-cat">
                    <option ${p.category==='Religious'?'selected':''}>Religious</option>
                    <option ${p.category==='Clean Sri Lanka'?'selected':''}>Clean Sri Lanka</option>
                    <option ${p.category==='Housing'?'selected':''}>Housing</option>
                    <option ${p.category==='Miscellaneous'?'selected':''}>Miscellaneous</option>
                  </select>
                </div>
                <div class="form-group"><label>Project Code</label><input class="form-control" id="aedit-code" value="${p.code}"></div>
                <div class="form-group"><label>Commencement Date</label><input type="date" class="form-control" id="aedit-start" value="${p.start_date}"></div>
                <div class="form-group"><label>Approval End Date</label><input type="date" class="form-control" id="aedit-end" value="${p.end_date}"></div>
                <div class="form-group"><label>Approval Ref</label><input class="form-control" id="aedit-ref" value="${p.approval_ref||''}"></div>
                <div class="form-group"><label>Approval Authority</label><input class="form-control" id="aedit-auth" value="${p.approval_authority||''}"></div>
                <div class="form-group"><label>Budget (LKR)</label><input type="number" class="form-control" id="aedit-budget" value="${p.budget||0}"></div>
                <div class="form-group"><label>Progress %</label><input type="number" class="form-control" id="aedit-progress" value="${p.progress||0}"></div>
                <div class="form-group"><label>Status</label>
                  <select class="form-control" id="aedit-status">
                    <option ${p.status==='Active'?'selected':''}>Active</option>
                    <option ${p.status==='On Hold'?'selected':''}>On Hold</option>
                    <option ${p.status==='Completed'?'selected':''}>Completed</option>
                  </select>
                </div>
                <div class="form-group"><label>Officer In-Charge</label><input class="form-control" id="aedit-incharge" value="${p.incharge||''}"></div>
                <div class="form-group form-full"><label>Work Scope</label><textarea class="form-control" id="aedit-scope" style="min-height:90px;">${p.work_scope||''}</textarea></div>
              </div>
              <div style="margin-top:16px;display:flex;justify-content:flex-end;gap:10px;">
                <button class="btn btn-secondary" onclick="window.projectDetail.toggleEditMode('${p.id}')">Cancel</button>
                <button class="btn btn-primary" onclick="window.projectDetail.saveAdminEdit('${p.id}')"><i class="fas fa-save"></i> Save Project Changes</button>
              </div>
            </div>
          </div>
        </div>`;

      overlay.classList.add('open');
    }

    toggleEditMode(projectId) {
      this.isEditMode = !this.isEditMode;
      const tabNav = document.getElementById('proj-tabs');
      const tabContents = document.getElementById('proj-tab-contents');
      const editForm = document.getElementById('admin-edit-container');
      const btn = document.getElementById('admin-edit-toggle-btn');

      if (this.isEditMode) {
        tabNav.style.display = 'none';
        tabContents.style.display = 'none';
        editForm.style.display = 'block';
        if (btn) btn.innerHTML = '<i class="fas fa-times"></i> Cancel Edit';
      } else {
        tabNav.style.display = 'flex';
        tabContents.style.display = 'block';
        editForm.style.display = 'none';
        if (btn) btn.innerHTML = '<i class="fas fa-edit"></i> Edit Project (Admin)';
      }
    }

    saveAdminEdit(projectId) {
      const changes = {
        title:              document.getElementById('aedit-title').value,
        category:           document.getElementById('aedit-cat').value,
        code:               document.getElementById('aedit-code').value,
        start_date:         document.getElementById('aedit-start').value,
        end_date:           document.getElementById('aedit-end').value,
        approval_ref:       document.getElementById('aedit-ref').value,
        approval_authority: document.getElementById('aedit-auth').value,
        budget:             parseFloat(document.getElementById('aedit-budget').value) || 0,
        progress:           parseInt(document.getElementById('aedit-progress').value) || 0,
        status:             document.getElementById('aedit-status').value,
        incharge:           document.getElementById('aedit-incharge').value,
        work_scope:         document.getElementById('aedit-scope').value
      };

      window.spsStore.updateProject(projectId, changes);
      window.app.toast('Project updated by Admin!', 'success');
      this.openProject(projectId);
      window.app.renderDashboard();
    }

    switchTab(tabName) {
      document.querySelectorAll('#project-detail-overlay .modal-tab').forEach((t, i) => {
        const tabs = ['overview','workscope','labour','jobcards','media','weather','documents'];
        t.classList.toggle('active', tabs[i] === tabName);
      });
      document.querySelectorAll('#project-detail-overlay .modal-tab-pane').forEach(p => {
        p.classList.toggle('active', p.id === `tab-${tabName}`);
      });
    }

    close() { document.getElementById('project-detail-overlay').classList.remove('open'); }

    openAddDriveLinkModal(projectId) {
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `<div class="modal" style="max-width:500px;">
        <div class="modal-header"><h2><i class="fab fa-google-drive" style="color:#0F9D58;margin-right:8px;"></i>Add Google Drive Folder Link</h2><button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group form-full"><label>Folder Title / Description</label><input class="form-control" id="dl-title" placeholder="e.g. Site Photos Drive Folder"></div>
            <div class="form-group form-full"><label>Google Drive URL</label><input class="form-control" id="dl-url" placeholder="https://drive.google.com/drive/folders/..."></div>
          </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-surface);">
          <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
          <button class="btn btn-primary" onclick="window.projectDetail.saveDriveLink('${projectId}')">Save Link</button>
        </div>
      </div>`;
      overlay.classList.add('open');
    }

    saveDriveLink(projectId) {
      const title = document.getElementById('dl-title').value;
      const url   = document.getElementById('dl-url').value;
      if (!title || !url) { window.app.toast('Enter title and Drive URL', 'warning'); return; }
      window.spsStore.addDriveLink(projectId, { title, url });
      document.getElementById('generic-modal-overlay').classList.remove('open');
      window.app.toast('Drive link saved!', 'success');
      this.openProject(projectId);
    }

    openAddPhotoModal(projectId) {
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `<div class="modal" style="max-width:500px;">
        <div class="modal-header"><h2><i class="fas fa-image" style="margin-right:8px;color:var(--accent);"></i>Add Photo / PDF Document</h2><button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group form-full"><label>Document / Photo Title</label><input class="form-control" id="ph-title" placeholder="e.g. Roof Tile Progress Photo"></div>
            <div class="form-group"><label>Type</label>
              <select class="form-control" id="ph-type"><option>Photo</option><option>PDF</option></select>
            </div>
            <div class="form-group"><label>URL / Web Link</label><input class="form-control" id="ph-url" placeholder="https://..."></div>
          </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-surface);">
          <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
          <button class="btn btn-primary" onclick="window.projectDetail.savePhoto('${projectId}')">Save Media</button>
        </div>
      </div>`;
      overlay.classList.add('open');
    }

    savePhoto(projectId) {
      const title = document.getElementById('ph-title').value;
      const type  = document.getElementById('ph-type').value;
      const url   = document.getElementById('ph-url').value;
      if (!title || !url) { window.app.toast('Enter title and URL', 'warning'); return; }
      window.spsStore.addPhotoAttachment(projectId, { title, type, url });
      document.getElementById('generic-modal-overlay').classList.remove('open');
      window.app.toast('Media attachment saved!', 'success');
      this.openProject(projectId);
    }

    openAddWeatherModal(projectId) {
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `<div class="modal" style="max-width:500px;">
        <div class="modal-header"><h2><i class="fas fa-cloud-sun-rain" style="margin-right:8px;color:var(--warning);"></i>Log Weather & Site Conditions</h2><button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group"><label>Date</label><input type="date" class="form-control" id="wl-date" value="${new Date().toISOString().split('T')[0]}"></div>
            <div class="form-group"><label>Condition</label>
              <select class="form-control" id="wl-cond">
                <option value="Sunny / Clear|☀️">☀️ Sunny / Clear</option>
                <option value="Overcast|☁️">☁️ Overcast</option>
                <option value="Heavy Rain|🌧️">🌧️ Heavy Rain</option>
                <option value="Thunderstorm|🌩️">🌩️ Thunderstorm</option>
                <option value="Strong Winds|💨">💨 Strong Winds</option>
                <option value="High Sea / Tidal|🌊">🌊 High Sea / Tidal</option>
              </select>
            </div>
            <div class="form-group"><label>Temperature (°C)</label><input class="form-control" id="wl-temp" value="30°C"></div>
            <div class="form-group form-full"><label>Impact & Site Notes</label><textarea class="form-control" id="wl-notes" placeholder="Describe work impact..."></textarea></div>
          </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-surface);">
          <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
          <button class="btn btn-primary" onclick="window.projectDetail.saveWeather('${projectId}')">Save Weather Entry</button>
        </div>
      </div>`;
      overlay.classList.add('open');
    }

    saveWeather(projectId) {
      const date = document.getElementById('wl-date').value;
      const condVal = document.getElementById('wl-cond').value.split('|');
      const temp = document.getElementById('wl-temp').value;
      const notes = document.getElementById('wl-notes').value;

      window.spsStore.addWeatherLog({
        project_id: projectId,
        date,
        condition: condVal[0],
        icon: condVal[1],
        temp,
        notes
      });

      document.getElementById('generic-modal-overlay').classList.remove('open');
      window.app.toast('Weather entry logged!', 'success');
      this.openProject(projectId);
    }

    openAddLabourModal(projectId) { window.app.openAttachLabourModal(projectId); }

    openAddJobCardModal(projectId) {
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `<div class="modal" style="max-width:560px;">
        <div class="modal-header"><h2>Add Job Card</h2><button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group"><label>Job Number</label><input class="form-control" id="jc-num" value="JC/SP/${new Date().getFullYear()}/${Math.floor(Math.random()*900+100)}"></div>
            <div class="form-group"><label>Status</label><select class="form-control" id="jc-status"><option>Active</option><option>Completed</option><option>On Hold</option></select></div>
            <div class="form-group form-full"><label>Description</label><textarea class="form-control" id="jc-desc"></textarea></div>
            <div class="form-group"><label>Start Date</label><input type="date" class="form-control" id="jc-start" value="${new Date().toISOString().split('T')[0]}"></div>
            <div class="form-group"><label>End Date</label><input type="date" class="form-control" id="jc-end"></div>
            <div class="form-group"><label>Material Cost (LKR)</label><input type="number" class="form-control" id="jc-cost" value="0"></div>
            <div class="form-group"><label>Labour Hours</label><input type="number" class="form-control" id="jc-hours" value="0"></div>
          </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-surface);">
          <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
          <button class="btn btn-primary" onclick="window.projectDetail.saveJobCard('${projectId}')">Save Job Card</button>
        </div>
      </div>`;
      overlay.classList.add('open');
    }

    saveJobCard(projectId) {
      const jc = {
        project_id: projectId,
        job_number:    document.getElementById('jc-num').value,
        description:   document.getElementById('jc-desc').value,
        start_date:    document.getElementById('jc-start').value,
        end_date:      document.getElementById('jc-end').value,
        status:        document.getElementById('jc-status').value,
        material_cost: parseFloat(document.getElementById('jc-cost').value) || 0,
        labour_hours:  parseFloat(document.getElementById('jc-hours').value) || 0
      };
      if (!jc.description) { window.app.toast('Enter job card description', 'warning'); return; }
      window.spsStore.addJobCard(jc);
      document.getElementById('generic-modal-overlay').classList.remove('open');
      window.app.toast('Job card saved!', 'success');
      this.openProject(projectId);
    }

    openAddDocModal(projectId) {
      const overlay = document.getElementById('generic-modal-overlay');
      overlay.innerHTML = `<div class="modal" style="max-width:520px;">
        <div class="modal-header"><h2>Add Signal / Document Reference</h2><button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">✕</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group"><label>Document Type</label>
              <select class="form-control" id="doc-type">
                <option>Commencement Signal</option><option>Termination Signal</option>
                <option>Previous Approval</option><option>Minute Sheet</option>
                <option>Letter</option><option>Other</option>
              </select></div>
            <div class="form-group"><label>Reference Number</label><input class="form-control" id="doc-ref"></div>
            <div class="form-group"><label>Date</label><input type="date" class="form-control" id="doc-date" value="${new Date().toISOString().split('T')[0]}"></div>
            <div class="form-group"><label>Authority</label><input class="form-control" id="doc-auth"></div>
            <div class="form-group form-full"><label>Description</label><input class="form-control" id="doc-desc"></div>
          </div>
        </div>
        <div style="padding:14px 24px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-surface);">
          <button class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
          <button class="btn btn-primary" onclick="window.projectDetail.saveDoc('${projectId}')">Save Document</button>
        </div>
      </div>`;
      overlay.classList.add('open');
    }

    saveDoc(projectId) {
      const doc = {
        project_id:  projectId,
        type:        document.getElementById('doc-type').value,
        ref_no:      document.getElementById('doc-ref').value,
        date:        document.getElementById('doc-date').value,
        authority:   document.getElementById('doc-auth').value,
        description: document.getElementById('doc-desc').value
      };
      window.spsStore.addDocument(doc);
      document.getElementById('generic-modal-overlay').classList.remove('open');
      window.app.toast('Document reference saved!', 'success');
      this.openProject(projectId);
    }

    _infoRow(label, value, icon) {
      return `<div style="background:var(--bg-surface);border-radius:8px;padding:10px 14px;">
        <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-dim);margin-bottom:3px;">
          <i class="fas ${icon}" style="margin-right:5px;"></i>${label}
        </div>
        <div style="font-size:0.88rem;font-weight:600;color:var(--text-primary);">${value || '—'}</div>
      </div>`;
    }

    _kpiMini(label, value, icon, color) {
      return `<div style="background:var(--bg-surface);border-radius:8px;padding:12px;text-align:center;border-top:3px solid ${color};">
        <i class="fas ${icon}" style="color:${color};font-size:1.1rem;margin-bottom:6px;display:block;"></i>
        <div style="font-size:1rem;font-weight:800;font-family:var(--mono);">${value}</div>
        <div style="font-size:0.7rem;color:var(--text-dim);margin-top:2px;">${label}</div>
      </div>`;
    }
  }

  window.projectDetail = new ProjectDetailModule();
})();
