// ============================================================
// SPS — Dedicated Cloud Sync Engine for Firebase Database #2
// Project: cmsys-projects (Separate Account / asia-southeast1)
// Connects Special Project System, Naval Projects, & CMSys V2 in Realtime
// ============================================================
(function() {
  'use strict';

  const CMSYS_CLOUD_CONFIG = {
    apiKey: "AIzaSyCe0pHX7a-j_0u5AbllTPXOIQ6D0caLoLw",
    authDomain: "cmsys-projects.firebaseapp.com",
    databaseURL: "https://cmsys-projects-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "cmsys-projects",
    storageBucket: "cmsys-projects.firebasestorage.app",
    messagingSenderId: "366430411452",
    appId: "1:366430411452:web:206cb47ecd2af8ffa98eb9",
    measurementId: "G-Q7M7JNMKH0"
  };

  class SPSCloudSyncEngine {
    constructor() {
      this.app = null;
      this.db = null;
      this.connected = false;
      this.lastSync = null;
      this.isRemoteUpdating = false;
      this.initialized = false;
      this.syncDebounceTimer = null;
    }

    init() {
      if (this.initialized) return;

      try {
        if (typeof firebase === 'undefined') {
          console.warn('⚠️ Firebase SDK not loaded, cloud sync inactive');
          this._updateUI(false, 'SDK Missing');
          return;
        }

        const appName = 'sps_cloud';
        try {
          this.app = firebase.app(appName);
        } catch (e) {
          this.app = firebase.initializeApp(CMSYS_CLOUD_CONFIG, appName);
        }

        this.db = firebase.database(this.app);
        this.initialized = true;

        console.log('☁️ SPS Cloud Sync initialized with project:', CMSYS_CLOUD_CONFIG.projectId);

        // 1. Connection status monitor
        this.db.ref('.info/connected').on('value', snap => {
          this.connected = Boolean(snap.val());
          this._updateUI(this.connected, this.connected ? 'Live' : 'Offline Cache');
          if (this.connected) {
            console.log('✅ SPS Cloud: Connected to cmsys-projects RTDB');
          } else {
            console.warn('⚠️ SPS Cloud: Disconnected, operating in offline cache mode');
          }
        });

        // 2. Attach listeners for collections
        this._attachRemoteListeners();

        // 3. Attach local store subscriber
        this._attachLocalStoreSubscriber();

      } catch (err) {
        console.error('❌ Failed to initialize SPS Cloud Sync:', err);
        this._updateUI(false, 'Init Error');
      }
    }

    _attachRemoteListeners() {
      // 1. Listen to Naval Projects (25 capital & vote engineering projects)
      this.db.ref('naval_projects').on('value', snap => {
        if (this.isRemoteUpdating) return;
        const val = snap.val();
        if (val) {
          const arr = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
          if (arr.length > 0) {
            this.isRemoteUpdating = true;
            try {
              window.spsStore.setNavalProjects(arr);
              this.lastSync = new Date();
              this._updateUI(this.connected, 'Synced');
            } finally {
              setTimeout(() => { this.isRemoteUpdating = false; }, 150);
            }
          }
        }
      });

      // 2. Listen to Procurement PR Files (63 files)
      this.db.ref('procurement_files').on('value', snap => {
        if (this.isRemoteUpdating) return;
        const val = snap.val();
        if (val) {
          const arr = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
          if (arr.length > 0) {
            this.isRemoteUpdating = true;
            try {
              window.spsStore.setProcurementFiles(arr);
              this.lastSync = new Date();
              this._updateUI(this.connected, 'Synced');
            } finally {
              setTimeout(() => { this.isRemoteUpdating = false; }, 150);
            }
          }
        }
      });

      // 3. Listen to Special Projects
      this.db.ref('special_projects').on('value', snap => {
        if (this.isRemoteUpdating) return;
        const val = snap.val();
        if (val) {
          const projectsArr = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
          if (projectsArr.length > 0) {
            this.isRemoteUpdating = true;
            try {
              window.spsStore.setProjects(projectsArr);
              this.lastSync = new Date();
              this._updateUI(this.connected, 'Synced');
            } finally {
              setTimeout(() => { this.isRemoteUpdating = false; }, 150);
            }
          }
        }
      });

      // 4. Listen to Special Project Sailor Attachments
      this.db.ref('special_project_attachments').on('value', snap => {
        if (this.isRemoteUpdating) return;
        const val = snap.val();
        if (val) {
          const attsArr = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
          this.isRemoteUpdating = true;
          try {
            window.spsStore.setAttachments(attsArr);
            this.lastSync = new Date();
            this._updateUI(this.connected, 'Synced');
          } finally {
            setTimeout(() => { this.isRemoteUpdating = false; }, 150);
          }
        }
      });

      // 5. Listen to Job Cards
      this.db.ref('job_cards').on('value', snap => {
        if (this.isRemoteUpdating) return;
        const val = snap.val();
        if (val) {
          const jcArr = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
          this.isRemoteUpdating = true;
          try {
            window.spsStore.setJobCards(jcArr);
          } finally {
            setTimeout(() => { this.isRemoteUpdating = false; }, 150);
          }
        }
      });

      // 6. Listen to Documents
      this.db.ref('documents').on('value', snap => {
        if (this.isRemoteUpdating) return;
        const val = snap.val();
        if (val) {
          const docArr = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
          this.isRemoteUpdating = true;
          try {
            window.spsStore.setDocuments(docArr);
          } finally {
            setTimeout(() => { this.isRemoteUpdating = false; }, 150);
          }
        }
      });

      // 7. Listen to Weather Logs
      this.db.ref('weather_logs').on('value', snap => {
        if (this.isRemoteUpdating) return;
        const val = snap.val();
        if (val) {
          const wlArr = Array.isArray(val) ? val.filter(Boolean) : Object.values(val);
          this.isRemoteUpdating = true;
          try {
            window.spsStore.setWeatherLogs(wlArr);
          } finally {
            setTimeout(() => { this.isRemoteUpdating = false; }, 150);
          }
        }
      });
    }

    _attachLocalStoreSubscriber() {
      if (!window.spsStore) return;

      window.spsStore.subscribe((event, data) => {
        // Prevent echo if update originated from remote DB
        if (this.isRemoteUpdating || !this.db) return;

        // Debounce syncing full collections on rapid edits
        clearTimeout(this.syncDebounceTimer);
        this.syncDebounceTimer = setTimeout(() => {
          this._handleStoreMutation(event, data);
        }, 300);
      });
    }

    async _handleStoreMutation(event) {
      if (!this.db) return;

      try {
        // Naval Projects mutation
        if (['NAVAL_PROJECT_ADDED', 'NAVAL_PROJECT_UPDATED', 'NAVAL_PROJECT_DELETED', 'NAVAL_PROJECTS_SET'].includes(event)) {
          const np = window.spsStore.navalProjects;
          await this.db.ref('naval_projects').set(np);
          this._touchMeta();
        }

        // Procurement Files mutation
        if (['PROCUREMENT_FILE_ADDED', 'PROCUREMENT_FILE_UPDATED', 'PROCUREMENT_FILE_DELETED', 'PROCUREMENT_FILES_SET'].includes(event)) {
          const pf = window.spsStore.procurementFiles;
          await this.db.ref('procurement_files').set(pf);
          this._touchMeta();
        }

        // Special Projects mutation
        if (['PROJECT_ADDED', 'PROJECT_UPDATED', 'PROJECT_DELETED'].includes(event)) {
          const projects = window.spsStore.projects;
          await this.db.ref('special_projects').set(projects);
          await this.db.ref('projects').set(projects); // mirror
          this._touchMeta();
        }

        // Attachments mutation
        if (['ATTACHMENT_ADDED', 'ATTACHMENTS_BULK', 'ATTACHMENT_UPDATED', 'ATTACHMENT_DELETED'].includes(event)) {
          const attachments = window.spsStore.attachments;
          await this.db.ref('special_project_attachments').set(attachments);
          await this.db.ref('attachments').set(attachments); // mirror
          this._touchMeta();
        }

        if (event === 'JOB_CARD_ADDED') {
          const jc = window.spsStore.jobCards;
          await this.db.ref('job_cards').set(jc);
          this._touchMeta();
        }

        if (event === 'DOC_ADDED') {
          const docs = window.spsStore.documents;
          await this.db.ref('documents').set(docs);
          this._touchMeta();
        }

        if (event === 'WEATHER_ADDED') {
          const wl = window.spsStore.weatherLogs;
          await this.db.ref('weather_logs').set(wl);
          this._touchMeta();
        }
      } catch (err) {
        console.warn('⚠️ Cloud sync write failed, state safely held in local storage:', err);
      }
    }

    async _touchMeta() {
      if (!this.db) return;
      try {
        this.lastSync = new Date();
        await this.db.ref('system_status').update({
          last_active: this.lastSync.toISOString(),
          total_naval_projects: (window.spsStore.navalProjects || []).length,
          total_procurement_files: (window.spsStore.procurementFiles || []).length,
          total_special_projects: (window.spsStore.projects || []).length,
          total_attachments: (window.spsStore.attachments || []).length
        });
        this._updateUI(this.connected, 'Synced');
      } catch(e) {}
    }

    /**
     * Force push local state snapshot to Firebase Cloud
     */
    async forceSyncToCloud() {
      if (!this.db) throw new Error('Database not initialized');
      this.isRemoteUpdating = true;
      try {
        const np = window.spsStore.navalProjects;
        const pf = window.spsStore.procurementFiles;
        const p  = window.spsStore.projects;
        const a  = window.spsStore.attachments;
        const j  = window.spsStore.jobCards;
        const d  = window.spsStore.documents;
        const w  = window.spsStore.weatherLogs;

        await Promise.all([
          this.db.ref('naval_projects').set(np),
          this.db.ref('procurement_files').set(pf),
          this.db.ref('special_projects').set(p),
          this.db.ref('projects').set(p),
          this.db.ref('special_project_attachments').set(a),
          this.db.ref('attachments').set(a),
          this.db.ref('job_cards').set(j),
          this.db.ref('documents').set(d),
          this.db.ref('weather_logs').set(w),
          this.db.ref('system_status').update({
            last_manual_sync: new Date().toISOString(),
            status: 'online',
            total_naval_projects: np.length,
            total_procurement_files: pf.length,
            total_special_projects: p.length
          })
        ]);

        this.lastSync = new Date();
        this._updateUI(true, 'Full Sync Complete');
        return { success: true, count: np.length + p.length };
      } finally {
        setTimeout(() => { this.isRemoteUpdating = false; }, 200);
      }
    }

    /**
     * Force pull remote state snapshot from Firebase Cloud
     */
    async forcePullFromCloud() {
      if (!this.db) throw new Error('Database not initialized');

      // 1. Pull Naval Projects
      const navalSnap = await this.db.ref('naval_projects').once('value');
      const navalVal = navalSnap.val();
      if (navalVal) {
        const arr = Array.isArray(navalVal) ? navalVal.filter(Boolean) : Object.values(navalVal);
        window.spsStore.setNavalProjects(arr);
      }

      // 2. Pull Procurement Files
      const procSnap = await this.db.ref('procurement_files').once('value');
      const procVal = procSnap.val();
      if (procVal) {
        const arr = Array.isArray(procVal) ? procVal.filter(Boolean) : Object.values(procVal);
        window.spsStore.setProcurementFiles(arr);
      }

      // 3. Pull Special Projects
      const snap = await this.db.ref('special_projects').once('value');
      const p = snap.val();
      if (p) {
        const arr = Array.isArray(p) ? p.filter(Boolean) : Object.values(p);
        window.spsStore.setProjects(arr);
      }

      // 4. Pull Attachments
      const attSnap = await this.db.ref('special_project_attachments').once('value');
      const a = attSnap.val();
      if (a) {
        const arr = Array.isArray(a) ? a.filter(Boolean) : Object.values(a);
        window.spsStore.setAttachments(arr);
      }

      this.lastSync = new Date();
      this._updateUI(true, 'Refreshed from Cloud');
      return true;
    }

    /**
     * Publishes absorption package directly to Firebase for CMSys V2 consumption
     */
    async publishAbsorptionPackage(payload) {
      if (!this.db || !payload) return false;
      try {
        await this.db.ref('cmsys_absorption').set(payload);
        await this.db.ref(`cmsys_absorption_history/${payload.project_meta.code}`).set({
          ...payload,
          published_at: new Date().toISOString()
        });
        console.log('✅ Absorption payload published to cmsys-projects cloud');
        return true;
      } catch (err) {
        console.warn('⚠️ Cloud absorption publication failed:', err);
        return false;
      }
    }

    getConfig() {
      return { ...CMSYS_CLOUD_CONFIG };
    }

    getStatus() {
      return {
        connected: this.connected,
        lastSync: this.lastSync ? this.lastSync.toLocaleTimeString() : 'Never',
        projectId: CMSYS_CLOUD_CONFIG.projectId,
        databaseURL: CMSYS_CLOUD_CONFIG.databaseURL,
        region: 'asia-southeast1 (Singapore)',
        navalProjectsCount: (window.spsStore.navalProjects || []).length,
        procurementFilesCount: (window.spsStore.procurementFiles || []).length,
        specialProjectsCount: (window.spsStore.projects || []).length
      };
    }

    _updateUI(connected, label) {
      const el = document.getElementById('cloud-status-text');
      if (el) {
        el.innerHTML = connected
          ? `<span class="pulse-dot" style="background:#10b981;"></span> Live (cmsys-projects)`
          : `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;margin-right:5px;"></span> ${label || 'Local Offline'}`;
      }
    }
  }

  window.spsCloudSync = new SPSCloudSyncEngine();
})();
