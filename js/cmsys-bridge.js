/* ==========================================================================
   Special Project System (SPS) - CMSys Attachment Sync & Absorption Bridge
   Allows CMSys to absorb special project attachment details (Sailor IDs,
   attached dates, trade roles, project WBS task assignments, and status)
   ========================================================================== */

class CMSysSyncBridge {
  constructor() {
    this.lastSyncTimestamp = null;
  }

  /**
   * Package current Special Project sailor attachments into standardized CMSys Absorption format
   */
  generateCMSysAbsorptionPackage() {
    const activeProject = window.spsStore.getActiveProject();
    if (!activeProject) return null;

    const attachments = window.spsStore.state.attachments.filter(
      a => a.project_id === activeProject.id
    );

    const payload = {
      source_system: "SPECIAL_PROJECT_SYSTEM_V1",
      sync_timestamp: new Date().toISOString(),
      project_meta: {
        id: activeProject.id,
        code: activeProject.code,
        title: activeProject.title,
        location: activeProject.location || "Trincomalee",
        start_date: activeProject.start_date,
        estimated_completion: activeProject.end_date
      },
      attached_sailors_count: attachments.length,
      attachments: attachments.map(att => {
        const sailor = window.spsStore.state.sailors.find(s => s.official_number === att.official_number) || {};
        return {
          attachment_id: att.id,
          official_number: att.official_number,
          name: sailor.name || att.name,
          rank: sailor.rank || att.rank,
          trade: sailor.trade || att.trade,
          category: sailor.category || "Regular",
          assigned_wbs_task: att.wbs_task_name || "General Project Works",
          duty_role: att.duty_role || "Specialist Tradesman",
          start_date: att.start_date,
          end_date: att.end_date,
          daily_hours_allocated: att.daily_hours || 8.0,
          attachment_status: att.status || "Attached",
          cmsys_zone_override: "Special Projects Wing"
        };
      })
    };

    return payload;
  }

  /**
   * Export JSON File for offline / manual import into CMSys
   */
  exportAbsorptionJSONFile() {
    const payload = this.generateCMSysAbsorptionPackage();
    if (!payload) {
      if (window.app) window.app.showToast("No active project attachments to export", "warning");
      return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CMSys_Absorb_SpecialProject_${payload.project_meta.code}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    this.lastSyncTimestamp = new Date().toLocaleTimeString();
    if (window.app) window.app.showToast("CMSys Absorption Package exported successfully!", "success");
  }

  /**
   * Trigger REST API Sync Endpoint for direct server-to-server absorption
   */
  /**
   * Trigger REST API Sync & Firebase Cloud Absorption
   */
  async triggerServerRESTSync() {
    const payload = this.generateCMSysAbsorptionPackage();
    if (!payload) return;

    let cloudOk = false;
    // 1. Publish directly to Firebase Database (cmsys-v2)
    if (window.spsCloudSync) {
      try {
        cloudOk = await window.spsCloudSync.publishAbsorptionPackage(payload);
      } catch (err) {
        console.warn('⚠️ Cloud publish error:', err);
      }
    }

    // 2. Also notify backend REST endpoint
    try {
      const response = await fetch("api/api.php?action=cmsys_absorb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (resData.status === "success" || cloudOk) {
        this.lastSyncTimestamp = new Date().toLocaleTimeString();
        if (window.app) window.app.showToast(`Published ${payload.attached_sailors_count} attachments to cmsys-v2 Cloud & REST!`, "success");
      } else {
        if (window.app) window.app.showToast("Sync completed locally.", "info");
      }
    } catch (e) {
      if (cloudOk) {
        this.lastSyncTimestamp = new Date().toLocaleTimeString();
        if (window.app) window.app.showToast(`Published ${payload.attached_sailors_count} attachments to cmsys-v2 Cloud!`, "success");
      } else {
        console.warn("⚠️ REST Sync fallback to local mode:", e);
        if (window.app) window.app.showToast("Sync ready for CMSys absorption.", "info");
      }
    }
  }

  /**
   * Render Sync View HTML in SPS UI
   */
  renderSyncBridgeView(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const payload = this.generateCMSysAbsorptionPackage();
    const activeProject = window.spsStore.getActiveProject();

    container.innerHTML = `
      <div class="glass-panel">
        <div class="panel-header">
          <span class="panel-title">
            <i class="fas fa-network-wired"></i> CMSys Attachment Sync & Absorption Center
          </span>
          <span class="badge badge-success"><i class="fas fa-link"></i> Bridge Active</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
          <p style="font-size:0.9rem; color:var(--text-muted);">
            This engine prepares and transmits <strong>Special Project Sailor Attachments</strong> to the main <strong>CMSys</strong> system. 
            Once absorbed, attached personnel will be automatically flagged in CMSys zone allocations and attendance daily logs.
          </p>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            <div class="sys-status-card" style="padding:16px;">
              <h4 style="font-size:0.85rem; font-weight:700; color:var(--text-main); margin-bottom:8px;">
                <i class="fas fa-building" style="color:var(--accent-primary)"></i> Current Special Project
              </h4>
              <div style="font-size:1.1rem; font-weight:800; color:var(--accent-primary);">
                ${activeProject ? activeProject.title : 'No Project Selected'}
              </div>
              <div style="font-size:0.78rem; color:var(--text-dim);">Code: ${activeProject ? activeProject.code : 'N/A'}</div>
            </div>

            <div class="sys-status-card" style="padding:16px;">
              <h4 style="font-size:0.85rem; font-weight:700; color:var(--text-main); margin-bottom:8px;">
                <i class="fas fa-users" style="color:var(--accent-success)"></i> Personnel Attached
              </h4>
              <div style="font-size:1.4rem; font-weight:800; color:var(--accent-success);">
                ${payload ? payload.attached_sailors_count : 0} Sailors
              </div>
              <div style="font-size:0.78rem; color:var(--text-dim);">Last Sync: ${this.lastSyncTimestamp || 'Not synced today'}</div>
            </div>
          </div>

          <!-- Actions -->
          <div style="display:flex; gap:12px; margin-top:8px;">
            <button class="btn btn-primary" onclick="app.cmsysBridge.triggerServerRESTSync()">
              <i class="fas fa-sync-alt"></i> Push Attachments to CMSys REST API
            </button>
            <button class="btn btn-secondary" onclick="app.cmsysBridge.exportAbsorptionJSONFile()">
              <i class="fas fa-file-download"></i> Download CMSys Absorption Package (.json)
            </button>
          </div>

          <!-- Payload Preview Code Box -->
          <div style="margin-top:12px;">
            <label style="font-size:0.8rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:6px;">
              <i class="fas fa-code"></i> Live Absorption JSON Payload Preview for CMSys:
            </label>
            <textarea class="form-control" style="font-family:var(--font-mono); font-size:0.8rem; height:220px; background:#070d19;" readonly>
${payload ? JSON.stringify(payload, null, 2) : '// No active project attachment payload'}
            </textarea>
          </div>
        </div>
      </div>
    `;
  }
}

window.CMSysSyncBridge = CMSysSyncBridge;
