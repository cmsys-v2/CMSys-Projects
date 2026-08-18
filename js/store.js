// ============================================================
// SPS — Central State Store
// Manages Projects, Attachments, Job Cards, Documents, Sailors,
// Weather Logs, User Profiles, Active Roles, Trade Quotas,
// and Equal Opportunity Fairness Rotation Metrics
// ============================================================
(function() {
  'use strict';

  const STORAGE_KEY = 'sps_v4_state';

  const NAVAL_ROLES = [
    { id: 'admin',     name: 'Admin',                 code: 'ADMIN',     level: 1, desc: 'Full System Administrator — All Privileges' },
    { id: 'cced_e',    name: 'CCED (E)',              code: 'CCED(E)',   level: 2, desc: 'Chief Civil Engineer Department (East)' },
    { id: 'cceo_e',    name: 'CCEO (E)',              code: 'CCEO(E)',   level: 2, desc: 'Chief Civil Engineer Officer (East)' },
    { id: 'sce_ww',    name: 'SCE (W/W)',             code: 'SCE(W/W)',  level: 3, desc: 'Senior Civil Engineer (Water Works / Works)' },
    { id: 'ce_ww',     name: 'CE (W/W)',              code: 'CE(W/W)',   level: 3, desc: 'Civil Engineer' },
    { id: 'artificers',name: 'Artificers',           code: 'ARTIFICER', level: 4, desc: 'Chief / Senior Artificers & Technical Supervision' },
    { id: 'incharge',  name: 'Incharge',              code: 'INCHARGE',  level: 5, desc: 'Site In-Charge Officer & Petty Officers' }
  ];

  class SPSStore {
    constructor() {
      this._state = {
        projects: [],
        attachments: [],
        jobCards: [],
        documents: [],
        sailors: [],
        weatherLogs: [],
        users: [
          { id: 'U001', name: 'Capt S. Bandara', serviceNo: 'N/00101', role: 'admin',      designation: 'Chief Engineer Admin' },
          { id: 'U002', name: 'Cdr R. Jayawardena', serviceNo: 'N/00245', role: 'cced_e',   designation: 'CCED (East)' },
          { id: 'U003', name: 'Lt Cdr K. Perera', serviceNo: 'N/00488', role: 'cceo_e',   designation: 'CCEO (East)' },
          { id: 'U004', name: 'Lt T. Fernando',   serviceNo: 'N/00612', role: 'sce_ww',   designation: 'SCE (W/W)' },
          { id: 'U005', name: 'Lt M. Ratnayake', serviceNo: 'N/00755', role: 'ce_ww',    designation: 'CE (W/W)' },
          { id: 'U006', name: 'CPO W. Silva',     serviceNo: 'V/10482', role: 'artificers',designation: 'Chief Artificer' },
          { id: 'U007', name: 'PO1 R. Jayasena',  serviceNo: 'MA/5678', role: 'incharge',  designation: 'Site Incharge (Trincomalee)' }
        ],
        activeUserId: 'U001',
        ganttZoom: 'Weeks',
        ganttStartYear: 2026,
        activeCategory: 'All',
        lastUpdated: null
      };
      this._subs = [];
      this._loaded = false;
    }

    // ── Subscriptions ──
    subscribe(fn) { this._subs.push(fn); return () => { this._subs = this._subs.filter(s => s !== fn); }; }
    _emit(event, data) { this._subs.forEach(fn => { try { fn(event, data, this._state); } catch(e){} }); }

    // ── State Getters ──
    get projects()       { return this._state.projects; }
    get attachments()    { return this._state.attachments; }
    get jobCards()       { return this._state.jobCards; }
    get documents()      { return this._state.documents; }
    get sailors()        { return this._state.sailors; }
    get weatherLogs()    { return this._state.weatherLogs || []; }
    get users()          { return this._state.users; }
    get activeUserId()   { return this._state.activeUserId; }
    get ganttZoom()      { return this._state.ganttZoom; }
    get ganttStartYear() { return this._state.ganttStartYear || 2026; }
    get activeCategory() { return this._state.activeCategory; }
    get navalRoles()     { return NAVAL_ROLES; }

    get currentUser() {
      return this._state.users.find(u => u.id === this._state.activeUserId) || this._state.users[0];
    }

    get activeRole() {
      const u = this.currentUser;
      return NAVAL_ROLES.find(r => r.id === u.role) || NAVAL_ROLES[0];
    }

    isAdmin() {
      return this.currentUser.role === 'admin';
    }

    setActiveUser(userId) {
      this._state.activeUserId = userId;
      this._save();
      this._emit('USER_CHANGED', this.currentUser);
    }

    addUserProfile(user) {
      user.id = user.id || `U-${Date.now().toString().slice(-4)}`;
      this._state.users.push(user);
      this._save();
      this._emit('USER_ADDED', user);
    }

    updateUserProfile(userId, changes) {
      const idx = this._state.users.findIndex(u => u.id === userId);
      if (idx >= 0) {
        Object.assign(this._state.users[idx], changes);
        this._save();
        this._emit('USER_UPDATED', this._state.users[idx]);
      }
    }

    deleteUserProfile(userId) {
      if (this._state.users.length <= 1) return false;
      this._state.users = this._state.users.filter(u => u.id !== userId);
      if (this._state.activeUserId === userId) {
        this._state.activeUserId = this._state.users[0].id;
      }
      this._save();
      this._emit('USER_DELETED', userId);
      return true;
    }

    // ── Trade Quota Helpers ──
    getProjectTradeQuotas(projectId) {
      const p = this.getProject(projectId);
      if (!p || !p.trades_required) return [];
      const today = new Date(); today.setHours(0,0,0,0);
      const activeAttachments = this._state.attachments.filter(a => {
        if (a.project_id !== projectId) return false;
        const e = new Date(a.to_date); e.setHours(0,0,0,0);
        return e >= today;
      });

      const result = [];
      Object.entries(p.trades_required).forEach(([trade, reqCount]) => {
        const attachedCount = activeAttachments.filter(a => a.trade === trade).length;
        const remaining = reqCount - attachedCount;
        let status = 'Vacant';
        if (remaining <= 0) status = 'Full';
        else if (attachedCount > 0) status = 'Partial';

        result.push({
          trade,
          required: reqCount,
          attached: attachedCount,
          remaining: Math.max(0, remaining),
          status
        });
      });
      return result;
    }

    // ── Sailor Attachment History with Locations ──
    getSailorAttachmentHistory(officialNumber) {
      const atts = this._state.attachments.filter(a => a.official_number === officialNumber);
      return atts.map(a => {
        const p = this.getProject(a.project_id);
        return {
          id: a.id,
          project_id: a.project_id,
          project_title: p ? p.title : a.project_id,
          location: p ? p.location : 'Site',
          category: p ? p.category : 'General',
          from_date: a.from_date,
          to_date: a.to_date,
          days_attached: a.days_attached || 1,
          status: a.status
        };
      }).sort((a,b) => new Date(b.from_date) - new Date(a.from_date));
    }

    // ── Equal Opportunity & Anti-Bribery Rotation Metrics ──
    getSailorFairnessMetrics(officialNumber) {
      const history = this.getSailorAttachmentHistory(officialNumber);
      let religiousDays = 0;
      let otherDays = 0;
      let religiousProjectsCount = 0;

      history.forEach(h => {
        if (h.category === 'Religious') {
          religiousDays += (h.days_attached || 0);
          religiousProjectsCount++;
        } else {
          otherDays += (h.days_attached || 0);
        }
      });

      const totalDays = religiousDays + otherDays;
      let priorityLevel = 'High'; // High priority for religious project rotation if 0 days
      let priorityBadge = '⭐ High Rotation Priority (0 Religious Days)';
      let priorityClass = 'badge-priority-high';

      if (religiousDays > 60) {
        priorityLevel = 'Low';
        priorityBadge = '⚠️ Served >60 Days (Low Priority)';
        priorityClass = 'badge-priority-low';
      } else if (religiousDays > 0) {
        priorityLevel = 'Moderate';
        priorityBadge = `Served ${religiousDays} Days`;
        priorityClass = 'badge-priority-med';
      }

      return {
        officialNumber,
        religiousDays,
        otherDays,
        totalDays,
        religiousProjectsCount,
        priorityLevel,
        priorityBadge,
        priorityClass
      };
    }

    // ── Sorted Sailors for Rotation Fairness ──
    getSortedSailors(sortBy = 'least_religious', tradeFilter = 'ALL') {
      let pool = [...this._state.sailors];
      if (tradeFilter && tradeFilter !== 'ALL') {
        pool = pool.filter(s => s.trade === tradeFilter);
      }

      return pool.sort((a, b) => {
        const mA = this.getSailorFairnessMetrics(a.official_number);
        const mB = this.getSailorFairnessMetrics(b.official_number);

        if (sortBy === 'least_religious') {
          // Primary sort: Least religious days (Equal Opportunity Rotation)
          if (mA.religiousDays !== mB.religiousDays) {
            return mA.religiousDays - mB.religiousDays;
          }
          // Secondary sort: Least total days
          return mA.totalDays - mB.totalDays;
        } else if (sortBy === 'least_total') {
          return mA.totalDays - mB.totalDays;
        } else if (sortBy === 'most_total') {
          return mB.totalDays - mA.totalDays;
        } else if (sortBy === 'trade') {
          return a.trade.localeCompare(b.trade);
        }
        return 0;
      });
    }

    // ── Project CRUD ──
    setProjects(list) { this._state.projects = list; this._save(); this._emit('PROJECTS_SET', list); }
    
    addProject(p) {
      p.id = p.id || `SP-${Date.now()}`;
      p.created_at = new Date().toISOString();
      p.progress = p.progress || 0;
      p.job_card_cost = p.job_card_cost || 0;
      p.material_status = p.material_status || 'OK';
      p.status = p.status || 'Active';
      p.drive_links = p.drive_links || [];
      p.photos = p.photos || [];
      this._state.projects.push(p);
      this._save(); this._emit('PROJECT_ADDED', p);
    }
    
    updateProject(id, changes) {
      const idx = this._state.projects.findIndex(p => p.id === id);
      if (idx >= 0) { 
        Object.assign(this._state.projects[idx], changes); 
        this._save(); 
        this._emit('PROJECT_UPDATED', {id, changes}); 
      }
    }
    
    deleteProject(id) {
      this._state.projects = this._state.projects.filter(p => p.id !== id);
      this._state.attachments = this._state.attachments.filter(a => a.project_id !== id);
      this._state.jobCards = this._state.jobCards.filter(j => j.project_id !== id);
      this._state.documents = this._state.documents.filter(d => d.project_id !== id);
      this._state.weatherLogs = (this._state.weatherLogs || []).filter(w => w.project_id !== id);
      this._save(); this._emit('PROJECT_DELETED', id);
    }

    getProject(id) { return this._state.projects.find(p => p.id === id) || null; }
    
    getProjectsByCategory(cat) {
      if (!cat || cat === 'All') return this._state.projects;
      return this._state.projects.filter(p => p.category === cat);
    }

    getActiveProjects() { return this._state.projects.filter(p => p.status !== 'Completed'); }
    getCompletedProjects() { return this._state.projects.filter(p => p.status === 'Completed'); }

    // ── Weather Logs ──
    setWeatherLogs(list) { this._state.weatherLogs = list; this._save(); this._emit('WEATHER_SET', list); }
    addWeatherLog(entry) {
      entry.id = entry.id || `WL-${Date.now()}`;
      this._state.weatherLogs.push(entry);
      this._save();
      this._emit('WEATHER_ADDED', entry);
    }
    getWeatherLogsByProject(projectId) {
      return (this._state.weatherLogs || []).filter(w => w.project_id === projectId);
    }

    // ── Drive Links & Photos ──
    addDriveLink(projectId, linkObj) {
      const p = this.getProject(projectId);
      if (p) {
        p.drive_links = p.drive_links || [];
        p.drive_links.push(linkObj);
        this._save();
        this._emit('PROJECT_UPDATED', {id: projectId, changes: {drive_links: p.drive_links}});
      }
    }

    addPhotoAttachment(projectId, photoObj) {
      const p = this.getProject(projectId);
      if (p) {
        p.photos = p.photos || [];
        p.photos.push(photoObj);
        this._save();
        this._emit('PROJECT_UPDATED', {id: projectId, changes: {photos: p.photos}});
      }
    }

    // ── Labour Attachment CRUD ──
    setAttachments(list) { this._state.attachments = list; this._save(); this._emit('ATTACHMENTS_SET', list); }

    addAttachment(att) {
      att.id = att.id || `LA-${Date.now()}`;
      att.created_at = new Date().toISOString();
      if (att.from_date && att.to_date) {
        const d1 = new Date(att.from_date), d2 = new Date(att.to_date);
        att.days_attached = Math.max(1, Math.ceil((d2 - d1) / 86400000) + 1);
      }
      att.status = att.status || 'Active';
      this._state.attachments.push(att);
      this._save(); this._emit('ATTACHMENT_ADDED', att);
    }

    bulkAddAttachments(list) {
      list.forEach(att => {
        att.id = att.id || `LA-${Date.now()}-${Math.random().toString(36).substr(2,4)}`;
        if (att.from_date && att.to_date) {
          const d1 = new Date(att.from_date), d2 = new Date(att.to_date);
          att.days_attached = Math.max(1, Math.ceil((d2 - d1) / 86400000) + 1);
        }
        att.status = att.status || 'Active';
        this._state.attachments.push(att);
      });
      this._save(); this._emit('ATTACHMENTS_BULK', list);
    }

    updateAttachment(id, changes) {
      const idx = this._state.attachments.findIndex(a => a.id === id);
      if (idx >= 0) { 
        Object.assign(this._state.attachments[idx], changes);
        const a = this._state.attachments[idx];
        if (a.from_date && a.to_date) {
          const d1 = new Date(a.from_date), d2 = new Date(a.to_date);
          a.days_attached = Math.max(1, Math.ceil((d2 - d1) / 86400000) + 1);
        }
        this._save(); this._emit('ATTACHMENT_UPDATED', {id, changes}); 
      }
    }

    deleteAttachment(id) {
      this._state.attachments = this._state.attachments.filter(a => a.id !== id);
      this._save(); this._emit('ATTACHMENT_DELETED', id);
    }

    getAttachmentsByProject(projectId) { return this._state.attachments.filter(a => a.project_id === projectId); }
    getAttachmentsBySailor(officialNumber) { return this._state.attachments.filter(a => a.official_number === officialNumber); }

    getDailyTotals(startDate, endDate) {
      const totals = {};
      const start = new Date(startDate); start.setHours(0,0,0,0);
      const end   = new Date(endDate);   end.setHours(0,0,0,0);
      let cur = new Date(start);
      while (cur <= end) {
        const key = cur.toISOString().split('T')[0];
        totals[key] = 0;
        this._state.attachments.forEach(a => {
          const f = new Date(a.from_date); f.setHours(0,0,0,0);
          const t = new Date(a.to_date);   t.setHours(0,0,0,0);
          if (cur >= f && cur <= t) totals[key]++;
        });
        cur.setDate(cur.getDate() + 1);
      }
      return totals;
    }

    getHeadcountByDate(dateStr) {
      const d = new Date(dateStr); d.setHours(0,0,0,0);
      const result = {};
      this._state.attachments.forEach(a => {
        const from = new Date(a.from_date); from.setHours(0,0,0,0);
        const to   = new Date(a.to_date);   to.setHours(0,0,0,0);
        if (d >= from && d <= to) {
          result[a.project_id] = (result[a.project_id] || 0) + 1;
        }
      });
      return result;
    }

    // ── Job Cards & Documents ──
    setJobCards(list) { this._state.jobCards = list; this._save(); this._emit('JOB_CARDS_SET', list); }
    addJobCard(jc) { jc.id = jc.id || `JC-${Date.now()}`; this._state.jobCards.push(jc); this._save(); this._emit('JOB_CARD_ADDED', jc); }
    getJobCardsByProject(pid) { return this._state.jobCards.filter(j => j.project_id === pid); }

    setDocuments(list) { this._state.documents = list; this._save(); this._emit('DOCUMENTS_SET', list); }
    addDocument(doc) { doc.id = doc.id || `DOC-${Date.now()}`; this._state.documents.push(doc); this._save(); this._emit('DOC_ADDED', doc); }
    getDocumentsByProject(pid) { return this._state.documents.filter(d => d.project_id === pid); }

    setSailors(list) { this._state.sailors = list; this._emit('SAILORS_SET', list); }

    setGanttZoom(z) { this._state.ganttZoom = z; this._save(); this._emit('ZOOM_CHANGED', z); }
    setGanttStartYear(yr) { this._state.ganttStartYear = yr; this._save(); this._emit('GANTT_YEAR_CHANGED', yr); }
    setActiveCategory(c) { this._state.activeCategory = c; this._emit('CATEGORY_CHANGED', c); }

    _save() {
      try {
        const { projects, attachments, jobCards, documents, weatherLogs, users, activeUserId, ganttZoom, ganttStartYear } = this._state;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          projects, attachments, jobCards, documents, weatherLogs, users, activeUserId, ganttZoom, ganttStartYear, v: 4
        }));
      } catch(e) { console.warn('SPS Store save failed:', e); }
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          if (d.v === 4) {
            this._state.projects       = d.projects       || [];
            this._state.attachments    = d.attachments    || [];
            this._state.jobCards       = d.jobCards       || [];
            this._state.documents      = d.documents      || [];
            this._state.weatherLogs    = d.weatherLogs    || [];
            this._state.users          = d.users          || this._state.users;
            this._state.activeUserId   = d.activeUserId   || 'U001';
            this._state.ganttZoom      = d.ganttZoom      || 'Weeks';
            this._state.ganttStartYear = d.ganttStartYear || 2026;
            this._loaded = true;
            return true;
          }
        }
      } catch(e) { console.warn('SPS Store load failed:', e); }
      return false;
    }

    clearAll() { localStorage.removeItem(STORAGE_KEY); }
  }

  window.spsStore = new SPSStore();
})();
