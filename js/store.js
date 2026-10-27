// ============================================================
// SPS — Central State Store
// Manages Projects, Attachments, Job Cards, Documents, Sailors,
// Weather Logs, User Profiles, Active Roles, Trade Quotas,
// and Equal Opportunity Fairness Rotation Metrics
// ============================================================
(function() {
  'use strict';

  const STORAGE_KEY = 'cmsys_project_v6_state';

  const NAVAL_ROLES = [
    { id: 'admin',     name: 'Admin',                 code: 'ADMIN',     level: 1, desc: 'Full System Administrator — All Privileges' },
    { id: 'cced_e',    name: 'CCED (E)',              code: 'CCED(E)',   level: 2, desc: 'Chief Civil Engineer Department (East)' },
    { id: 'cceo_e',    name: 'CCEO (E)',              code: 'CCEO(E)',   level: 2, desc: 'Chief Civil Engineer Officer (East)' },
    { id: 'sce_ww',    name: 'SCE (W/W)',             code: 'SCE(W/W)',  level: 3, desc: 'Senior Civil Engineer (Water Works / Works)' },
    { id: 'ce_ww',     name: 'CE (W/W)',              code: 'CE(W/W)',   level: 3, desc: 'Civil Engineer' },
    { id: 'artificers',name: 'Artificers',           code: 'ARTIFICER', level: 4, desc: 'Chief / Senior Artificers & Technical Supervision' },
    { id: 'incharge',  name: 'Incharge',              code: 'INCHARGE',  level: 5, desc: 'Site In-Charge Officer & Petty Officers' }
  ];

  const CMSYS_OFFICERS_DEFAULT = [
    { id: 'OFF-001', username: 'kmau.kahandawa', alt_usernames: ['KMAU Kahandawa', 'kmau', 'admin'], name: 'Lt Cdr KMAU Kahandawa', rank: 'Lt Commander', serviceNo: 'NRC 3542', appointment: 'SCE (W/W) & System Administrator', department: 'CSLOG / CE', category: 'Officer', role: 'admin', seniority: 1, email: 'kmau.kahandawa@navy.lk', phone: '071-8849201', officeNo: '026-2224501', status: 'Active', assignedProjects: ['ALL', 'NSH', 'EFS', 'ANDAMKULAM', 'SOBA ISLAND'] },
    { id: 'OFF-002', username: 'bgl.balasuriya', alt_usernames: ['BGL Balasuriya', 'balasuriya'], name: 'Capt (S) BGL Balasuriya', rank: 'Captain (S)', serviceNo: 'NRC 1843', appointment: 'CCED (East)', department: 'Civil Engineering', category: 'Officer', role: 'cced_e', seniority: 2, email: 'cced.east@navy.lk', phone: '071-2244101', officeNo: '026-2224500', status: 'Active', assignedProjects: ['ALL', 'LMS', 'NSH', 'NELUGALA TEMPLE', 'KUTTIYARAMA'] },
    { id: 'OFF-003', username: 'r.perera', alt_usernames: ['Cdr R. Perera', 'rperera'], name: 'Cdr R. Perera', rank: 'Commander', serviceNo: 'SVC/1234', appointment: 'CSLOG', department: 'CSLOG', category: 'Officer', role: 'cceo_e', seniority: 3, email: 'cslog.east@navy.lk', phone: '071-3345102', officeNo: '026-2224510', status: 'Active', assignedProjects: ['NSH', 'Vote 2104 Projects'] },
    { id: 'OFF-004', username: 'a.wickrama', alt_usernames: ['Lt Cdr A. Wickrama', 'awickrama'], name: 'Lt Cdr A. Wickrama', rank: 'Lt Commander', serviceNo: 'SVC/2222', appointment: 'CCEO (East)', department: 'Civil Engineering', category: 'Officer', role: 'cceo_e', seniority: 4, email: 'cceo.east@navy.lk', phone: '071-4456103', officeNo: '026-2224512', status: 'Active', assignedProjects: ['Vote 2001', 'Vote 2506', 'ANDAMKULAM'] },
    { id: 'OFF-005', username: 'k.silva', alt_usernames: ['Lt Cdr K. Silva', 'ksilva'], name: 'Lt Cdr K. Silva', rank: 'Lt Commander', serviceNo: 'SVC/3456', appointment: 'ASO (East)', department: 'CSLOG', category: 'Officer', role: 'cceo_e', seniority: 5, email: 'aso.east@navy.lk', phone: '071-5567104', officeNo: '026-2224515', status: 'Active', assignedProjects: ['Store Yard', 'General Stores', 'Procurement Pipeline'] },
    { id: 'OFF-006', username: 'm.fernando', alt_usernames: ['Lt M. Fernando', 'mfernando'], name: 'Lt M. Fernando', rank: 'Lieutenant', serviceNo: 'SVC/2345', appointment: 'CLOGD', department: 'CSLOG', category: 'Officer', role: 'ce_ww', seniority: 6, email: 'clogd.dockyard@navy.lk', phone: '071-6678105', officeNo: '026-2224520', status: 'Active', assignedProjects: ['EFS', 'SSSO Main Gate'] },
    { id: 'OFF-007', username: 'd.rajapaksa', alt_usernames: ['Lt D. Rajapaksa', 'drajapaksa'], name: 'Lt D. Rajapaksa', rank: 'Lieutenant', serviceNo: 'SVC/3333', appointment: 'SCE (Marine)', department: 'Civil Engineering', category: 'Officer', role: 'sce_ww', seniority: 7, email: 'sce.marine@navy.lk', phone: '071-7789106', officeNo: '026-2224522', status: 'Active', assignedProjects: ['SGP', 'Guide Pier', 'Floating Dock'] },
    { id: 'OFF-008', username: 'n.gunawardena', alt_usernames: ['Lt N. Gunawardena', 'ngunawardena'], name: 'Lt N. Gunawardena', rank: 'Lieutenant', serviceNo: 'SVC/4444', appointment: 'SCE (Planning & Progress)', department: 'Civil Engineering', category: 'Officer', role: 'sce_ww', seniority: 8, email: 'sce.pp@navy.lk', phone: '071-8890107', officeNo: '026-2224525', status: 'Active', assignedProjects: ['WBS Planning', 'Vote Monitoring', 'Gantt Tracking'] },
    { id: 'OFF-009', username: 's.bandara', alt_usernames: ['Lt Cdr S. Bandara', 'sbandara'], name: 'Lt Cdr S. Bandara', rank: 'Lt Commander', serviceNo: 'NRX 1042', appointment: 'APO (East)', department: 'CSLOG', category: 'Officer', role: 'cceo_e', seniority: 9, email: 'apo.east@navy.lk', phone: '071-9901108', officeNo: '026-2224530', status: 'Active', assignedProjects: ['Procurement Files', 'Tenders', 'Vote 2103'] },
    { id: 'OFF-010', username: 't.jayasuriya', alt_usernames: ['Capt T. Jayasuriya', 'tjayasuriya'], name: 'Capt T. Jayasuriya', rank: 'Captain', serviceNo: 'NRC 1120', appointment: 'Project Director LMS', department: 'CE / Naval Academy', category: 'Officer', role: 'cced_e', seniority: 10, email: 'lms.project@navy.lk', phone: '071-1122334', officeNo: '026-2224535', status: 'Active', assignedProjects: ['LMS (Vote 2104)'] },
    { id: 'OFF-011', username: 'cbl.chandradasa', alt_usernames: ['Lt Cdr CBL Chandradasa', 'chandradasa'], name: 'Lt Cdr CBL Chandradasa', rank: 'Lt Commander', serviceNo: 'NRX 2890', appointment: 'Housing Project Director', department: 'Civil Engineering', category: 'Officer', role: 'ce_ww', seniority: 11, email: 'chandradasa.cbl@navy.lk', phone: '071-2233445', officeNo: '026-2224540', status: 'Active', assignedProjects: ['SP-HOU-005', 'Naval Welfare Housing'] },
    { id: 'OFF-012', username: 'dulanjana', alt_usernames: ['Lt Cdr Dulanjana', 'dulanjana.nrx'], name: 'Lt Cdr Dulanjana', rank: 'Lt Commander', serviceNo: 'NRX 3467', appointment: 'Welfare Housing Officer', department: 'Civil Engineering', category: 'Officer', role: 'ce_ww', seniority: 12, email: 'dulanjana.nrx3467@navy.lk', phone: '071-3344556', officeNo: '026-2224542', status: 'Active', assignedProjects: ['SP-HOU-006', 'Welfare Housing'] }
  ];

  class SPSStore {
    constructor() {
      this._state = {
        projects: [],
        navalProjects: [],
        procurementFiles: [],
        attachments: [],
        jobCards: [],
        documents: [],
        sailors: [],
        availability: {},
        outProjects: {},
        weatherLogs: [],
        users: JSON.parse(JSON.stringify(CMSYS_OFFICERS_DEFAULT)),
        activeUserId: 'OFF-001',
        ganttZoom: 'Weeks',
        ganttStartYear: 2026,
        activeCategory: 'All',
        activeNavalVote: 'All',
        lastUpdated: null
      };
      this._subs = [];
      this._loaded = false;
    }

    // ── Subscriptions ──
    subscribe(fn) { this._subs.push(fn); return () => { this._subs = this._subs.filter(s => s !== fn); }; }
    _emit(event, data) { this._subs.forEach(fn => { try { fn(event, data, this._state); } catch(e){} }); }

    // ── State Getters ──
    get projects()         { return this._state.projects; }
    get navalProjects()    { return this._state.navalProjects || []; }
    get procurementFiles() { return this._state.procurementFiles || []; }
    get attachments()      { return this._state.attachments; }
    get jobCards()         { return this._state.jobCards; }
    get sailors() {
      const map = new Map();
      const rawSailors = Array.isArray(this._state.sailors)
        ? this._state.sailors
        : (this._state.sailors && typeof this._state.sailors === 'object' ? Object.values(this._state.sailors) : []);
      rawSailors.forEach(s => {
        if (s && (s.official_number || s.off_no)) {
          const rawOff = s.official_number || s.off_no || '';
          const normKey = rawOff.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          const cleanNo = rawOff.replace(/[^a-zA-Z0-9]/g, '');
          const normalized = {
            ...s,
            official_number: rawOff,
            off_no: rawOff,
            cleanNo: cleanNo,
            name: s.name || rawOff,
            rank: s.rank || 'AB',
            trade: (s.trade || 'MA').toUpperCase(),
            district: s.district || s.home_location || s.city || 'Trincomalee',
            home_location: s.district || s.home_location || s.city || 'Trincomalee',
            victualing_type: s.victualing_type || 'V/In',
            performance_score: parseFloat(s.performance_score || s.rating || 8.5),
            photo_url: s.photo_url || `images/${cleanNo}.JPG`
          };
          map.set(normKey, normalized);
        }
      });
      (this._state.attachments || []).forEach(a => {
        if (a && a.official_number) {
          const normKey = a.official_number.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          if (!map.has(normKey)) {
            const cleanNo = a.official_number.replace(/[^a-zA-Z0-9]/g, '');
            map.set(normKey, {
              id: a.cmsys_sailor_id || a.official_number,
              _fbKey: a.cmsys_sailor_id || normKey,
              cmsys_sailor_id: a.cmsys_sailor_id || normKey,
              official_number: a.official_number,
              off_no: a.official_number,
              cleanNo: cleanNo,
              name: a.name || a.official_number,
              rank: a.rank || 'AB',
              trade: (a.trade || 'MA').toUpperCase(),
              roll: a.official_number.startsWith('VAS') ? 'VAS' : (a.official_number.startsWith('EC') ? 'EC' : 'REG'),
              category: a.category || 'Regular',
              zone: 'Special Projects',
              status: a.status || 'Active',
              performance_score: 8.5,
              victualing_type: 'V/In',
              district: 'Trincomalee',
              home_location: 'Trincomalee',
              photo_url: `images/${cleanNo}.JPG`
            });
          }
        }
      });
      return Array.from(map.values());
    }
    get availability()     { return this._state.availability || {}; }
    get outProjects()      { return this._state.outProjects || {}; }

    getSailor(query) {
      if (!query) return null;
      const clean = String(query).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const list = this.sailors;
      return list.find(s => {
        const sOff = (s.official_number || s.off_no || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        if (sOff === clean) return true;
        if (s._fbKey && s._fbKey === query) return true;
        if (s.id && String(s.id) === String(query)) return true;
        if (s.cmsys_sailor_id && String(s.cmsys_sailor_id) === String(query)) return true;
        if (s.name && s.name.toUpperCase() === String(query).toUpperCase()) return true;
        return false;
      }) || null;
    }

    getSailorPhoto(sailorOrOffNo) {
      const s = typeof sailorOrOffNo === 'object' ? sailorOrOffNo : this.getSailor(sailorOrOffNo);
      const off = s ? (s.official_number || s.off_no || '') : String(sailorOrOffNo || '');
      const cleanNo = off.replace(/[^a-zA-Z0-9]/g, '');
      return {
        url: `images/${cleanNo}.JPG`,
        cleanNo: cleanNo,
        fallbackRank: s ? s.rank : 'AB',
        fallbackTrade: s ? s.trade : 'MA'
      };
    }
    get users()            { return this._state.users; }
    get officers()         { return this._state.users.filter(u => u.category === 'Officer'); }
    get activeUserId()     { return this._state.activeUserId; }
    get ganttZoom()        { return this._state.ganttZoom; }
    get ganttStartYear()   { return this._state.ganttStartYear || 2026; }
    get activeCategory()   { return this._state.activeCategory; }
    get activeNavalVote()  { return this._state.activeNavalVote || 'All'; }
    get navalRoles()       { return NAVAL_ROLES; }
    get state()            { return this._state; }

    get currentUser() {
      return this._state.users.find(u => u.id === this._state.activeUserId) || this._state.users[0];
    }

    get activeOfficer() {
      return this.currentUser;
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

    setOfficers(list) {
      if (Array.isArray(list) && list.length > 0) {
        this._state.users = list;
        if (!this._state.users.some(u => u.id === this._state.activeUserId)) {
          this._state.activeUserId = this._state.users[0].id;
        }
        this._save();
        this._emit('OFFICERS_SET', list);
      }
    }

    addUserProfile(user) {
      user.id = user.id || `OFF-${Date.now().toString().slice(-4)}`;
      user.category = 'Officer';
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

    // ── Sailor Attachment History with Locations, Out Projects & Victualing ──
    getSailorAttachmentHistory(officialNumber) {
      const s = this.getSailor(officialNumber);
      const cleanNo = (officialNumber || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const sFbKey = s ? (s._fbKey || s.cmsys_sailor_id || '') : '';

      const atts = this._state.attachments.filter(a => {
        const aClean = (a.official_number || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return aClean === cleanNo || (sFbKey && a.cmsys_sailor_id === sFbKey);
      });

      const list = atts.map(a => {
        const p = this.getProject(a.project_id);
        const cat = p ? p.category : (a.category || 'General');
        const isOut = (p && (cat === 'Religious' || cat === 'Housing' || p.is_out_project)) || 
                      (s && s.victualing_type === 'V/Out') || 
                      a.victualing === 'V/Out' || a.victualing_status === 'V/Out';
        return {
          id: a.id,
          project_id: a.project_id,
          project_title: p ? p.title : a.project_id,
          location: p ? p.location : 'Site',
          category: cat,
          from_date: a.from_date || a.start_date,
          to_date: a.to_date || a.end_date,
          days_attached: a.days_attached || 1,
          status: a.status || 'Active',
          isOutProject: Boolean(isOut),
          victualing: isOut ? 'V/Out' : 'V/In',
          duty_role: a.duty_role || 'Tradesman'
        };
      });

      // Also incorporate assignments from CMSys out_projects
      if (sFbKey && this._state.outProjects) {
        Object.entries(this._state.outProjects).forEach(([opId, op]) => {
          if (op && op.assigned_sailors && op.assigned_sailors[sFbKey]) {
            const assign = op.assigned_sailors[sFbKey];
            const assignDate = assign.assigned_date || '2026-08-01';
            if (!list.some(item => item.project_title === op.name)) {
              list.push({
                id: `OP-${opId}`,
                project_id: opId,
                project_title: op.name,
                location: op.location || 'External Site',
                category: op.zone || 'Out Project',
                from_date: assignDate,
                to_date: '2026-11-30',
                days_attached: 30,
                status: op.status || 'Active',
                isOutProject: true,
                victualing: 'V/Out',
                duty_role: 'Site Tradesman'
              });
            }
          }
        });
      }

      return list.sort((a,b) => new Date(b.from_date) - new Date(a.from_date));
    }

    // ── Period Metrics for Calendar & Master Personnel Register Table ──
    getSailorPeriodMetrics(officialNumber, startDate, endDate) {
      const s = this.getSailor(officialNumber);
      if (!s) {
        return {
          officialNumber, name: officialNumber, rank: 'AB', trade: 'MA',
          homeLocation: 'Trincomalee', district: 'Trincomalee', performanceScore: 7.5,
          victualingType: 'V/In', isVictualingOut: false,
          deployedDaysVicIn: 0, deployedDaysVicOut: 0, totalDeployedDays: 0,
          sickDays: 0, sickIncidents: [], leaveDays: 0, leavePeriods: 'None',
          otherDays: 0, calendarDayMap: {}, history: []
        };
      }

      const sFbKey = s._fbKey || s.cmsys_sailor_id || '';
      const history = this.getSailorAttachmentHistory(s.official_number);

      const pStart = new Date(startDate); pStart.setHours(0,0,0,0);
      const pEnd   = new Date(endDate);   pEnd.setHours(0,0,0,0);

      let deployedDaysVicIn = 0;
      let deployedDaysVicOut = 0;
      let sickDays = 0;
      let leaveDays = 0;
      let otherDays = 0;
      const leaveDates = [];
      const sickIncidents = [];
      const calendarDayMap = {};

      const cur = new Date(pStart);
      while (cur <= pEnd) {
        const curStr = cur.toISOString().split('T')[0];
        const ym = curStr.slice(0, 7);
        const dayNum = cur.getDate();

        let dayType = null;
        let dayStatus = null;
        let dayDetails = null;
        let isOutProj = false;
        let victualing = 'V/In';

        // 1. Check availability status from CMSys RTDB
        const avStatus = this._state.availability?.[ym]?.[dayNum]?.[sFbKey];
        if (avStatus) {
          const st = String(avStatus).toUpperCase().trim();
          if (st === 'L' || st === 'SL') {
            dayType = 'leave';
            dayStatus = st;
            leaveDays++;
            leaveDates.push(curStr);
          } else if (st === 'SICK' || st === 'ADM' || st === 'SIQ' || st === 'S/R' || st === 'M/D') {
            dayType = 'sick';
            dayStatus = st;
            sickDays++;
            sickIncidents.push({ date: curStr, category: st });
          } else if (st === 'T/D') {
            dayType = 'duty';
            dayStatus = 'T/D';
          } else if (st === 'R/D') {
            dayType = 'other';
            dayStatus = 'R/D';
            otherDays++;
          }
        }

        // 2. Check Project Attachments & Out Projects
        const matchingAtt = history.find(h => {
          const f = new Date(h.from_date); f.setHours(0,0,0,0);
          const t = new Date(h.to_date);   t.setHours(0,0,0,0);
          return cur >= f && cur <= t;
        });

        if (matchingAtt) {
          isOutProj = matchingAtt.isOutProject;
          victualing = matchingAtt.victualing;
          if (dayType !== 'leave' && dayType !== 'sick') {
            if (isOutProj || victualing === 'V/Out') {
              dayType = 'vout';
              deployedDaysVicOut++;
            } else {
              dayType = 'vin';
              deployedDaysVicIn++;
            }
          }
          dayDetails = matchingAtt;
        } else if (dayType === 'duty') {
          if (s.victualing_type === 'V/Out') {
            dayType = 'vout';
            deployedDaysVicOut++;
            victualing = 'V/Out';
            isOutProj = true;
          } else {
            dayType = 'vin';
            deployedDaysVicIn++;
          }
        }

        calendarDayMap[curStr] = {
          date: curStr,
          day: dayNum,
          type: dayType,
          status: dayStatus,
          isOutProject: isOutProj,
          victualing: victualing,
          details: dayDetails
        };

        cur.setDate(cur.getDate() + 1);
      }

      const leavePeriods = this._formatDateRanges(leaveDates);
      const totalDeployedDays = deployedDaysVicIn + deployedDaysVicOut;
      const isCurrentlyVOut = (s.victualing_type === 'V/Out') || history.some(h => {
        const today = new Date(); today.setHours(0,0,0,0);
        return new Date(h.to_date) >= today && h.victualing === 'V/Out';
      });

      return {
        officialNumber: s.official_number,
        name: s.name,
        rank: s.rank,
        trade: s.trade,
        roll: s.roll,
        homeLocation: s.district || s.city || 'Trincomalee',
        district: s.district || s.city || 'Trincomalee',
        performanceScore: s.performance_score || 8.5,
        victualingType: isCurrentlyVOut ? 'V/Out' : 'V/In',
        isVictualingOut: isCurrentlyVOut,
        deployedDaysVicIn,
        deployedDaysVicOut,
        totalDeployedDays,
        sickDays,
        sickIncidents,
        leaveDays,
        leavePeriods,
        otherDays,
        calendarDayMap,
        history,
        sailor: s
      };
    }

    _formatDateRanges(dates) {
      if (!dates || dates.length === 0) return 'None';
      const sorted = [...dates].sort();
      const ranges = [];
      let start = sorted[0], prev = sorted[0], count = 1;

      for (let i = 1; i < sorted.length; i++) {
        const dCurr = new Date(sorted[i]);
        const dPrev = new Date(prev);
        const diff = Math.round((dCurr - dPrev) / 86400000);
        if (diff === 1) {
          prev = sorted[i];
          count++;
        } else {
          ranges.push(count > 1 ? `${start.slice(5)} → ${prev.slice(5)} (${count}d)` : `${start.slice(5)} (1d)`);
          start = prev = sorted[i];
          count = 1;
        }
      }
      ranges.push(count > 1 ? `${start.slice(5)} → ${prev.slice(5)} (${count}d)` : `${start.slice(5)} (1d)`);
      return ranges.join(', ');
    }

    // ── Master Personnel Register: Multi-Attribute Query & Sorter Engine ──
    getAllSailorsPeriodSummary(startDate, endDate, filters = {}, sortField = 'total_deployed', sortOrder = 'desc') {
      const list = this.sailors;
      const { search = '', trade = 'ALL', victualing = 'ALL', status = 'ALL' } = filters;
      const cleanSearch = (search || '').toLowerCase().trim();

      let results = [];
      list.forEach(s => {
        if (trade !== 'ALL' && s.trade !== trade) return;

        const metrics = this.getSailorPeriodMetrics(s.official_number, startDate, endDate);

        // Victualing filter
        if (victualing === 'V/Out' && !metrics.isVictualingOut && metrics.deployedDaysVicOut === 0) return;
        if (victualing === 'V/In' && (metrics.isVictualingOut || metrics.deployedDaysVicOut > 0) && metrics.deployedDaysVicIn === 0) return;

        // Status filter
        if (status === 'attached' && metrics.totalDeployedDays === 0) return;
        if (status === 'leave' && metrics.leaveDays === 0) return;
        if (status === 'sick' && metrics.sickDays === 0) return;

        // Search text
        if (cleanSearch) {
          const haystack = `${s.name} ${s.official_number} ${s.trade} ${s.rank} ${metrics.homeLocation}`.toLowerCase();
          if (!haystack.includes(cleanSearch)) return;
        }

        results.push(metrics);
      });

      // Sorting
      results.sort((a, b) => {
        let valA, valB;
        switch (sortField) {
          case 'name':
            valA = a.name; valB = b.name;
            return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          case 'official_number':
            valA = a.officialNumber; valB = b.officialNumber;
            return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          case 'trade':
            valA = a.trade; valB = b.trade;
            return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          case 'home_location':
            valA = a.homeLocation; valB = b.homeLocation;
            return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          case 'vic_in':
            valA = a.deployedDaysVicIn; valB = b.deployedDaysVicIn;
            break;
          case 'vic_out':
            valA = a.deployedDaysVicOut; valB = b.deployedDaysVicOut;
            break;
          case 'total_deployed':
            valA = a.totalDeployedDays; valB = b.totalDeployedDays;
            break;
          case 'sick_days':
            valA = a.sickDays; valB = b.sickDays;
            break;
          case 'leave_days':
            valA = a.leaveDays; valB = b.leaveDays;
            break;
          case 'performance':
            valA = a.performanceScore; valB = b.performanceScore;
            break;
          default:
            valA = a.totalDeployedDays; valB = b.totalDeployedDays;
        }
        return sortOrder === 'asc' ? (valA - valB) : (valB - valA);
      });

      return results;
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
      let pool = [...this.sailors];
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

    // ── Naval Projects CRUD ──
    setNavalProjects(list) { 
      this._state.navalProjects = list || []; 
      this._save(); 
      this._emit('NAVAL_PROJECTS_SET', list); 
    }

    addNavalProject(p) {
      p.id = p.id || `NP-${Date.now()}`;
      p.code = p.code || p.nameAbbreviation || `NP-${Date.now().toString().slice(-4)}`;
      p.created_at = new Date().toISOString();
      p.progress = p.progress || 0;
      p.voteAllocation = Number(p.voteAllocation || 0);
      p.committed = Number(p.committed || 0);
      p.actualSpent = Number(p.actualSpent || 0);
      p.files = p.files || [];
      p.status = p.status || 'Active';
      this._state.navalProjects.push(p);
      this._save(); 
      this._emit('NAVAL_PROJECT_ADDED', p);
    }

    updateNavalProject(id, changes) {
      const idx = this._state.navalProjects.findIndex(p => p.id === id || p.code === id);
      if (idx >= 0) {
        Object.assign(this._state.navalProjects[idx], changes);
        this._save();
        this._emit('NAVAL_PROJECT_UPDATED', { id, changes });
      }
    }

    deleteNavalProject(id) {
      this._state.navalProjects = this._state.navalProjects.filter(p => p.id !== id && p.code !== id);
      this._state.procurementFiles = this._state.procurementFiles.filter(f => f.projectId !== id && f.projectCode !== id);
      this._save(); 
      this._emit('NAVAL_PROJECT_DELETED', id);
    }

    getNavalProject(id) {
      return this._state.navalProjects.find(p => p.id === id || p.code === id) || null;
    }

    getNavalProjectsByVote(vote) {
      if (!vote || vote === 'All') return this._state.navalProjects;
      return this._state.navalProjects.filter(p => {
        if (!p.voteNumber) return false;
        if (vote === 'Non-Naval') return p.voteNumber.includes('NON-NAVAL') || p.financialMean === 'Non-Public Fund' || p.financialMean === 'Contractual';
        return p.voteNumber.includes(vote);
      });
    }

    setActiveNavalVote(vote) {
      this._state.activeNavalVote = vote;
      this._emit('NAVAL_VOTE_CHANGED', vote);
    }

    // ── Procurement Files CRUD ──
    setProcurementFiles(list) {
      this._state.procurementFiles = list || [];
      this._save();
      this._emit('PROCUREMENT_FILES_SET', list);
    }

    addProcurementFile(file) {
      file.id = file.id || `PF-${Date.now()}`;
      file.created_at = new Date().toISOString();
      file.fileCost = Number(file.fileCost || (file.qty * file.unitPrice) || 0);
      file.presentPosition = file.presentPosition || 'Processing File';
      this._state.procurementFiles.push(file);

      // Also attach to project in navalProjects if present
      const proj = this.getNavalProject(file.projectId);
      if (proj) {
        proj.files = proj.files || [];
        proj.files.push(file);
        proj.filesCount = proj.files.length;
        proj.committed = (proj.committed || 0) + file.fileCost;
      }

      this._save();
      this._emit('PROCUREMENT_FILE_ADDED', file);
    }

    updateProcurementFile(id, changes) {
      const idx = this._state.procurementFiles.findIndex(f => f.id === id);
      if (idx >= 0) {
        Object.assign(this._state.procurementFiles[idx], changes);
        // Also update inside navalProject files array
        const pId = this._state.procurementFiles[idx].projectId;
        const proj = this.getNavalProject(pId);
        if (proj && proj.files) {
          const fIdx = proj.files.findIndex(f => f.id === id);
          if (fIdx >= 0) Object.assign(proj.files[fIdx], changes);
        }
        this._save();
        this._emit('PROCUREMENT_FILE_UPDATED', { id, changes });
      }
    }

    deleteProcurementFile(id) {
      const target = this._state.procurementFiles.find(f => f.id === id);
      if (target) {
        const proj = this.getNavalProject(target.projectId);
        if (proj && proj.files) {
          proj.files = proj.files.filter(f => f.id !== id);
          proj.filesCount = proj.files.length;
        }
      }
      this._state.procurementFiles = this._state.procurementFiles.filter(f => f.id !== id);
      this._save();
      this._emit('PROCUREMENT_FILE_DELETED', id);
    }

    getProcurementFilesByProject(projectId) {
      return this._state.procurementFiles.filter(f => f.projectId === projectId || f.projectCode === projectId);
    }

    // ── Strategic Vote Statistics ──
    getVoteStatistics() {
      const projects = this._state.navalProjects;
      const votes = [
        { id: '2104', label: 'Vote 2104 — Capital Works & Constructions', match: '2104', color: 'var(--vote-2104, #06b6d4)' },
        { id: '2001', label: 'Vote 2001 — Infrastructure Renovations', match: '2001', color: 'var(--vote-2001, #f59e0b)' },
        { id: '2506', label: 'Vote 2506 — Coastal & Marine Engineering', match: '2506', color: 'var(--vote-2506, #10b981)' },
        { id: '1303', label: 'Vote 1303 — Base & Station Maintenance', match: '1303', color: 'var(--vote-1303, #8b5cf6)' },
        { id: 'non_naval', label: 'Non-Naval / Welfare & Contractual Funds', match: 'NON-NAVAL', color: 'var(--vote-non, #ec4899)' },
        { id: '2103', label: 'Vote 2103 — Plant Machinery & Equipment', match: '2103', color: 'var(--vote-2103, #3b82f6)' }
      ];

      let grandTotalAlloc = 0;
      let grandTotalCommitted = 0;
      let grandTotalSpent = 0;
      let grandTotalProjects = projects.length;
      let grandTotalFiles = this._state.procurementFiles.length;

      const breakdown = votes.map(v => {
        const matching = projects.filter(p => {
          if (!p.voteNumber) return false;
          if (v.id === 'non_naval') return p.voteNumber.includes('NON-NAVAL') || p.financialMean === 'Non-Public Fund' || p.financialMean === 'Contractual';
          return p.voteNumber.includes(v.match);
        });

        const alloc = matching.reduce((sum, p) => sum + Number(p.voteAllocation || 0), 0);
        const committed = matching.reduce((sum, p) => sum + Number(p.committed || 0), 0);
        const spent = matching.reduce((sum, p) => sum + Number(p.actualSpent || 0), 0);
        const balance = Math.max(0, alloc - (committed + spent));
        const fileCount = matching.reduce((sum, p) => sum + (p.files ? p.files.length : 0), 0);

        grandTotalAlloc += alloc;
        grandTotalCommitted += committed;
        grandTotalSpent += spent;

        return {
          ...v,
          count: matching.length,
          allocation: alloc,
          committed,
          spent,
          balance,
          fileCount,
          percentCommitted: alloc > 0 ? ((committed / alloc) * 100).toFixed(1) : '0.0',
          percentSpent: alloc > 0 ? ((spent / alloc) * 100).toFixed(1) : '0.0'
        };
      });

      return {
        grandTotalAlloc,
        grandTotalCommitted,
        grandTotalSpent,
        grandTotalBalance: Math.max(0, grandTotalAlloc - (grandTotalCommitted + grandTotalSpent)),
        grandTotalProjects,
        grandTotalFiles,
        breakdown
      };
    }

    getActiveProjects() { return this._state.projects.filter(p => p.status !== 'Completed'); }
    getActiveProject()  { return this.getActiveProjects()[0] || this._state.projects[0]; }
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

    setSailors(list) {
      if (list && typeof list === 'object' && !Array.isArray(list)) {
        this._state.sailors = Object.keys(list).map(k => {
          const item = list[k];
          if (item && typeof item === 'object') {
            item._fbKey = item._fbKey || k;
            item.cmsys_sailor_id = item.cmsys_sailor_id || k;
          }
          return item;
        });
      } else {
        this._state.sailors = Array.isArray(list) ? list : [];
      }
      this._emit('SAILORS_SET', this._state.sailors);
    }
    setAvailability(av) { this._state.availability = av || {}; this._emit('AVAILABILITY_SET', this._state.availability); }
    setOutProjects(op) { this._state.outProjects = op || {}; this._emit('OUT_PROJECTS_SET', this._state.outProjects); }

    setGanttZoom(z) { this._state.ganttZoom = z; this._save(); this._emit('ZOOM_CHANGED', z); }
    setGanttStartYear(yr) { this._state.ganttStartYear = yr; this._save(); this._emit('GANTT_YEAR_CHANGED', yr); }
    setActiveCategory(c) { this._state.activeCategory = c; this._emit('CATEGORY_CHANGED', c); }

    _save() {
      try {
        const { projects, navalProjects, procurementFiles, attachments, jobCards, documents, weatherLogs, users, activeUserId, ganttZoom, ganttStartYear, activeCategory, activeNavalVote } = this._state;
        const serialized = JSON.stringify({
          projects, navalProjects, procurementFiles, attachments, jobCards, documents, weatherLogs, users, activeUserId, ganttZoom, ganttStartYear, activeCategory, activeNavalVote, v: 6
        });
        localStorage.setItem(STORAGE_KEY, serialized);
        localStorage.setItem('cmsys_project_master_state', serialized);
      } catch(e) { console.warn('CMSys Store save failed:', e); }
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          if (d.v === 6) {
            this._state.projects         = d.projects         || [];
            this._state.navalProjects    = d.navalProjects    || [];
            this._state.procurementFiles = d.procurementFiles || [];
            this._state.attachments      = d.attachments      || [];
            this._state.jobCards         = d.jobCards         || [];
            this._state.documents        = d.documents        || [];
            this._state.weatherLogs      = d.weatherLogs      || [];
            // Ensure users only has official officers (filter out any old dummy U001 entries)
            if (d.users && Array.isArray(d.users) && d.users.length > 0 && d.users[0].id.startsWith('OFF-')) {
              this._state.users          = d.users;
            } else {
              this._state.users          = JSON.parse(JSON.stringify(CMSYS_OFFICERS_DEFAULT));
            }
            this._state.activeUserId     = (d.activeUserId && d.activeUserId.startsWith('OFF-')) ? d.activeUserId : 'OFF-001';
            this._state.ganttZoom        = d.ganttZoom        || 'Weeks';
            this._state.ganttStartYear   = d.ganttStartYear   || 2026;
            this._state.activeCategory   = d.activeCategory   || 'All';
            this._state.activeNavalVote  = d.activeNavalVote  || 'All';
            this._loaded = true;
            return true;
          }
        }
      } catch(e) { console.warn('CMSys Store load failed:', e); }
      return false;
    }

    clearAll() { localStorage.removeItem(STORAGE_KEY); }
  }

  window.spsStore = new SPSStore();
})();
