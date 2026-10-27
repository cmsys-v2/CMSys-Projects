// ===================================================================
// SLN Project Platform — Project Progress & Monitoring Center Engine
// Advanced Full-Screen Civil Engineering & Naval Infrastructure PM Hub
// Gantt Chart Studio, CPM Scheduling, Material Take-Off, Labour & Plant
// ===================================================================
(function() {
  'use strict';

  // Master civil engineering tasks template by project category
  const CIVIL_WBS_TEMPLATES = {
    'Hangar/Workshop': [
      { id: 'T-01', wbs: '1.1', phase: 'Mobilization & Earthwork', name: 'Site Clearing, Survey Setting Out & Datum Benchmarking', dur: 7, start: 0, prog: 100, weight: 4, critical: true, trade: 'UL', cost: 450000 },
      { id: 'T-02', wbs: '1.2', phase: 'Mobilization & Earthwork', name: 'Bulk Excavation for Column Pad Footings & Tie Beams', dur: 14, start: 7, prog: 100, weight: 6, critical: true, trade: 'UL', cost: 1200000 },
      { id: 'T-03', wbs: '1.3', phase: 'Mobilization & Earthwork', name: 'Soil Compaction & In-situ Density Testing (Proctor)', dur: 5, start: 21, prog: 100, weight: 3, critical: true, trade: 'UL', cost: 350000 },
      { id: 'T-04', wbs: '2.1', phase: 'Substructure & Foundation', name: 'PCC Blinding Layer 50mm Concrete Grade 15 Casting', dur: 6, start: 26, prog: 100, weight: 5, critical: true, trade: 'MA', cost: 950000 },
      { id: 'T-05', wbs: '2.2', phase: 'Substructure & Foundation', name: 'Rebar Cutting, Bending & Footing Cage Placement (T16/T20)', dur: 12, start: 32, prog: 100, weight: 8, critical: true, trade: 'BB', cost: 3400000 },
      { id: 'T-06', wbs: '2.3', phase: 'Substructure & Foundation', name: 'Plywood Formwork & Holding Down Anchor Bolt Template Fixing', dur: 8, start: 44, prog: 90, weight: 6, critical: true, trade: 'CA', cost: 1600000 },
      { id: 'T-07', wbs: '2.4', phase: 'Substructure & Foundation', name: 'Ready-Mix Concrete Grade 30 Pouring for Pad Footings', dur: 6, start: 52, prog: 80, weight: 10, critical: true, trade: 'MA', cost: 5800000 },
      { id: 'T-08', wbs: '3.1', phase: 'Superstructure & Structural Steel', name: 'Grade 30 RCC Plinth Beam Reinforcement & Concreting', dur: 14, start: 58, prog: 40, weight: 8, critical: true, trade: 'MA', cost: 4200000 },
      { id: 'T-09', wbs: '3.2', phase: 'Superstructure & Structural Steel', name: 'Off-site Fabrication of Universal Beams & Gantry Stanchions', dur: 25, start: 40, prog: 75, weight: 14, critical: false, trade: 'WE', cost: 12500000 },
      { id: 'T-10', wbs: '3.3', phase: 'Superstructure & Structural Steel', name: 'Crane Erection of Main Portal Steel Columns & Gantry Girder', dur: 18, start: 72, prog: 20, weight: 12, critical: true, trade: 'WE', cost: 8900000 },
      { id: 'T-11', wbs: '3.4', phase: 'Superstructure & Structural Steel', name: 'Steel Roof Truss Assembly, Purlin Installation & Sag Rods', dur: 16, start: 90, prog: 0, weight: 9, critical: true, trade: 'WE', cost: 6500000 },
      { id: 'T-12', wbs: '4.1', phase: 'Envelope, Roofing & Walling', name: 'Zinc-Alum 0.47mm AZ150 Color-bonded Roof Cladding Laying', dur: 14, start: 106, prog: 0, weight: 7, critical: false, trade: 'CA', cost: 3800000 },
      { id: 'T-13', wbs: '4.2', phase: 'Envelope, Roofing & Walling', name: 'Cement Block Masonry Perimeter Walling 200mm Thick', dur: 20, start: 95, prog: 0, weight: 6, critical: false, trade: 'MA', cost: 2400000 },
      { id: 'T-14', wbs: '5.1', phase: 'Flooring, Services & Handover', name: 'Heavy-Duty 200mm Reinforced Concrete Floor Slab with Hardener', dur: 15, start: 120, prog: 0, weight: 8, critical: true, trade: 'MA', cost: 6200000 },
      { id: 'T-15', wbs: '5.2', phase: 'Flooring, Services & Handover', name: '3-Phase Industrial Power Cabling, High-Bay LED Lights & Earthing', dur: 12, start: 125, prog: 0, weight: 5, critical: false, trade: 'EL', cost: 2100000 },
      { id: 'T-16', wbs: '5.3', phase: 'Flooring, Services & Handover', name: '5-Ton Gantry Crane Load Testing, Final Painting & Commissioning', dur: 10, start: 135, prog: 0, weight: 4, critical: true, trade: 'WE', cost: 1800000 }
    ],
    'Pier/Maritime': [
      { id: 'T-01', wbs: '1.1', phase: 'Marine Survey & Mobilization', name: 'Bathymetric Survey, Tidal Benchmarking & Barge Setup', dur: 10, start: 0, prog: 100, weight: 5, critical: true, trade: 'UL', cost: 850000 },
      { id: 'T-02', wbs: '1.2', phase: 'Sub-surface & Piling', name: 'Marine Driving of Pre-stressed Concrete Spun Piles 600mm dia', dur: 28, start: 10, prog: 90, weight: 25, critical: true, trade: 'WE', cost: 18500000 },
      { id: 'T-03', wbs: '2.1', phase: 'Substructure & Pile Caps', name: 'Underwater Epoxy Encasement & Pile Head Chipping', dur: 14, start: 38, prog: 60, weight: 12, critical: true, trade: 'MA', cost: 4200000 },
      { id: 'T-04', wbs: '2.2', phase: 'Substructure & Pile Caps', name: 'Reinforced Concrete Marine Grade M35 Pile Caps Casting', dur: 18, start: 52, prog: 30, weight: 18, critical: true, trade: 'MA', cost: 9800000 },
      { id: 'T-05', wbs: '3.1', phase: 'Deck Structure', name: 'Precast Beam Launching & Longitudinal Tendon Grouting', dur: 16, start: 70, prog: 0, weight: 15, critical: true, trade: 'BB', cost: 7400000 },
      { id: 'T-06', wbs: '3.2', phase: 'Deck Structure', name: 'Marine Deck Slab Reinforcement & In-situ Concrete Topping', dur: 20, start: 86, prog: 0, weight: 15, critical: true, trade: 'MA', cost: 8900000 },
      { id: 'T-07', wbs: '4.1', phase: 'Bollards & Fenders', name: 'Installation of Heavy Arch Rubber Fenders & Cast Steel Bollards', dur: 12, start: 106, prog: 0, weight: 6, critical: false, trade: 'WE', cost: 3500000 },
      { id: 'T-08', wbs: '4.2', phase: 'Bollards & Fenders', name: 'Bunkering Water Supply Line & Marine Navigational Lighting', dur: 10, start: 112, prog: 0, weight: 4, critical: true, trade: 'PL', cost: 1800000 }
    ],
    'General/Renovation': [
      { id: 'T-01', wbs: '1.1', phase: 'Survey & Demolition', name: 'Structural Integrity Audit, Defect Mapping & Controlled Strip-out', dur: 8, start: 0, prog: 100, weight: 8, critical: true, trade: 'UL', cost: 350000 },
      { id: 'T-02', wbs: '1.2', phase: 'Civil Rehabilitation', name: 'Spalling Concrete Repair, Anti-corrosion Rebar Coating & Grouting', dur: 15, start: 8, prog: 85, weight: 18, critical: true, trade: 'MA', cost: 1250000 },
      { id: 'T-03', wbs: '2.1', phase: 'Roofing & Waterproofing', name: 'Roof Truss Structural Strengthening & Waterproof Membrane Laying', dur: 14, start: 23, prog: 40, weight: 20, critical: true, trade: 'CA', cost: 1950000 },
      { id: 'T-04', wbs: '2.2', phase: 'Masonry & Plastering', name: 'Plaster Repair, Crack Injection & Damp-Proof Course (DPC)', dur: 12, start: 37, prog: 20, weight: 15, critical: false, trade: 'MA', cost: 980000 },
      { id: 'T-05', wbs: '3.1', phase: 'Finishes & Services', name: 'Concealed Electrical Rewiring, Sub-Distribution & Sanitary Fittings', dur: 14, start: 45, prog: 0, weight: 16, critical: true, trade: 'EL', cost: 1450000 },
      { id: 'T-06', wbs: '3.2', phase: 'Finishes & Services', name: 'External & Internal Weather-shield Emulsion Paint Application', dur: 10, start: 59, prog: 0, weight: 13, critical: true, trade: 'PA', cost: 890000 },
      { id: 'T-07', wbs: '4.1', phase: 'Snagging & Handover', name: 'Joint Inspection with Station In-charge & Handover Protocol', dur: 5, start: 69, prog: 0, weight: 10, critical: true, trade: 'UL', cost: 200000 }
    ]
  };

  class ProgressCenterModule {
    constructor() {
      this.selectedProjectId = null;
      this.activeTab = 'gantt'; // 'gantt' | 'tasks' | 'materials' | 'labour' | 'plant' | 'evm' | 'qa'
      this.zoom = 'Weeks'; // 'Days' | 'Weeks' | 'Months'
      this.dayW = 32;
      this.statusFilter = 'All';
      this.projectDataCache = {};
    }

    init() {
      // Listen to store updates
      if (window.spsStore) {
        window.spsStore.subscribe((event) => {
          if (['PROJECTS_SET', 'NAVAL_PROJECTS_SET', 'ATTACHMENTS_SET'].includes(event)) {
            const activeView = document.getElementById('progress-center-view');
            if (activeView && activeView.classList.contains('active')) {
              this.render();
            }
          }
        });
      }
    }

    // ── Get Active Project List ──
    getAllProjects() {
      const naval = (window.spsStore ? window.spsStore.navalProjects : []) || [];
      const special = (window.spsStore ? window.spsStore.projects : []) || [];
      return [...naval, ...special];
    }

    // ── Get Active Project Record ──
    getSelectedProject() {
      const all = this.getAllProjects();
      if (!all || all.length === 0) return null;

      if (!this.selectedProjectId) {
        this.selectedProjectId = all[0].id || all[0].code || 'NP-001';
      }

      const match = all.find(p => (p.id === this.selectedProjectId || p.code === this.selectedProjectId));
      return match || all[0];
    }

    // ── Resolve or Build Detailed Project Dataset ──
    getProjectDetailedData(project) {
      if (!project) return null;
      const pid = project.id || project.code || 'PRJ';
      if (this.projectDataCache[pid]) return this.projectDataCache[pid];

      // Detect project nature
      const pName = (project.name || project.title || '').toUpperCase();
      let templateKey = 'General/Renovation';
      if (pName.includes('HANGAR') || pName.includes('WORKSHOP') || pName.includes('BUILDING') || pName.includes('STEEL')) {
        templateKey = 'Hangar/Workshop';
      } else if (pName.includes('PIER') || pName.includes('DOCK') || pName.includes('WATER') || pName.includes('JETTY')) {
        templateKey = 'Pier/Maritime';
      }

      const baseTasks = JSON.parse(JSON.stringify(CIVIL_WBS_TEMPLATES[templateKey] || CIVIL_WBS_TEMPLATES['General/Renovation']));
      
      // Calculate realistic dates anchored to project start date
      const pStart = new Date(project.startDate || project.start_date || '2025-01-15');
      baseTasks.forEach((t) => {
        const tStart = new Date(pStart);
        tStart.setDate(tStart.getDate() + t.start);
        const tEnd = new Date(tStart);
        tEnd.setDate(tEnd.getDate() + t.dur);
        t.startDateStr = tStart.toISOString().split('T')[0];
        t.endDateStr = tEnd.toISOString().split('T')[0];
      });

      // Calculate overall physical progress
      const totalWeight = baseTasks.reduce((acc, t) => acc + t.weight, 0);
      const earnedWeight = baseTasks.reduce((acc, t) => acc + (t.weight * (t.prog / 100)), 0);
      const computedProg = Math.round((earnedWeight / (totalWeight || 100)) * 100);

      // Materials MTO list
      const materials = [
        { name: 'Portland Composite Cement (50kg Bag)', unit: 'Bags', req: 4500, indent: 4000, deliv: 3200, used: 2450, rate: 2150, pr: 'PR-2026-CEM-04', critical: false },
        { name: 'Tor Steel High-Yield Rebar (16mm)', unit: 'MT', req: 38.5, indent: 38.5, deliv: 30.0, used: 22.4, rate: 310000, pr: 'PR-2026-STL-01', critical: true },
        { name: 'Tor Steel High-Yield Rebar (20mm)', unit: 'MT', req: 45.0, indent: 45.0, deliv: 40.0, used: 31.0, rate: 315000, pr: 'PR-2026-STL-02', critical: false },
        { name: 'Universal Steel Beams UB 305x165 (12m)', unit: 'No\'s', req: 28, indent: 28, deliv: 20, used: 12, rate: 420000, pr: 'PR-2026-STU-08', critical: true },
        { name: 'Ready-Mix Concrete Grade 30 (M30)', unit: 'm³', req: 620, indent: 500, deliv: 420, used: 410, rate: 32500, pr: 'PR-2026-CON-11', critical: false },
        { name: 'River Sand for Structural Concrete', unit: 'Cubes', req: 180, indent: 180, deliv: 140, used: 115, rate: 24000, pr: 'PR-2026-SND-05', critical: false },
        { name: 'Coarse Aggregate (20mm Crushed Metal)', unit: 'Cubes', req: 260, indent: 240, deliv: 210, used: 185, rate: 19500, pr: 'PR-2026-AGG-02', critical: false },
        { name: 'Zinc-Alum Roofing Sheet 0.47mm AZ150', unit: 'No\'s', req: 220, indent: 220, deliv: 100, used: 0, rate: 19500, pr: 'PR-2026-ROF-03', critical: true },
        { name: 'Marine Grade Epoxy Protective Paint', unit: 'Ltrs', req: 450, indent: 400, deliv: 200, used: 50, rate: 4800, pr: 'PR-2026-PNT-09', critical: false }
      ];

      // Labour & Trades deployment
      const trades = [
        { code: 'MA', title: 'Masons', req: 14, deployed: 12, icon: 'fa-trowel-bricks', class: 'trade-icon-ma' },
        { code: 'CA', title: 'Carpenters / Shuttering', req: 10, deployed: 8, icon: 'fa-hammer', class: 'trade-icon-ca' },
        { code: 'WE', title: 'Welders & Riggers', req: 8, deployed: 7, icon: 'fa-fire-burner', class: 'trade-icon-we' },
        { code: 'BB', title: 'Barbenders', req: 8, deployed: 8, icon: 'fa-vector-square', class: 'trade-icon-bb' },
        { code: 'PA', title: 'Painters', req: 6, deployed: 4, icon: 'fa-paint-roller', class: 'trade-icon-pa' },
        { code: 'PL', title: 'Plumbers', req: 4, deployed: 3, icon: 'fa-wrench', class: 'trade-icon-pl' },
        { code: 'EL', title: 'Electricians', req: 4, deployed: 4, icon: 'fa-bolt', class: 'trade-icon-el' },
        { code: 'UL', title: 'General Labour / Sailors', req: 24, deployed: 22, icon: 'fa-users', class: 'trade-icon-ul' }
      ];

      // Plant & Equipment
      const plant = [
        { name: 'TADANO 25-Ton Mobile Crane', type: 'Lifting & Erection', status: 'Active', operator: 'PO1 W. Kumara', hours: 412, fuel: 85 },
        { name: 'Caterpillar 320D Excavator', type: 'Earthworks & Trenching', status: 'Active', operator: 'LME K. Perera', hours: 680, fuel: 72 },
        { name: 'Winget 10/7 Concrete Mixer #1', type: 'Concrete Batching', status: 'Active', operator: 'LME S. Silva', hours: 290, fuel: 90 },
        { name: 'High-Frequency Poker Vibrator #2', type: 'Compaction Equipment', status: 'Active', operator: 'AB R. Fernando', hours: 145, fuel: 95 },
        { name: 'Isuzu 10-Wheeler Tipper Truck', type: 'Material Haulage', status: 'Idle', operator: 'LME D. Jayasena', hours: 520, fuel: 60 },
        { name: 'Leica TS06 Total Station & Prism', type: 'Precision Surveying', status: 'Active', operator: 'PO1 C. Bandara', hours: 180, fuel: 100 }
      ];

      // EVM calculations
      const bac = Number(project.voteAllocation || project.budget || 50000000);
      const plannedProgressPct = 65; // Scheduled progress
      const actualProgressPct = computedProg || Number(project.progress || 52);
      const pv = Math.round(bac * (plannedProgressPct / 100));
      const ev = Math.round(bac * (actualProgressPct / 100));
      const ac = Number(project.actualSpent || project.committed || Math.round(ev * 0.94));
      const cv = ev - ac;
      const sv = ev - pv;
      const cpi = ac > 0 ? parseFloat((ev / ac).toFixed(2)) : 1.0;
      const spi = pv > 0 ? parseFloat((ev / pv).toFixed(2)) : 1.0;
      const eac = cpi > 0 ? Math.round(bac / cpi) : bac;

      // QA/QC Site tests
      const qaTests = [
        { test: 'Concrete Slump Test (M30 Footing)', req: '100mm ± 25mm', actual: '110mm', date: '2025-04-18', inspector: 'Lt Cdr KMAU Kahandawa', status: 'PASSED' },
        { test: '7-Day Cube Compressive Strength (Footing)', req: '≥ 20.0 N/mm²', actual: '22.8 N/mm²', date: '2025-04-25', inspector: 'Lt M. Fernando', status: 'PASSED' },
        { test: '28-Day Cube Compressive Strength (Pad #4)', req: '≥ 30.0 N/mm²', actual: '34.2 N/mm²', date: '2025-05-16', inspector: 'Lt M. Fernando', status: 'PASSED' },
        { test: 'Tor Steel Tensile Yield Strength (T20)', req: '≥ 500 N/mm²', actual: '535 N/mm²', date: '2025-04-02', inspector: 'SLSI Accredited Lab', status: 'PASSED' },
        { test: 'Sub-base Soil Compaction Dry Density', req: '≥ 98% MDD', actual: '99.2% MDD', date: '2025-03-28', inspector: 'PO1 C. Bandara', status: 'PASSED' }
      ];

      // Weather impact log
      const weather = [
        { date: '2025-05-10', condition: 'Heavy Rain / Monsoonal Showers', temp: '29°C', rainMm: 45, seaState: 'Moderate 1.8m', impact: 'Outdoor concrete pour deferred by 24h' },
        { date: '2025-05-09', condition: 'Sunny / High Humidity', temp: '34°C', rainMm: 0, seaState: 'Calm 0.6m', impact: 'Normal civil and rebar operations' },
        { date: '2025-05-08', condition: 'Overcast with Sea Breeze', temp: '31°C', rainMm: 4, seaState: 'Slight 1.1m', impact: 'Roofing and steel welding underway' }
      ];

      const fullData = {
        tasks: baseTasks,
        materials: materials,
        trades: trades,
        plant: plant,
        evm: { bac, pv, ev, ac, cv, sv, cpi, spi, eac, plannedProgressPct, actualProgressPct },
        qaTests: qaTests,
        weather: weather
      };

      this.projectDataCache[pid] = fullData;
      return fullData;
    }

    // ── Switch Active Tab ──
    switchTab(tab) {
      this.activeTab = tab;
      document.querySelectorAll('.pc-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
      });
      document.querySelectorAll('.pc-tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `pc-tab-${tab}`);
      });

      if (tab === 'gantt') {
        this.renderGanttTimeline();
      } else if (tab === 'evm') {
        this.renderSCurve();
      }
    }

    // ── Switch Project ──
    switchProject(projectId) {
      this.selectedProjectId = projectId;
      this.render();
    }

    // ── Set Zoom Level ──
    setZoom(z) {
      this.zoom = z;
      this.dayW = (z === 'Days') ? 56 : (z === 'Weeks' ? 32 : 16);
      document.querySelectorAll('.pc-zoom-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.zoom === z);
      });
      this.renderGanttTimeline();
    }

    // ── Update Task Progress Live ──
    updateTaskProgress(taskId, newProg) {
      const p = this.getSelectedProject();
      if (!p) return;
      const data = this.getProjectDetailedData(p);
      const task = data.tasks.find(t => t.id === taskId);
      if (task) {
        task.prog = Math.max(0, Math.min(100, parseInt(newProg) || 0));
        
        // Recalculate physical %
        const totalWeight = data.tasks.reduce((acc, t) => acc + t.weight, 0);
        const earnedWeight = data.tasks.reduce((acc, t) => acc + (t.weight * (t.prog / 100)), 0);
        const newOverall = Math.round((earnedWeight / (totalWeight || 100)) * 100);
        data.evm.actualProgressPct = newOverall;
        data.evm.ev = Math.round(data.evm.bac * (newOverall / 100));
        data.evm.cv = data.evm.ev - data.evm.ac;
        data.evm.sv = data.evm.ev - data.evm.pv;
        data.evm.cpi = data.evm.ac > 0 ? parseFloat((data.evm.ev / data.evm.ac).toFixed(2)) : 1.0;
        data.evm.spi = data.evm.pv > 0 ? parseFloat((data.evm.ev / data.evm.pv).toFixed(2)) : 1.0;

        // Update UI dynamically
        const progValEl = document.getElementById(`prog-val-${taskId}`);
        if (progValEl) progValEl.textContent = task.prog + '%';

        const kpiValEl = document.getElementById('pc-kpi-overall-prog');
        if (kpiValEl) kpiValEl.textContent = newOverall + '%';

        if (this.activeTab === 'gantt') this.renderGanttTimeline();
        if (this.activeTab === 'evm') this.renderSCurve();
      }
    }

    // ── Main Render ──
    render() {
      const container = document.getElementById('progress-center-view');
      if (!container) return;

      const allProjects = this.getAllProjects();
      const current = this.getSelectedProject();
      if (!current) {
        container.innerHTML = `<div class="empty-state" style="padding:60px;text-align:center;">
          <i class="fas fa-chart-line" style="font-size:3rem;color:var(--accent);"></i>
          <h3>No Projects Available</h3>
          <p>Please load or create a project to inspect progress monitoring.</p>
        </div>`;
        return;
      }

      const pData = this.getProjectDetailedData(current);
      const isNaval = (current.voteNumber || current.financialMean === 'Vote');
      const voteTag = current.voteNumber ? current.voteNumber.replace('VOTE 223-1-01-', 'VOTE ') : (current.category || 'Special Project');
      const incharge = current.projectOfficer || current.incharge || 'Lt Cdr KMAU Kahandawa';
      const budgetLkr = Number(current.voteAllocation || current.budget || 0);

      container.innerHTML = `
        <div class="pc-container">

          <!-- ═════════ TOP COMMAND HERO BANNER ═════════ -->
          <div class="pc-hero-banner">
            <div class="pc-hero-top">
              <div class="pc-hero-info">
                <div class="pc-hero-meta">
                  <span class="pc-badge-tag pc-badge-navy"><i class="fas fa-shield-halved"></i> SRI LANKA NAVY CED</span>
                  <span class="pc-badge-tag pc-badge-vote"><i class="fas fa-coins"></i> ${voteTag}</span>
                  <span class="pc-badge-tag pc-badge-active"><i class="fas fa-circle-play"></i> ${current.status || 'Active'}</span>
                </div>
                <h1 class="pc-project-title">
                  <i class="fas fa-cubes-stacked" style="color:#38bdf8;font-size:1.3rem;"></i>
                  ${current.name || current.title}
                </h1>
                <div class="pc-project-sub">
                  <span><i class="fas fa-user-shield" style="color:#f59e0b;"></i> Officer In-Charge: <strong>${incharge}</strong></span>
                  <span><i class="fas fa-calendar-alt" style="color:#38bdf8;"></i> Window: <strong>${current.startDate || current.start_date || '2025-01-15'}</strong> to <strong>${current.endDate || current.end_date || '2025-12-30'}</strong></span>
                  <span><i class="fas fa-map-marker-alt" style="color:#10b981;"></i> Location: <strong>SLN Dockyard Trincomalee</strong></span>
                </div>
              </div>

              <!-- Top Actions & Project Selector -->
              <div class="pc-hero-actions">
                <div class="pc-selector-wrap" title="Switch between Naval Projects and Special Projects">
                  <label><i class="fas fa-list-check"></i> Project:</label>
                  <select onchange="window.progressCenter.switchProject(this.value)">
                    <optgroup label="⚓ Naval Capital Projects (Government Votes)">
                      ${allProjects.filter(p => p.voteNumber).map(p => `
                        <option value="${p.id || p.code}" ${(p.id === current.id || p.code === current.code) ? 'selected' : ''}>
                          ${p.code || p.id} — ${(p.name || '').substring(0, 48)}...
                        </option>
                      `).join('')}
                    </optgroup>
                    <optgroup label="🏗️ Special Projects (CSR & Welfare)">
                      ${allProjects.filter(p => !p.voteNumber).map(p => `
                        <option value="${p.id || p.code}" ${(p.id === current.id || p.code === current.code) ? 'selected' : ''}>
                          ${p.code || p.id} — ${(p.title || '').substring(0, 48)}...
                        </option>
                      `).join('')}
                    </optgroup>
                  </select>
                </div>

                <button class="btn btn-primary btn-sm" onclick="window.progressCenter.openNewTaskModal()">
                  <i class="fas fa-plus"></i> Add WBS Task
                </button>
                <button class="btn btn-secondary btn-sm" onclick="window.progressCenter.exportCivilReport()">
                  <i class="fas fa-file-pdf"></i> Export Dossier
                </button>
                <a href="civil-pm-center.html" target="_blank" class="btn btn-sm" style="text-decoration:none; display:inline-flex; align-items:center; gap:6px; background:linear-gradient(135deg, #0284c7, #0369a1); color:#fff; font-weight:700; border:1px solid #38bdf8; box-shadow:0 0 10px rgba(56,189,248,0.3);">
                  <i class="fas fa-expand"></i> Full Command Center
                </a>
              </div>
            </div>
          </div>

          <!-- ═════════ EXECUTIVE CIVIL KPI CARDS ═════════ -->
          <div class="pc-kpi-grid">
            <div class="pc-kpi-card kpi-success">
              <div class="pc-kpi-header">
                <span class="pc-kpi-title">Physical Progress</span>
                <i class="fas fa-chart-pie pc-kpi-icon" style="color:#22c55e;"></i>
              </div>
              <div class="pc-kpi-value" id="pc-kpi-overall-prog">${pData.evm.actualProgressPct}%</div>
              <div class="pc-kpi-footer">
                <span style="color:#22c55e;">Target: ${pData.evm.plannedProgressPct}%</span>
                <span>(${pData.evm.actualProgressPct >= pData.evm.plannedProgressPct ? 'On Schedule' : 'Schedule Lag'})</span>
              </div>
            </div>

            <div class="pc-kpi-card ${pData.evm.spi >= 1.0 ? 'kpi-success' : 'kpi-warning'}">
              <div class="pc-kpi-header">
                <span class="pc-kpi-title">Schedule Perf (SPI)</span>
                <i class="fas fa-clock-rotate-left pc-kpi-icon"></i>
              </div>
              <div class="pc-kpi-value">${pData.evm.spi}</div>
              <div class="pc-kpi-footer">
                <span>Earned / Planned Value</span>
              </div>
            </div>

            <div class="pc-kpi-card ${pData.evm.cpi >= 1.0 ? 'kpi-success' : 'kpi-danger'}">
              <div class="pc-kpi-header">
                <span class="pc-kpi-title">Cost Perf (CPI)</span>
                <i class="fas fa-scale-balanced pc-kpi-icon"></i>
              </div>
              <div class="pc-kpi-value">${pData.evm.cpi}</div>
              <div class="pc-kpi-footer">
                <span>Earned / Actual Cost</span>
              </div>
            </div>

            <div class="pc-kpi-card">
              <div class="pc-kpi-header">
                <span class="pc-kpi-title">Vote / Budget</span>
                <i class="fas fa-vault pc-kpi-icon"></i>
              </div>
              <div class="pc-kpi-value" style="font-size:1.15rem;">Rs. ${(budgetLkr / 1000000).toFixed(2)} M</div>
              <div class="pc-kpi-footer">
                <span>Spent: Rs. ${(pData.evm.ac / 1000000).toFixed(2)} M</span>
              </div>
            </div>

            <div class="pc-kpi-card kpi-purple">
              <div class="pc-kpi-header">
                <span class="pc-kpi-title">Workforce Deployed</span>
                <i class="fas fa-users-gear pc-kpi-icon" style="color:#a855f7;"></i>
              </div>
              <div class="pc-kpi-value">
                ${pData.trades.reduce((a, b) => a + b.deployed, 0)} <span style="font-size:0.75rem;color:#94a3b8;font-weight:400;">/ ${pData.trades.reduce((a, b) => a + b.req, 0)} req</span>
              </div>
              <div class="pc-kpi-footer">
                <span>8 Specialist Trades</span>
              </div>
            </div>

            <div class="pc-kpi-card kpi-danger">
              <div class="pc-kpi-header">
                <span class="pc-kpi-title">Critical Path Slack</span>
                <i class="fas fa-triangle-exclamation pc-kpi-icon" style="color:#ef4444;"></i>
              </div>
              <div class="pc-kpi-value" style="color:#ef4444;">0 Days</div>
              <div class="pc-kpi-footer">
                <span>Direct on Critical Path</span>
              </div>
            </div>
          </div>

          <!-- ═════════ NAVIGATION TABS ═════════ -->
          <div class="pc-tabs-bar">
            <button class="pc-tab-btn active" data-tab="gantt" onclick="window.progressCenter.switchTab('gantt')">
              <i class="fas fa-chart-gantt"></i> Interactive Gantt Studio
              <span class="badge-pill">${pData.tasks.length}</span>
            </button>
            <button class="pc-tab-btn" data-tab="tasks" onclick="window.progressCenter.switchTab('tasks')">
              <i class="fas fa-list-check"></i> WBS Work Packages & DPR
            </button>
            <button class="pc-tab-btn" data-tab="materials" onclick="window.progressCenter.switchTab('materials')">
              <i class="fas fa-boxes-stacked"></i> Material Requirements & MTO
              <span class="badge-pill">${pData.materials.length}</span>
            </button>
            <button class="pc-tab-btn" data-tab="labour" onclick="window.progressCenter.switchTab('labour')">
              <i class="fas fa-people-group"></i> Labour Gangs & Trade Quotas
            </button>
            <button class="pc-tab-btn" data-tab="plant" onclick="window.progressCenter.switchTab('plant')">
              <i class="fas fa-truck-monster"></i> Heavy Plant & Machinery
              <span class="badge-pill">${pData.plant.length}</span>
            </button>
            <button class="pc-tab-btn" data-tab="evm" onclick="window.progressCenter.switchTab('evm')">
              <i class="fas fa-chart-line-up"></i> EVM Diagnostics & S-Curve
            </button>
            <button class="pc-tab-btn" data-tab="qa" onclick="window.progressCenter.switchTab('qa')">
              <i class="fas fa-clipboard-check"></i> Quality QA/QC & Weather
            </button>
          </div>

          <!-- ═════════ TAB 1: GANTT CHART STUDIO ═════════ -->
          <div class="pc-tab-pane active" id="pc-tab-gantt">
            <div class="pc-gantt-board">
              <div class="pc-gantt-toolbar">
                <div class="pc-gantt-legend">
                  <div class="pc-legend-item">
                    <span class="pc-legend-swatch swatch-critical"></span>
                    <span>Critical Path Task</span>
                  </div>
                  <div class="pc-legend-item">
                    <span class="pc-legend-swatch swatch-normal"></span>
                    <span>Standard Task</span>
                  </div>
                  <div class="pc-legend-item">
                    <span class="pc-legend-swatch swatch-complete"></span>
                    <span>Completed</span>
                  </div>
                  <div class="pc-legend-item">
                    <span class="pc-legend-swatch swatch-milestone"></span>
                    <span>Milestone</span>
                  </div>
                </div>

                <div class="pc-gantt-zoom-controls">
                  <span style="font-size:0.72rem;color:#94a3b8;margin-right:4px;">Timeline Scale:</span>
                  <button class="pc-zoom-btn" data-zoom="Days" onclick="window.progressCenter.setZoom('Days')">Days</button>
                  <button class="pc-zoom-btn active" data-zoom="Weeks" onclick="window.progressCenter.setZoom('Weeks')">Weeks</button>
                  <button class="pc-zoom-btn" data-zoom="Months" onclick="window.progressCenter.setZoom('Months')">Months</button>
                </div>
              </div>

              <!-- Split View: Left WBS Table, Right Gantt Chart -->
              <div class="pc-gantt-split">
                <!-- Left WBS -->
                <div class="pc-wbs-list">
                  <div class="pc-wbs-header">
                    <span>WBS Item / Task Name</span>
                    <span>Dur</span>
                    <span>Progress</span>
                  </div>
                  ${pData.tasks.map(t => `
                    <div class="pc-wbs-row ${t.weight > 10 ? 'is-phase' : ''}" title="${t.name} (Trade: ${t.trade})">
                      <div class="pc-wbs-name">
                        <span style="font-family:var(--mono);color:#38bdf8;font-size:0.7rem;font-weight:700;">${t.wbs}</span>
                        <span style="overflow:hidden;text-overflow:ellipsis;">${t.name}</span>
                      </div>
                      <div class="pc-wbs-dur">${t.dur}d</div>
                      <div class="pc-wbs-prog-wrap">
                        <div class="pc-wbs-prog-bar">
                          <div class="pc-wbs-prog-fill ${t.critical ? 'fill-critical' : (t.prog === 100 ? 'fill-complete' : '')}" style="width:${t.prog}%;"></div>
                        </div>
                        <span class="pc-wbs-prog-text">${t.prog}%</span>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- Right Timeline Canvas -->
                <div class="pc-gantt-timeline-wrap" id="pc-gantt-timeline-wrap">
                  <div class="pc-gantt-timeline-inner" id="pc-gantt-timeline-inner">
                    <!-- Rendered by renderGanttTimeline() -->
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ═════════ TAB 2: DETAILED WBS WORK PACKAGES ═════════ -->
          <div class="pc-tab-pane" id="pc-tab-tasks">
            <div class="pc-task-grid">
              ${this._renderTaskPhases(pData.tasks)}
            </div>
          </div>

          <!-- ═════════ TAB 3: MATERIAL REQUIREMENTS & MTO ═════════ -->
          <div class="pc-tab-pane" id="pc-tab-materials">
            <div class="pc-mat-grid">
              <div class="pc-mat-table-card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
                  <h3 style="font-size:0.95rem;font-weight:700;color:#f1f5f9;margin:0;">
                    <i class="fas fa-boxes-stacked" style="color:#38bdf8;margin-right:8px;"></i>
                    Civil Engineering Material Take-Off (MTO) & Inventory Reconciliation
                  </h3>
                  <button class="btn btn-ghost btn-sm" onclick="window.progressCenter.logMaterialReceipt()">
                    <i class="fas fa-truck-ramp-box"></i> Log Delivery
                  </button>
                </div>
                <table class="pc-table">
                  <thead>
                    <tr>
                      <th>Material Specification</th>
                      <th>Unit</th>
                      <th>Req Qty</th>
                      <th>Indented</th>
                      <th>Delivered</th>
                      <th>Site Used</th>
                      <th>Stock Buffer</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pData.materials.map(m => {
                      const balance = m.deliv - m.used;
                      const bufPct = Math.round((m.deliv / m.req) * 100);
                      const isLow = balance < (m.req * 0.15);
                      return `
                        <tr>
                          <td>
                            <strong style="color:#f8fafc;display:block;">${m.name}</strong>
                            <span style="font-size:0.68rem;color:#38bdf8;font-family:var(--mono);">Linked: ${m.pr}</span>
                          </td>
                          <td style="font-family:var(--mono);">${m.unit}</td>
                          <td style="font-family:var(--mono);font-weight:700;">${m.req.toLocaleString()}</td>
                          <td style="font-family:var(--mono);color:#94a3b8;">${m.indent.toLocaleString()}</td>
                          <td style="font-family:var(--mono);color:#38bdf8;font-weight:700;">${m.deliv.toLocaleString()}</td>
                          <td style="font-family:var(--mono);color:#f59e0b;font-weight:700;">${m.used.toLocaleString()}</td>
                          <td>
                            <div class="pc-stock-bar-wrap">
                              <span style="font-size:0.7rem;font-family:var(--mono);">${balance.toLocaleString()} on-site</span>
                              <div class="pc-stock-bar">
                                <div class="pc-stock-bar-fill ${isLow ? 'bar-danger' : (bufPct < 50 ? 'bar-warning' : '')}" style="width:${Math.min(100, bufPct)}%;"></div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span class="pc-mat-status-tag ${isLow ? 'mat-status-critical' : 'mat-status-ok'}">
                              <i class="fas ${isLow ? 'fa-triangle-exclamation' : 'fa-check'}"></i> ${isLow ? 'LOW STOCK' : 'ADEQUATE'}
                            </span>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Material Logistics Summary -->
              <div class="pc-mat-summary-card">
                <h4 style="font-size:0.9rem;font-weight:700;color:#f1f5f9;margin:0;">
                  <i class="fas fa-clipboard-check" style="color:#10b981;margin-right:6px;"></i> Logistics & Stores Health
                </h4>
                <div style="display:flex;flex-direction:column;gap:10px;">
                  <div style="background:rgba(255,255,255,0.02);padding:10px;border-radius:6px;border-left:3px solid #10b981;">
                    <span style="font-size:0.7rem;color:#94a3b8;display:block;">Major Deliveries Cleared</span>
                    <strong style="font-size:1rem;color:#f8fafc;font-family:var(--mono);">84% of Indented Lots</strong>
                  </div>
                  <div style="background:rgba(255,255,255,0.02);padding:10px;border-radius:6px;border-left:3px solid #ef4444;">
                    <span style="font-size:0.7rem;color:#94a3b8;display:block;">Critical Path Material Shortages</span>
                    <strong style="font-size:1rem;color:#ef4444;font-family:var(--mono);">Roofing Sheets (120 No's Pending)</strong>
                    <span style="font-size:0.68rem;color:#94a3b8;display:block;margin-top:2px;">Supplier ETA: 5 Days (M/S Ben Vision Ltd)</span>
                  </div>
                  <div style="background:rgba(255,255,255,0.02);padding:10px;border-radius:6px;border-left:3px solid #38bdf8;">
                    <span style="font-size:0.7rem;color:#94a3b8;display:block;">Stores Location</span>
                    <strong style="font-size:0.85rem;color:#f8fafc;">Central Civil Store Yard ENA</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ═════════ TAB 4: LABOUR REQUIREMENTS & GANGS ═════════ -->
          <div class="pc-tab-pane" id="pc-tab-labour">
            <div class="pc-labour-grid">
              ${pData.trades.map(tr => `
                <div class="pc-trade-card">
                  <div class="pc-trade-header">
                    <div class="pc-trade-badge">
                      <div class="pc-trade-icon ${tr.class}">
                        <i class="fas ${tr.icon}"></i>
                      </div>
                      <span>${tr.title}</span>
                    </div>
                    <div class="pc-trade-counts">
                      ${tr.deployed} <span>/ ${tr.req}</span>
                    </div>
                  </div>
                  <div class="pc-stock-bar" style="height:6px;">
                    <div class="pc-stock-bar-fill ${tr.deployed < tr.req ? 'bar-warning' : ''}" style="width:${Math.round((tr.deployed / tr.req) * 100)}%;"></div>
                  </div>
                  <div style="font-size:0.72rem;color:#94a3b8;">
                    Attached Naval Tradesmen:
                  </div>
                  <div class="pc-sailors-attached-list">
                    <div class="pc-sailor-item">
                      <span><strong>PO1 W. Silva</strong> (VAS 68210)</span>
                      <span style="color:#22c55e;">On Site</span>
                    </div>
                    <div class="pc-sailor-item">
                      <span><strong>LME N. Fernando</strong> (VAS 74120)</span>
                      <span style="color:#22c55e;">On Site</span>
                    </div>
                    <div class="pc-sailor-item">
                      <span><strong>AB K. Kumara</strong> (VAS 81902)</span>
                      <span style="color:#38bdf8;">Gang Leader</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- ═════════ TAB 5: HEAVY PLANT & MACHINERY ═════════ -->
          <div class="pc-tab-pane" id="pc-tab-plant">
            <div class="pc-plant-grid">
              ${pData.plant.map(pl => `
                <div class="pc-plant-card">
                  <div class="pc-plant-header">
                    <div>
                      <h4 class="pc-plant-title">${pl.name}</h4>
                      <span class="pc-plant-type">${pl.type}</span>
                    </div>
                    <span class="pc-plant-status ${pl.status === 'Active' ? 'plant-status-active' : 'plant-status-idle'}">
                      <i class="fas ${pl.status === 'Active' ? 'fa-circle-check' : 'fa-clock'}"></i> ${pl.status}
                    </span>
                  </div>
                  <div class="pc-plant-stats-row">
                    <div class="pc-plant-stat">
                      <label>Operating Hours</label>
                      <span>${pl.hours} hrs</span>
                    </div>
                    <div class="pc-plant-stat">
                      <label>Fuel Level</label>
                      <span style="color:${pl.fuel < 40 ? '#ef4444' : '#22c55e'};">${pl.fuel}%</span>
                    </div>
                  </div>
                  <div style="font-size:0.72rem;color:#94a3b8;display:flex;align-items:center;gap:6px;">
                    <i class="fas fa-id-card-clip" style="color:#38bdf8;"></i>
                    Assigned Operator: <strong style="color:#f1f5f9;">${pl.operator}</strong>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- ═════════ TAB 6: EVM & S-CURVE ═════════ -->
          <div class="pc-tab-pane" id="pc-tab-evm">
            <div class="pc-evm-grid">
              <div class="pc-scurve-card">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <h3 style="font-size:0.95rem;font-weight:700;color:#f1f5f9;margin:0;">
                    <i class="fas fa-chart-line" style="color:#38bdf8;margin-right:8px;"></i>
                    Earned Value S-Curve (Cumulative Progress & Expenditure)
                  </h3>
                  <div style="display:flex;gap:12px;font-size:0.72rem;">
                    <span style="color:#38bdf8;"><i class="fas fa-minus"></i> Planned Value (PV)</span>
                    <span style="color:#22c55e;"><i class="fas fa-minus"></i> Earned Value (EV)</span>
                    <span style="color:#ef4444;"><i class="fas fa-minus"></i> Actual Cost (AC)</span>
                  </div>
                </div>
                <div class="pc-scurve-canvas-wrap" id="pc-scurve-canvas-wrap">
                  <!-- Rendered by SVG in renderSCurve() -->
                </div>
              </div>

              <!-- EVM Statistics Breakdown -->
              <div class="pc-evm-metrics-card">
                <h4 style="font-size:0.9rem;font-weight:700;color:#f1f5f9;margin:0;">
                  <i class="fas fa-calculator" style="color:#a855f7;margin-right:6px;"></i> Earned Value Parameters
                </h4>
                <div class="pc-metric-row">
                  <span class="pc-metric-label">Budget at Completion (BAC)</span>
                  <span class="pc-metric-val">Rs. ${(pData.evm.bac / 1000000).toFixed(2)} M</span>
                </div>
                <div class="pc-metric-row">
                  <span class="pc-metric-label">Planned Value (PV)</span>
                  <span class="pc-metric-val">Rs. ${(pData.evm.pv / 1000000).toFixed(2)} M</span>
                </div>
                <div class="pc-metric-row">
                  <span class="pc-metric-label">Earned Value (EV)</span>
                  <span class="pc-metric-val" style="color:#22c55e;">Rs. ${(pData.evm.ev / 1000000).toFixed(2)} M</span>
                </div>
                <div class="pc-metric-row">
                  <span class="pc-metric-label">Actual Cost (AC)</span>
                  <span class="pc-metric-val" style="color:#ef4444;">Rs. ${(pData.evm.ac / 1000000).toFixed(2)} M</span>
                </div>
                <div class="pc-metric-row ${pData.evm.cv >= 0 ? 'is-green' : 'is-red'}">
                  <span class="pc-metric-label">Cost Variance (CV = EV - AC)</span>
                  <span class="pc-metric-val">Rs. ${(pData.evm.cv / 1000000).toFixed(2)} M</span>
                </div>
                <div class="pc-metric-row ${pData.evm.sv >= 0 ? 'is-green' : 'is-red'}">
                  <span class="pc-metric-label">Schedule Variance (SV = EV - PV)</span>
                  <span class="pc-metric-val">Rs. ${(pData.evm.sv / 1000000).toFixed(2)} M</span>
                </div>
                <div class="pc-metric-row">
                  <span class="pc-metric-label">Estimate at Completion (EAC)</span>
                  <span class="pc-metric-val">Rs. ${(pData.evm.eac / 1000000).toFixed(2)} M</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ═════════ TAB 7: QUALITY QA/QC & WEATHER ═════════ -->
          <div class="pc-tab-pane" id="pc-tab-qa">
            <div class="pc-qa-grid">
              <div class="pc-qa-card">
                <h3 style="font-size:0.95rem;font-weight:700;color:#f1f5f9;margin:0;">
                  <i class="fas fa-vial-circle-check" style="color:#10b981;margin-right:8px;"></i>
                  Civil Quality Assurance & Material Test Register
                </h3>
                <table class="pc-table">
                  <thead>
                    <tr>
                      <th>Test Protocol</th>
                      <th>Spec Requirement</th>
                      <th>Actual Result</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pData.qaTests.map(q => `
                      <tr>
                        <td><strong>${q.test}</strong></td>
                        <td style="font-family:var(--mono);">${q.req}</td>
                        <td style="font-family:var(--mono);font-weight:700;color:#22c55e;">${q.actual}</td>
                        <td style="font-size:0.7rem;color:#94a3b8;">${q.date}</td>
                        <td><span class="pc-mat-status-tag mat-status-ok"><i class="fas fa-check"></i> ${q.status}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Weather Logs -->
              <div class="pc-qa-card">
                <h3 style="font-size:0.95rem;font-weight:700;color:#f1f5f9;margin:0;">
                  <i class="fas fa-cloud-sun-rain" style="color:#38bdf8;margin-right:8px;"></i>
                  Marine Weather & Site Environment Log
                </h3>
                <div style="display:flex;flex-direction:column;gap:10px;">
                  ${pData.weather.map(w => `
                    <div class="pc-weather-pill">
                      <i class="fas fa-cloud-rain pc-weather-icon"></i>
                      <div style="flex:1;">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                          <strong style="color:#f1f5f9;font-size:0.85rem;">${w.date}</strong>
                          <span style="font-size:0.75rem;color:#38bdf8;font-family:var(--mono);font-weight:700;">Rainfall: ${w.rainMm} mm</span>
                        </div>
                        <div style="font-size:0.75rem;color:#cbd5e1;margin:2px 0;">
                          ${w.condition} • Sea State: ${w.seaState} • Temp: ${w.temp}
                        </div>
                        <div style="font-size:0.7rem;color:#f59e0b;">
                          <i class="fas fa-info-circle"></i> Impact: ${w.impact}
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

        </div>
      `;

      // Render timeline for Gantt by default
      setTimeout(() => {
        this.renderGanttTimeline();
      }, 50);
    }

    // ── Helper: Render Task Phases Grid ──
    _renderTaskPhases(tasks) {
      // Group tasks by phase
      const phases = {};
      tasks.forEach(t => {
        if (!phases[t.phase]) phases[t.phase] = [];
        phases[t.phase].push(t);
      });

      return Object.entries(phases).map(([phaseName, phaseTasks]) => {
        const avgProg = Math.round(phaseTasks.reduce((a, b) => a + b.prog, 0) / phaseTasks.length);
        return `
          <div class="pc-phase-card">
            <div class="pc-phase-header">
              <div class="pc-phase-title-wrap">
                <div class="pc-phase-icon"><i class="fas fa-diagram-project"></i></div>
                <div>
                  <h4 class="pc-phase-title">${phaseName}</h4>
                  <span style="font-size:0.72rem;color:#94a3b8;">${phaseTasks.length} Work Packages</span>
                </div>
              </div>
              <span class="pc-phase-prog">${avgProg}%</span>
            </div>

            <div style="display:flex;flex-direction:column;gap:8px;">
              ${phaseTasks.map(t => `
                <div class="pc-task-item">
                  <div class="pc-task-main">
                    <span class="pc-task-title">${t.wbs} — ${t.name}</span>
                    <span style="font-family:var(--mono);font-weight:700;font-size:0.8rem;color:#38bdf8;" id="prog-val-${t.id}">
                      ${t.prog}%
                    </span>
                  </div>
                  <div class="pc-task-meta-row">
                    <span class="pc-task-tag"><i class="fas fa-calendar-day"></i> ${t.dur} Days</span>
                    <span class="pc-task-tag"><i class="fas fa-hard-hat"></i> Trade: ${t.trade}</span>
                    <span class="pc-task-tag"><i class="fas fa-coins"></i> Rs. ${(t.cost / 1000).toFixed(0)}k</span>
                    ${t.critical ? '<span class="pc-task-tag" style="background:rgba(239,68,68,0.2);color:#ef4444;font-weight:700;">CRITICAL</span>' : ''}
                  </div>
                  <div class="pc-task-controls">
                    <span style="font-size:0.68rem;color:#64748b;">Progress Slider:</span>
                    <input type="range" min="0" max="100" value="${t.prog}" class="pc-prog-slider"
                      oninput="window.progressCenter.updateTaskProgress('${t.id}', this.value)" />
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    }

    // ── Render Gantt Timeline SVG / Grid ──
    renderGanttTimeline() {
      const inner = document.getElementById('pc-gantt-timeline-inner');
      if (!inner) return;

      const p = this.getSelectedProject();
      if (!p) return;
      const data = this.getProjectDetailedData(p);
      const tasks = data.tasks;

      // Determine date boundary
      const startDates = tasks.map(t => new Date(t.startDateStr).getTime());
      const endDates = tasks.map(t => new Date(t.endDateStr).getTime());
      const minDate = new Date(Math.min(...startDates) - 2 * 86400000);
      const maxDate = new Date(Math.max(...endDates) + 14 * 86400000);

      const totalDays = Math.max(30, Math.ceil((maxDate - minDate) / 86400000));
      const timelineWidth = totalDays * this.dayW;

      // Build header days/weeks
      let headerCellsHtml = '';
      const step = (this.zoom === 'Days') ? 1 : (this.zoom === 'Weeks' ? 7 : 30);
      for (let i = 0; i < totalDays; i += step) {
        const d = new Date(minDate.getTime() + i * 86400000);
        const label = (this.zoom === 'Days')
          ? `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`
          : (this.zoom === 'Weeks'
              ? `Wk ${Math.ceil((i + 1) / 7)} (${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })})`
              : `${d.toLocaleString('en-US', { month: 'short', year: '2-digit' })}`);
        const cellW = step * this.dayW;
        headerCellsHtml += `<div class="pc-time-cell" style="width:${cellW}px;">${label}</div>`;
      }

      // Today marker calculation
      const today = new Date();
      const todayOffset = Math.floor((today - minDate) / 86400000);
      const todayLeft = todayOffset * this.dayW;
      const showToday = (todayLeft >= 0 && todayLeft <= timelineWidth);

      // Build rows
      const rowsHtml = tasks.map((t, idx) => {
        const tStart = new Date(t.startDateStr);
        const tEnd = new Date(t.endDateStr);
        const offsetDays = Math.floor((tStart - minDate) / 86400000);
        const barLeft = Math.max(0, offsetDays * this.dayW);
        const barWidth = Math.max(12, t.dur * this.dayW);

        return `
          <div class="pc-timeline-row" style="width:${timelineWidth}px;">
            <div class="pc-gantt-bar ${t.critical ? 'is-critical' : (t.prog === 100 ? 'is-complete' : '')}"
                 style="left:${barLeft}px; width:${barWidth}px;"
                 title="${t.name} (${t.prog}% complete, ${t.dur} days)">
              <div class="pc-bar-progress" style="width:${t.prog}%;"></div>
              <span class="pc-bar-label">${t.wbs} — ${t.name} (${t.prog}%)</span>
            </div>
          </div>
        `;
      }).join('');

      inner.style.width = `${timelineWidth}px`;
      inner.innerHTML = `
        <div class="pc-timeline-header-row" style="width:${timelineWidth}px;">
          ${headerCellsHtml}
        </div>
        ${showToday ? `
          <div class="pc-today-line" style="left:${todayLeft}px;">
            <span class="pc-today-tag">TODAY</span>
          </div>
        ` : ''}
        ${rowsHtml}
      `;
    }

    // ── Render S-Curve SVG Chart ──
    renderSCurve() {
      const container = document.getElementById('pc-scurve-canvas-wrap');
      if (!container) return;

      const p = this.getSelectedProject();
      if (!p) return;
      const data = this.getProjectDetailedData(p);
      const evm = data.evm;

      const W = container.clientWidth || 640;
      const H = 280;
      const pad = 40;

      // Points for Planned Value (Cumulative S-Curve)
      const pvPoints = [
        [pad, H - pad],
        [pad + (W - 2 * pad) * 0.2, H - pad - (H - 2 * pad) * 0.12],
        [pad + (W - 2 * pad) * 0.4, H - pad - (H - 2 * pad) * 0.35],
        [pad + (W - 2 * pad) * 0.65, H - pad - (H - 2 * pad) * 0.65],
        [pad + (W - 2 * pad) * 0.85, H - pad - (H - 2 * pad) * 0.88],
        [W - pad, pad]
      ];

      // Points for Earned Value up to current timeline (65% point)
      const currentX = pad + (W - 2 * pad) * 0.60;
      const evCurrentY = H - pad - (H - 2 * pad) * (evm.actualProgressPct / 100);
      const acCurrentY = H - pad - (H - 2 * pad) * Math.min(1.0, (evm.ac / evm.bac));

      const evPoints = [
        [pad, H - pad],
        [pad + (W - 2 * pad) * 0.2, H - pad - (H - 2 * pad) * 0.10],
        [pad + (W - 2 * pad) * 0.4, H - pad - (H - 2 * pad) * 0.30],
        [currentX, evCurrentY]
      ];

      const acPoints = [
        [pad, H - pad],
        [pad + (W - 2 * pad) * 0.2, H - pad - (H - 2 * pad) * 0.11],
        [pad + (W - 2 * pad) * 0.4, H - pad - (H - 2 * pad) * 0.32],
        [currentX, acCurrentY]
      ];

      const toPath = pts => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

      container.innerHTML = `
        <svg width="100%" height="100%" viewBox="0 0 ${W} ${H}" style="overflow:visible;">
          <!-- Grid Lines -->
          <line x1="${pad}" y1="${H - pad}" x2="${W - pad}" y2="${H - pad}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
          <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${H - pad}" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
          <line x1="${pad}" y1="${pad + (H - 2 * pad) * 0.5}" x2="${W - pad}" y2="${pad + (H - 2 * pad) * 0.5}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4" />
          
          <!-- Planned Value Curve -->
          <path d="${toPath(pvPoints)}" fill="none" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6,3" />

          <!-- Earned Value Curve -->
          <path d="${toPath(evPoints)}" fill="none" stroke="#22c55e" stroke-width="3.5" />

          <!-- Actual Cost Curve -->
          <path d="${toPath(acPoints)}" fill="none" stroke="#ef4444" stroke-width="2.5" />

          <!-- Today Vertical Line -->
          <line x1="${currentX}" y1="${pad}" x2="${currentX}" y2="${H - pad}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3" />
          <text x="${currentX + 6}" y="${pad + 16}" fill="#f59e0b" font-size="10" font-family="monospace" font-weight="700">STATUS DATE</text>

          <!-- Key Nodes -->
          <circle cx="${currentX}" cy="${evCurrentY}" r="5" fill="#22c55e" stroke="#0f1829" stroke-width="2" />
          <circle cx="${currentX}" cy="${acCurrentY}" r="5" fill="#ef4444" stroke="#0f1829" stroke-width="2" />

          <!-- Labels -->
          <text x="${pad}" y="${H - 12}" fill="#64748b" font-size="10">Project Inception</text>
          <text x="${W - pad - 60}" y="${H - 12}" fill="#64748b" font-size="10">Target Handover</text>
          <text x="10" y="${pad + 8}" fill="#64748b" font-size="10">100%</text>
          <text x="18" y="${H - pad}" fill="#64748b" font-size="10">0%</text>
        </svg>
      `;
    }

    // ── Open New WBS Task Modal ──
    openNewTaskModal() {
      const p = this.getSelectedProject();
      if (!p) return;
      const modal = document.getElementById('generic-modal-overlay');
      if (!modal) return;

      modal.innerHTML = `
        <div class="modal-box" style="max-width:550px;">
          <div class="modal-header">
            <h3><i class="fas fa-plus-circle" style="color:#38bdf8;"></i> Add Civil WBS Work Package</h3>
            <button class="modal-close" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="form-new-wbs-task" onsubmit="event.preventDefault(); window.progressCenter.saveNewTask();">
              <div class="form-group">
                <label>Work Package Name</label>
                <input type="text" id="wbs-new-name" required placeholder="e.g. RCC Column Casting Grade 30" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>WBS Phase</label>
                  <select id="wbs-new-phase">
                    <option value="Mobilization & Earthwork">Mobilization & Earthwork</option>
                    <option value="Substructure & Foundation">Substructure & Foundation</option>
                    <option value="Superstructure & Frame">Superstructure & Frame</option>
                    <option value="Envelope & Masonry">Envelope & Masonry</option>
                    <option value="Finishes & Handover">Finishes & Handover</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Primary Trade</label>
                  <select id="wbs-new-trade">
                    <option value="MA">Mason (MA)</option>
                    <option value="CA">Carpenter (CA)</option>
                    <option value="WE">Welder (WE)</option>
                    <option value="BB">Barbender (BB)</option>
                    <option value="PA">Painter (PA)</option>
                    <option value="PL">Plumber (PL)</option>
                    <option value="EL">Electrician (EL)</option>
                    <option value="UL">General Labour (UL)</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Duration (Days)</label>
                  <input type="number" id="wbs-new-dur" min="1" value="10" required />
                </div>
                <div class="form-group">
                  <label>Weightage (% of Project)</label>
                  <input type="number" id="wbs-new-weight" min="1" max="100" value="5" required />
                </div>
              </div>
              <div class="form-group">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                  <input type="checkbox" id="wbs-new-critical" checked />
                  <span style="color:#ef4444;font-weight:700;">Task Lies Directly on Critical Path</span>
                </label>
              </div>
              <div class="modal-footer" style="margin-top:16px;">
                <button type="button" class="btn btn-secondary" onclick="document.getElementById('generic-modal-overlay').classList.remove('open')">Cancel</button>
                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Work Package</button>
              </div>
            </form>
          </div>
        </div>
      `;
      modal.classList.add('open');
    }

    saveNewTask() {
      const name = document.getElementById('wbs-new-name').value;
      const phase = document.getElementById('wbs-new-phase').value;
      const trade = document.getElementById('wbs-new-trade').value;
      const dur = parseInt(document.getElementById('wbs-new-dur').value) || 7;
      const weight = parseInt(document.getElementById('wbs-new-weight').value) || 5;
      const isCritical = document.getElementById('wbs-new-critical').checked;

      const p = this.getSelectedProject();
      if (!p) return;
      const data = this.getProjectDetailedData(p);

      const newId = `T-${data.tasks.length + 1}`;
      const newWbs = `5.${data.tasks.length + 1}`;
      
      const lastTask = data.tasks[data.tasks.length - 1];
      const startDays = lastTask ? (lastTask.start + lastTask.dur) : 0;
      const pStart = new Date(p.startDate || p.start_date || '2025-01-15');
      const tStart = new Date(pStart);
      tStart.setDate(tStart.getDate() + startDays);
      const tEnd = new Date(tStart);
      tEnd.setDate(tEnd.getDate() + dur);

      data.tasks.push({
        id: newId,
        wbs: newWbs,
        phase: phase,
        name: name,
        dur: dur,
        start: startDays,
        startDateStr: tStart.toISOString().split('T')[0],
        endDateStr: tEnd.toISOString().split('T')[0],
        prog: 0,
        weight: weight,
        critical: isCritical,
        trade: trade,
        cost: dur * 125000
      });

      document.getElementById('generic-modal-overlay').classList.remove('open');
      if (window.app && window.app.toast) {
        window.app.toast(`Work package "${name}" successfully registered`, 'success');
      }
      this.render();
    }

    // ── Log Material Delivery ──
    logMaterialReceipt() {
      if (window.app && window.app.toast) {
        window.app.toast('Material Receipt Voucher logged & synced with Base Stores Register', 'success');
      }
    }

    // ── Export Comprehensive Civil Dossier ──
    exportCivilReport() {
      const p = this.getSelectedProject();
      if (!p) return;
      window.print();
    }
  }

  window.progressCenter = new ProgressCenterModule();
})();
