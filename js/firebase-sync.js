// ============================================================
// SPS — Firebase Personnel & Availability Sync Engine (cmsys-v2)
// Unified Architecture: cmsys-v2 (Sailor Registry, Availability, Out Projects)
// Integrates full sailor profiles, real-time leaves, sick logs, and victualing
// ============================================================
(function() {
  'use strict';

  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDpxQzPBylQeLTXmgiF6GSVtGG_FrIo900",
    authDomain: "cmsys-v2.firebaseapp.com",
    databaseURL: "https://cmsys-v2-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "cmsys-v2",
    storageBucket: "cmsys-v2.firebasestorage.app",
    messagingSenderId: "1093761746400",
    appId: "1:1093761746400:web:1984fad8019641b2ca5785"
  };

  class SailorSyncEngine {
    constructor() {
      this.db = null;
      this.connected = false;
      this._hasLocalLoaded = false;
    }

    async init() {
      // 1. Immediately load local authoritative cache for instantaneous, zero-delay boot
      await this.loadLocalCache();

      // 2. Connect to live Firebase cmsys-v2 in background
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
        console.warn('⚠️ SPS Firebase RTDB background connection error:', e.message);
      }
    }

    async loadLocalCache() {
      try {
        const [sailorsRes, avRes, outRes] = await Promise.allSettled([
          fetch('data/cmsys_sailors.json'),
          fetch('data/cmsys_availability.json'),
          fetch('data/cmsys_out_projects.json')
        ]);

        if (sailorsRes.status === 'fulfilled' && sailorsRes.value.ok) {
          const rawSailors = await sailorsRes.value.json();
          this._processSailors(rawSailors, false);
        }

        if (avRes.status === 'fulfilled' && avRes.value.ok) {
          const rawAv = await avRes.value.json();
          window.spsStore.setAvailability(rawAv);
        }

        if (outRes.status === 'fulfilled' && outRes.value.ok) {
          const rawOut = await outRes.value.json();
          window.spsStore.setOutProjects(rawOut);
        }

        this._hasLocalLoaded = true;
      } catch (err) {
        console.warn('⚠️ Error reading local CMSys cache files:', err);
      }
    }

    _listen() {
      if (!this.db) return;

      // Listen for sailors
      this.db.ref('sailors').on('value', snap => {
        if (!snap.exists()) return;
        this._processSailors(snap.val(), true);
      }, err => {
        console.warn('⚠️ Firebase sailors stream warning:', err.message);
      });

      // Listen for availability (leaves, sick, temporary duty)
      this.db.ref('availability').on('value', snap => {
        if (!snap.exists()) return;
        window.spsStore.setAvailability(snap.val());
      }, err => {
        console.warn('⚠️ Firebase availability stream warning:', err.message);
      });

      // Listen for out_projects
      this.db.ref('out_projects').on('value', snap => {
        if (!snap.exists()) return;
        window.spsStore.setOutProjects(snap.val());
      }, err => {
        console.warn('⚠️ Firebase out_projects stream warning:', err.message);
      });
    }

    _processSailors(raw, isLive = false) {
      if (!raw) return;
      const entries = Array.isArray(raw) 
        ? raw.map((s, idx) => [s?._fbKey || s?.id || `FB-${idx}`, s])
        : Object.entries(raw);

      const normalized = entries.filter(([, s]) => s && typeof s === 'object').map(([fbKey, s], i) => {
        const offNo = (s.off_no || s.official_number || s.officialNumber || s.navy_no || `NAV-${i}`).trim();
        const cleanNo = offNo.replace(/[^a-zA-Z0-9]/g, '');
        const rank = s.rank || 'AB';
        const trade = (s.trade || s.branch || 'MA').toUpperCase();
        const name = (s.name || (s.firstName ? `${s.firstName} ${s.lastName || ''}`.trim() : `Sailor ${offNo}`)).trim();
        const vType = s.victualing_type || (s.roll === 'VAS' ? 'V/In' : 'V/In');
        const district = s.district || s.city || (s.address ? s.address.split(',').pop().trim() : 'Trincomalee');

        return {
          id: s.id || fbKey || `FB-${i}`,
          _fbKey: fbKey,
          cmsys_sailor_id: fbKey,
          official_number: offNo,
          off_no: offNo,
          cleanNo: cleanNo,
          name: name,
          rank: rank,
          trade: trade,
          roll: s.roll || (offNo.startsWith('VAS') ? 'VAS' : offNo.startsWith('EC') ? 'EC' : 'REG'),
          category: s.category || 'Regular',
          zone: s.zone_assigned || s.zone || 'Special Projects',
          status: s.status || 'Active',
          performance_score: parseFloat(s.performance_score || s.rating || 8.5),
          victualing_type: vType,
          district: district,
          home_location: district,
          city: s.city || '',
          address: s.address || '',
          address_line: s.address_line || '',
          police_station: s.police_station || '',
          contact_no: s.contact_no || s.phone || s.mobile || '',
          blood_group: s.blood_group || '',
          special_skill: s.special_skill || s.skills || '',
          join_date: s.join_date || '',
          id_expiry: s.id_expiry || '',
          nok_name: s.nok_name || '',
          next_b_medical_date: s.next_b_medical_date || '',
          next_gcb_date: s.next_gcb_date || '',
          next_nav3_date: s.next_nav3_date || '',
          next_r_medical_date: s.next_r_medical_date || '',
          photo_url: `images/${cleanNo}.JPG`
        };
      });

      window.spsStore.setSailors(normalized);
      this.connected = isLive;
      this._updateUI(isLive, normalized.length);
      console.log(`✅ SPS Firebase Sync: ${normalized.length} complete sailor profiles registered (${isLive ? 'Live RTDB' : 'Cached Snapshot'})`);
    }

    _updateUI(live, count) {
      const el = document.getElementById('fb-status-text');
      if (el) {
        el.innerHTML = live
          ? `<span class="pulse-dot"></span> Live (${count} Sailors)`
          : `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;margin-right:5px;"></span> DB Synced (${count})`;
      }
    }
  }

  window.sailorSync = new SailorSyncEngine();
})();
