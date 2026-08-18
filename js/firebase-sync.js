// ============================================================
// SPS — Firebase Sailor Details Sync Engine
// Read-Only connection to ce-admin-panel2025
// ============================================================
(function() {
  'use strict';

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDmHdg1FfgR_-4pKJ5z0inI8-BZ21MUtvg",
    authDomain: "ce-admin-panel2025.firebaseapp.com",
    databaseURL: "https://ce-admin-panel2025-default-rtdb.firebaseio.com",
    projectId: "ce-admin-panel2025",
    storageBucket: "ce-admin-panel2025.firebasestorage.app",
    messagingSenderId: "1093761746400",
    appId: "1:1093761746400:web:1984fad8019641b2ca5785"
  };

  const FALLBACK_SAILORS = [
    { id:"S001", official_number:"MA/1234", name:"AB Kamal Perera",      rank:"AB",  trade:"MA", category:"Regular", zone:"A-Zone",      status:"Active", performance_score:8.5 },
    { id:"S002", official_number:"CA/2345", name:"LS Nimal Silva",       rank:"LS",  trade:"CA", category:"Regular", zone:"A-Zone",      status:"Active", performance_score:8.8 },
    { id:"S003", official_number:"PA/3456", name:"AB Sunil Fernando",    rank:"AB",  trade:"PA", category:"VSS",     zone:"A-Zone",      status:"Active", performance_score:7.2 },
    { id:"S004", official_number:"PL/4567", name:"PO2 Chamara Bandara",  rank:"PO2", trade:"PL", category:"Regular", zone:"A-Zone",      status:"Active", performance_score:9.0 },
    { id:"S005", official_number:"WE/5678", name:"AB Ruwan Jayasena",    rank:"AB",  trade:"WE", category:"Regular", zone:"BC-Zone",     status:"Active", performance_score:8.1 },
    { id:"S006", official_number:"MA/6789", name:"LS Pradeep Kumara",    rank:"LS",  trade:"MA", category:"VSS",     zone:"BC-Zone",     status:"Active", performance_score:7.9 },
    { id:"S007", official_number:"BB/7890", name:"AB Lasith Malinga",    rank:"AB",  trade:"BB", category:"Regular", zone:"A-Zone",      status:"Active", performance_score:8.4 },
    { id:"S008", official_number:"RW/8901", name:"PO1 Dinesh Priyantha", rank:"PO1", trade:"RW", category:"Regular", zone:"A-Zone",      status:"Active", performance_score:9.3 },
    { id:"S009", official_number:"AL/9012", name:"AB Sampath Kumara",    rank:"AB",  trade:"AL", category:"Regular", zone:"CW-Shop",     status:"Active", performance_score:8.0 },
    { id:"S010", official_number:"SW/0123", name:"LS Gayan Wickrama",    rank:"LS",  trade:"SW", category:"Regular", zone:"CW-Shop",     status:"Active", performance_score:8.2 },
    { id:"S011", official_number:"MA/1122", name:"AB Saman Rathnayake",  rank:"AB",  trade:"MA", category:"Regular", zone:"BC-Zone",     status:"Active", performance_score:7.8 },
    { id:"S012", official_number:"PA/2233", name:"AB Lalith Kumara",     rank:"AB",  trade:"PA", category:"VSS",     zone:"A-Zone",      status:"Active", performance_score:7.5 },
    { id:"S013", official_number:"PL/3344", name:"LS Mahesh Perera",     rank:"LS",  trade:"PL", category:"Regular", zone:"Housing-Proj",status:"Active", performance_score:8.6 },
    { id:"S014", official_number:"CA/4455", name:"AB Chathura Bandara",  rank:"AB",  trade:"CA", category:"Regular", zone:"A-Zone",      status:"Active", performance_score:8.0 },
    { id:"S015", official_number:"WE/5566", name:"LS Roshan Fernando",   rank:"LS",  trade:"WE", category:"Regular", zone:"CW-Shop",     status:"Active", performance_score:8.9 }
  ];

  class SailorSyncEngine {
    constructor() {
      this.db = null;
      this.connected = false;
    }

    init() {
      try {
        if (typeof firebase === 'undefined') { throw new Error('Firebase SDK not available'); }
        const appName = 'sps_sailors';
        let app;
        try {
          app = firebase.app(appName);
        } catch(e) {
          app = firebase.initializeApp(FIREBASE_CONFIG, appName);
        }
        this.db = firebase.database(app);
        this._listen();
      } catch(e) {
        console.warn('⚠️ SPS Firebase offline, using fallback pool:', e.message);
        this._loadFallback();
      }
    }

    _listen() {
      this.db.ref('sailors').on('value', snap => {
        if (!snap.exists()) { this._loadFallback(); return; }
        const raw = snap.val();
        const arr = Array.isArray(raw) ? raw : Object.values(raw);
        const normalized = arr.filter(Boolean).map((s, i) => ({
          id: s.id || `FB-${i}`,
          official_number: s.official_number || s.officialNumber || s.off_no || s.navy_no || `NAV/${i}`,
          name: s.name || (s.firstName ? `${s.firstName} ${s.lastName||''}`.trim() : `Sailor ${i}`),
          rank:  s.rank  || 'AB',
          trade: (s.trade || s.branch || 'MA').toUpperCase(),
          category: s.category || 'Regular',
          zone: s.zone_assigned || s.zone || 'Unassigned',
          status: s.status || 'Active',
          performance_score: parseFloat(s.performance_score || s.rating || 7.5)
        }));

        window.spsStore.setSailors(normalized);
        this.connected = true;
        this._updateUI(true, normalized.length);
        console.log(`✅ SPS Firebase: ${normalized.length} sailors synced`);
      }, err => {
        console.warn('⚠️ Firebase error, using fallback:', err.message);
        this._loadFallback();
      });
    }

    _loadFallback() {
      window.spsStore.setSailors(FALLBACK_SAILORS);
      this.connected = false;
      this._updateUI(false, FALLBACK_SAILORS.length);
    }

    _updateUI(live, count) {
      const el = document.getElementById('fb-status-text');
      if (el) {
        el.innerHTML = live
          ? `<span class="pulse-dot"></span> Live (${count} Sailors)`
          : `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;margin-right:5px;"></span> Offline Pool (${count})`;
      }
    }
  }

  window.sailorSync = new SailorSyncEngine();
})();
