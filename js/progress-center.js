// ===================================================================
// SLN Project Platform — Project Progress & Monitoring Center Engine
// Advanced Full-Screen Civil Engineering & Naval Infrastructure PM Hub
// Gantt Chart Studio, CPM Scheduling, Material Take-Off, Labour & Plant
// ===================================================================
(function() {
  'use strict';

  // Master civil engineering tasks template by project category
  // Master civil engineering tasks template by project category with 4-Level WBS, Milestones & Multi-Track Concurrent Lanes
  const CIVIL_WBS_TEMPLATES = {
    'Hangar/Workshop': [
      // ── Level 2: Work Package 1.0 Substructure & Foundations ──
      {
        id: 'pkg_1_0',
        wbs: '1.0',
        wbs_code: '1.0',
        level: 2,
        type: 'package',
        phase: 'Substructure & Foundation',
        name: '1.0 Substructure & Foundations',
        dur: 48,
        duration_days: 48,
        start: 0,
        prog: 82,
        progress: 82,
        planned_progress: 88,
        weight: 30,
        critical: true,
        is_critical: true,
        trade: 'MA'
      },
      {
        id: 'task_1_1',
        wbs: '1.1',
        wbs_code: '1.1',
        level: 3,
        parent_id: 'pkg_1_0',
        phase: 'Substructure & Foundation',
        name: 'Site Clearing, Survey Setting Out & Datum Benchmarking',
        dur: 7,
        duration_days: 7,
        start: 0,
        prog: 100,
        progress: 100,
        planned_progress: 100,
        weight: 4,
        critical: true,
        is_critical: true,
        is_expanded: false,
        track_index: 0,
        trade: 'UL',
        cost: 450000,
        sub_tasks: [
          {
            id: 'sub_1_1_1',
            wbs_code: '1.1.1',
            name: 'Boundary Total Station Traversing & Benchmark Datum Pin Setting',
            start_offset: 0,
            duration_days: 3,
            progress: 100,
            resources: {
              labour: [
                { trade: 'Surveyor (CE)', count: 2, rating_ids: ['REG-5541', 'REG-5902'] },
                { trade: 'Civil Labour (VSS)', count: 4 }
              ],
              materials: [
                { item_code: 'MAT-TIM-03', name: 'Survey Pegs & Form Battens', qty: '60 Pcs', voucher_ref: 'NAV-2025-045' }
              ],
              tools_plant: [
                { name: 'Leica TS06 Total Station', reg_no: 'SLN-SRV-08', hours: 18 }
              ]
            }
          },
          {
            id: 'sub_1_1_2',
            wbs_code: '1.1.2',
            name: 'Mechanical Topsoil Stripping & Site Grubbing (Slipway Area)',
            start_offset: 3,
            duration_days: 4,
            progress: 100,
            resources: {
              labour: [
                { trade: 'Operator (Plant)', count: 1, rating_ids: ['REG-7810'] },
                { trade: 'Civil Labour (VSS)', count: 4 }
              ],
              materials: [
                { item_code: 'MAT-DIS-01', name: 'Disposal Transport Bags', qty: '100 Pcs', voucher_ref: 'NAV-2025-048' }
              ],
              tools_plant: [
                { name: 'CAT 428F Backhoe Loader', reg_no: 'SLN-EN-210', hours: 24 },
                { name: 'Isuzu 10-Wheeler Tipper Truck', reg_no: 'SLN-LOG-11', hours: 16 }
              ]
            }
          }
        ]
      },
      {
        id: 'task_1_2',
        wbs: '1.2',
        wbs_code: '1.2',
        level: 3,
        parent_id: 'pkg_1_0',
        phase: 'Substructure & Foundation',
        name: 'Bulk Excavation & Shoring for Column Pad Footings',
        dur: 19,
        duration_days: 19,
        start: 5,
        prog: 100,
        progress: 100,
        planned_progress: 100,
        weight: 6,
        critical: true,
        is_critical: true,
        is_expanded: false,
        track_index: 0,
        trade: 'UL',
        cost: 1200000,
        dependencies: [
          { target_id: 'task_1_1', type: 'FS', lag_days: 0 }
        ],
        sub_tasks: [
          {
            id: 'sub_1_2_1',
            wbs_code: '1.2.1',
            name: 'Mechanical Trenching & Pad Digging (Axis 1-6)',
            start_date: '2025-01-20',
            end_date: '2025-01-28',
            duration_days: 8,
            progress: 100,
            resources: {
              labour: [
                { trade: 'Operator (Plant)', count: 2, rating_ids: ['REG-8821', 'REG-9012'] },
                { trade: 'Civil Labour (VSS)', count: 6 }
              ],
              materials: [
                { item_code: 'MAT-TIM-01', name: 'Planking & Strutting Timber', qty: '120 Lft', voucher_ref: 'NAV-2025-081' }
              ],
              tools_plant: [
                { name: 'Backhoe Excavator JCB 3CX', reg_no: 'SLN-EN-441', hours: 38 },
                { name: 'Submersible Mud Pump 2"', count: 1 }
              ]
            }
          },
          {
            id: 'sub_1_2_2',
            wbs_code: '1.2.2',
            name: 'Manual Trimming & Pit Level Compaction',
            start_date: '2025-01-29',
            end_date: '2025-02-08',
            duration_days: 10,
            progress: 100,
            resources: {
              labour: [
                { trade: 'Mason (MA)', count: 4 },
                { trade: 'Civil Labour (VSS)', count: 8 }
              ],
              materials: [
                { item_code: 'MAT-AGG-04', name: 'Quarry Dust / Granam', qty: '15 Cube', voucher_ref: 'NAV-2025-094' }
              ],
              tools_plant: [
                { name: 'Plate Compactor 5HP', count: 2 }
              ]
            }
          }
        ]
      },
      {
        id: 'task_1_3',
        wbs: '1.3',
        wbs_code: '1.3',
        level: 3,
        parent_id: 'pkg_1_0',
        phase: 'Substructure & Foundation',
        name: 'Soil Compaction & In-situ Density Testing (Proctor)',
        dur: 5,
        duration_days: 5,
        start: 24,
        prog: 100,
        progress: 100,
        planned_progress: 100,
        weight: 3,
        critical: true,
        is_critical: true,
        is_expanded: false,
        track_index: 0,
        trade: 'UL',
        cost: 350000,
        dependencies: [
          { target_id: 'task_1_2', type: 'FS', lag_days: 1 }
        ],
        sub_tasks: [
          {
            id: 'sub_1_3_1',
            wbs_code: '1.3.1',
            name: 'Layer-by-Layer Vibratory Plate Compaction',
            start_offset: 0,
            duration_days: 3,
            progress: 100,
            resources: {
              labour: [{ trade: 'Civil Labour (VSS)', count: 4 }],
              materials: [],
              tools_plant: [{ name: 'Plate Compactor 5HP', count: 2 }]
            }
          },
          {
            id: 'sub_1_3_2',
            wbs_code: '1.3.2',
            name: 'Sand Cone In-situ Density & Moisture Verification',
            start_offset: 3,
            duration_days: 2,
            progress: 100,
            resources: {
              labour: [{ trade: 'QA/QC Technician (CE)', count: 2 }],
              materials: [{ item_code: 'MAT-TST-01', name: 'Standard Ottawa Test Sand', qty: '4 Bags', voucher_ref: 'NAV-2025-102' }],
              tools_plant: [{ name: 'Nuclear Moisture Gauge / Sand Cone Set', count: 1 }]
            }
          }
        ]
      },
      {
        id: 'task_1_4',
        wbs: '1.4',
        wbs_code: '1.4',
        level: 3,
        parent_id: 'pkg_1_0',
        phase: 'Substructure & Foundation',
        name: 'Pad Footings Concreting & Rebar Cage Assembly (Grade 30)',
        dur: 15,
        duration_days: 15,
        start: 29,
        prog: 65,
        progress: 65,
        planned_progress: 80,
        weight: 8,
        critical: true,
        is_critical: true,
        is_expanded: false,
        track_index: 0,
        trade: 'MA',
        cost: 2100000,
        dependencies: [
          { target_id: 'task_1_3', type: 'FS', lag_days: 0 }
        ],
        sub_tasks: [
          {
            id: 'sub_1_4_1',
            wbs_code: '1.4.1',
            name: 'Rebar Cage Prefabrication & Starter Bar Tying (T16 & T20)',
            start_offset: 0,
            duration_days: 8,
            progress: 100,
            resources: {
              labour: [{ trade: 'Barbender (BB)', count: 6 }, { trade: 'Civil Labour (VSS)', count: 4 }],
              materials: [{ item_code: 'MAT-STL-01', name: 'Tor Steel 16mm/20mm', qty: '12 MT', voucher_ref: 'NAV-2025-121' }],
              tools_plant: [{ name: 'Rebar Bending Machine 32mm', count: 1 }]
            }
          },
          {
            id: 'sub_1_4_2',
            wbs_code: '1.4.2',
            name: 'Steel Formwork Shuttering & Holding Down Bolt Alignment',
            start_offset: 6,
            duration_days: 7,
            progress: 20,
            resources: {
              labour: [{ trade: 'Carpenter (CA)', count: 4 }, { trade: 'Fitter (WE)', count: 2 }],
              materials: [{ item_code: 'MAT-TIM-02', name: 'Film-Faced Plywood 18mm', qty: '40 Sheets', voucher_ref: 'NAV-2025-132' }],
              tools_plant: [{ name: 'Digital Theodolite', count: 1 }]
            }
          }
        ]
      },
      // ── Statutory Milestone Gate 1 ──
      {
        id: 'ms_gate_1',
        wbs: '1.4.M',
        wbs_code: '1.4.M',
        level: 3,
        parent_id: 'pkg_1_0',
        phase: 'Substructure & Foundation',
        name: 'Statutory Gate 1: Reinforcement Verification by CE before Concrete Pour',
        type: 'milestone',
        dur: 0,
        duration_days: 0,
        start: 44,
        prog: 100,
        progress: 100,
        planned_progress: 100,
        weight: 2,
        critical: true,
        is_critical: true,
        milestone_gate: 'Gate 1',
        status: 'achieved',
        dependencies: [
          { target_id: 'task_1_4', type: 'FS', lag_days: 0 }
        ]
      },
      {
        id: 'task_1_5',
        wbs: '1.5',
        wbs_code: '1.5',
        level: 3,
        parent_id: 'pkg_1_0',
        phase: 'Substructure & Foundation',
        name: 'Plinth Tie Beam Concreting & Column Pedestals',
        dur: 14,
        duration_days: 14,
        start: 44,
        prog: 30,
        progress: 30,
        planned_progress: 45,
        weight: 6,
        critical: true,
        is_critical: true,
        is_expanded: false,
        track_index: 0,
        trade: 'MA',
        cost: 1650000,
        dependencies: [
          { target_id: 'ms_gate_1', type: 'FS', lag_days: 0 }
        ]
      },
      // ── Statutory Milestone Gate 2 ──
      {
        id: 'ms_gate_2',
        wbs: '1.5.M',
        wbs_code: '1.5.M',
        level: 3,
        parent_id: 'pkg_1_0',
        phase: 'Substructure & Foundation',
        name: 'Statutory Gate 2: Cube Test 7-Day / 28-Day Compressive Strength Sign-off (BS EN 12390)',
        type: 'milestone',
        dur: 0,
        duration_days: 0,
        start: 58,
        prog: 50,
        progress: 50,
        planned_progress: 50,
        weight: 2,
        critical: true,
        is_critical: true,
        milestone_gate: 'Gate 2',
        status: 'pending',
        dependencies: [
          { target_id: 'task_1_5', type: 'FS', lag_days: 7 }
        ]
      },
      {
        id: 'task_1_6',
        wbs: '1.6',
        wbs_code: '1.6',
        level: 3,
        parent_id: 'pkg_1_0',
        phase: 'Substructure & Foundation',
        name: 'Sub-base Backfilling, Heavy Compaction & Vapor Barrier',
        dur: 10,
        duration_days: 10,
        start: 58,
        prog: 0,
        progress: 0,
        planned_progress: 15,
        weight: 4,
        critical: false,
        is_critical: false,
        is_expanded: false,
        track_index: 0,
        trade: 'UL',
        cost: 650000,
        dependencies: [
          { target_id: 'task_1_5', type: 'FS', lag_days: 2 }
        ]
      },

      // ── Level 2: Work Package 2.0 Superstructure Steel Fabrication & Erection ──
      {
        id: 'pkg_2_0',
        wbs: '2.0',
        wbs_code: '2.0',
        level: 2,
        type: 'package',
        phase: 'Superstructure & Structural Steel',
        name: '2.0 Superstructure Steel Fabrication & Erection',
        dur: 40,
        duration_days: 40,
        start: 58,
        prog: 25,
        progress: 25,
        planned_progress: 35,
        weight: 35,
        critical: true,
        is_critical: true,
        trade: 'WE'
      },
      {
        id: 'task_2_1',
        wbs: '2.1',
        wbs_code: '2.1',
        level: 3,
        parent_id: 'pkg_2_0',
        phase: 'Superstructure & Structural Steel',
        name: 'Universal Steel Columns Erection (UC 254x254) & Alignment',
        dur: 18,
        duration_days: 18,
        start: 58,
        prog: 50,
        progress: 50,
        planned_progress: 50,
        weight: 12,
        critical: true,
        is_critical: true,
        is_expanded: false,
        track_index: 0,
        trade: 'WE',
        cost: 4500000,
        dependencies: [
          { target_id: 'task_1_5', type: 'FS', lag_days: 1 }
        ]
      },
      // Concurrent Task Bar on Track 1 (demonstrating multi-track concurrent lane placement!)
      {
        id: 'task_2_2',
        wbs: '2.2',
        wbs_code: '2.2',
        level: 3,
        parent_id: 'pkg_2_0',
        phase: 'Superstructure & Structural Steel',
        name: 'Prefab Truss Assembly (Bay 1-4) & Ground Gusset Welding',
        dur: 16,
        duration_days: 16,
        start: 62,
        prog: 35,
        progress: 35,
        planned_progress: 50,
        weight: 10,
        critical: false,
        is_critical: false,
        is_expanded: false,
        track_index: 1, // Track Index 1: Multi-track concurrent lane!
        trade: 'WE',
        cost: 3800000,
        dependencies: [
          { target_id: 'task_2_1', type: 'SS', lag_days: 4 }
        ]
      },
      {
        id: 'task_2_3',
        wbs: '2.3',
        wbs_code: '2.3',
        level: 3,
        parent_id: 'pkg_2_0',
        phase: 'Superstructure & Structural Steel',
        name: 'Steel Roof Truss Crane Lifting & Gantry Alignment (Bay 1-6)',
        dur: 16,
        duration_days: 16,
        start: 76,
        prog: 0,
        progress: 0,
        planned_progress: 10,
        weight: 13,
        critical: true,
        is_critical: true,
        is_expanded: false,
        track_index: 0,
        trade: 'WE',
        cost: 6500000,
        dependencies: [
          { target_id: 'task_2_1', type: 'FS', lag_days: 0 },
          { target_id: 'task_2_2', type: 'FF', lag_days: 2 }
        ]
      },

      // ── Level 2: Work Package 3.0 Envelope, Roofing & Walling ──
      {
        id: 'pkg_3_0',
        wbs: '3.0',
        wbs_code: '3.0',
        level: 2,
        type: 'package',
        phase: 'Envelope, Roofing & Walling',
        name: '3.0 Envelope, Roofing & Walling',
        dur: 30,
        duration_days: 30,
        start: 92,
        prog: 0,
        progress: 0,
        planned_progress: 0,
        weight: 18,
        critical: false,
        is_critical: false,
        trade: 'CA'
      },
      {
        id: 'task_3_1',
        wbs: '3.1',
        wbs_code: '3.1',
        level: 3,
        parent_id: 'pkg_3_0',
        phase: 'Envelope, Roofing & Walling',
        name: 'Zinc-Alum 0.47mm AZ150 Color-bonded Roof Cladding Laying',
        dur: 14,
        duration_days: 14,
        start: 92,
        prog: 0,
        progress: 0,
        planned_progress: 0,
        weight: 9,
        critical: false,
        is_critical: false,
        is_expanded: false,
        track_index: 0,
        trade: 'CA',
        cost: 3800000,
        dependencies: [
          { target_id: 'task_2_3', type: 'FS', lag_days: 0 }
        ]
      },
      {
        id: 'task_3_2',
        wbs: '3.2',
        wbs_code: '3.2',
        level: 3,
        parent_id: 'pkg_3_0',
        phase: 'Envelope, Roofing & Walling',
        name: 'Cement Block Masonry Perimeter Walling 200mm Thick',
        dur: 20,
        duration_days: 20,
        start: 85,
        prog: 0,
        progress: 0,
        planned_progress: 0,
        weight: 9,
        critical: false,
        is_critical: false,
        is_expanded: false,
        track_index: 0,
        trade: 'MA',
        cost: 2400000,
        dependencies: [
          { target_id: 'task_2_1', type: 'FS', lag_days: 5 }
        ]
      },

      // ── Level 2: Work Package 4.0 Flooring, Marine Systems & Statutory Handover ──
      {
        id: 'pkg_4_0',
        wbs: '4.0',
        wbs_code: '4.0',
        level: 2,
        type: 'package',
        phase: 'Flooring, Services & Handover',
        name: '4.0 Flooring, Marine Systems & Statutory Handover',
        dur: 35,
        duration_days: 35,
        start: 106,
        prog: 0,
        progress: 0,
        planned_progress: 0,
        weight: 17,
        critical: true,
        is_critical: true,
        trade: 'MA'
      },
      {
        id: 'task_4_1',
        wbs: '4.1',
        wbs_code: '4.1',
        level: 3,
        parent_id: 'pkg_4_0',
        phase: 'Flooring, Services & Handover',
        name: 'Heavy-Duty 200mm Reinforced Concrete Floor Slab with Hardener',
        dur: 15,
        duration_days: 15,
        start: 106,
        prog: 0,
        progress: 0,
        planned_progress: 0,
        weight: 8,
        critical: true,
        is_critical: true,
        is_expanded: false,
        track_index: 0,
        trade: 'MA',
        cost: 6200000,
        dependencies: [
          { target_id: 'task_3_1', type: 'FS', lag_days: 0 }
        ]
      },
      {
        id: 'task_4_2',
        wbs: '4.2',
        wbs_code: '4.2',
        level: 3,
        parent_id: 'pkg_4_0',
        phase: 'Flooring, Services & Handover',
        name: '3-Phase Industrial Power Cabling, High-Bay LED Lights & Earthing',
        dur: 12,
        duration_days: 12,
        start: 110,
        prog: 0,
        progress: 0,
        planned_progress: 0,
        weight: 5,
        critical: false,
        is_critical: false,
        is_expanded: false,
        track_index: 1, // Concurrent lane on Track 1!
        trade: 'EL',
        cost: 2100000,
        dependencies: [
          { target_id: 'task_4_1', type: 'SS', lag_days: 4 }
        ]
      },
      // ── Statutory Milestone Gate 3 ──
      {
        id: 'ms_gate_3',
        wbs: '4.0.M',
        wbs_code: '4.0.M',
        level: 3,
        parent_id: 'pkg_4_0',
        phase: 'Flooring, Services & Handover',
        name: 'Statutory Gate 3: CCED Statutory Financial Audit & Stage Completion Certificate',
        type: 'milestone',
        dur: 0,
        duration_days: 0,
        start: 135,
        prog: 0,
        progress: 0,
        planned_progress: 0,
        weight: 4,
        critical: true,
        is_critical: true,
        milestone_gate: 'Gate 3',
        status: 'pending',
        dependencies: [
          { target_id: 'task_4_1', type: 'FS', lag_days: 14 }
        ]
      }
    ],
    'Pier/Maritime': [
      { id: 'pkg_1_0', wbs: '1.0', wbs_code: '1.0', level: 2, type: 'package', phase: 'Marine Survey & Piling', name: '1.0 Marine Survey & Piling Substructure', dur: 38, duration_days: 38, start: 0, prog: 92, progress: 92, planned_progress: 95, weight: 30, critical: true, is_critical: true, trade: 'UL' },
      { id: 'task_1_1', wbs: '1.1', wbs_code: '1.1', level: 3, parent_id: 'pkg_1_0', phase: 'Marine Survey & Piling', name: 'Bathymetric Survey, Tidal Benchmarking & Barge Setup', dur: 10, duration_days: 10, start: 0, prog: 100, progress: 100, planned_progress: 100, weight: 5, critical: true, is_critical: true, is_expanded: false, track_index: 0, trade: 'UL', cost: 850000 },
      { id: 'task_1_2', wbs: '1.2', wbs_code: '1.2', level: 3, parent_id: 'pkg_1_0', phase: 'Marine Survey & Piling', name: 'Marine Driving of Pre-stressed Concrete Spun Piles 600mm dia', dur: 28, duration_days: 28, start: 10, prog: 90, progress: 90, planned_progress: 95, weight: 25, critical: true, is_critical: true, is_expanded: false, track_index: 0, trade: 'WE', cost: 18500000, dependencies: [{ target_id: 'task_1_1', type: 'FS', lag_days: 0 }] },
      { id: 'ms_mar_1', wbs: '1.2.M', wbs_code: '1.2.M', level: 3, parent_id: 'pkg_1_0', phase: 'Marine Survey & Piling', name: 'Statutory Gate 1: Dynamic Pile Load Test & PDA Verification', type: 'milestone', dur: 0, duration_days: 0, start: 38, prog: 100, progress: 100, planned_progress: 100, weight: 2, critical: true, is_critical: true, milestone_gate: 'Gate 1', status: 'achieved', dependencies: [{ target_id: 'task_1_2', type: 'FS', lag_days: 0 }] },
      { id: 'pkg_2_0', wbs: '2.0', wbs_code: '2.0', level: 2, type: 'package', phase: 'Substructure & Deck', name: '2.0 Substructure & Marine Decking', dur: 32, duration_days: 32, start: 38, prog: 45, progress: 45, planned_progress: 60, weight: 35, critical: true, is_critical: true, trade: 'MA' },
      { id: 'task_2_1', wbs: '2.1', wbs_code: '2.1', level: 3, parent_id: 'pkg_2_0', phase: 'Substructure & Deck', name: 'Underwater Epoxy Encasement & Pile Head Chipping', dur: 14, duration_days: 14, start: 38, prog: 60, progress: 60, planned_progress: 75, weight: 12, critical: true, is_critical: true, is_expanded: false, track_index: 0, trade: 'MA', cost: 4200000, dependencies: [{ target_id: 'ms_mar_1', type: 'FS', lag_days: 0 }] },
      { id: 'task_2_2', wbs: '2.2', wbs_code: '2.2', level: 3, parent_id: 'pkg_2_0', phase: 'Substructure & Deck', name: 'Reinforced Concrete Marine Grade M35 Pile Caps Casting', dur: 18, duration_days: 18, start: 52, prog: 30, progress: 30, planned_progress: 45, weight: 18, critical: true, is_critical: true, is_expanded: false, track_index: 0, trade: 'MA', cost: 9800000, dependencies: [{ target_id: 'task_2_1', type: 'FS', lag_days: 0 }] },
      { id: 'task_2_3', wbs: '2.3', wbs_code: '2.3', level: 3, parent_id: 'pkg_2_0', phase: 'Substructure & Deck', name: 'Precast Beam Placement & Longitudinal Tendon Grouting', dur: 16, duration_days: 16, start: 56, prog: 20, progress: 20, planned_progress: 30, weight: 15, critical: false, is_critical: false, is_expanded: false, track_index: 1, trade: 'BB', cost: 7400000, dependencies: [{ target_id: 'task_2_2', type: 'SS', lag_days: 4 }] },
      { id: 'ms_mar_2', wbs: '2.2.M', wbs_code: '2.2.M', level: 3, parent_id: 'pkg_2_0', phase: 'Substructure & Deck', name: 'Statutory Gate 2: Cube Test 28-Day Marine Compressive Strength Sign-off', type: 'milestone', dur: 0, duration_days: 0, start: 80, prog: 0, progress: 0, planned_progress: 0, weight: 2, critical: true, is_critical: true, milestone_gate: 'Gate 2', status: 'pending', dependencies: [{ target_id: 'task_2_2', type: 'FS', lag_days: 10 }] },
      { id: 'pkg_3_0', wbs: '3.0', wbs_code: '3.0', level: 2, type: 'package', phase: 'Services & Commissioning', name: '3.0 Marine Bollards, Heavy Fenders & Handover', dur: 26, duration_days: 26, start: 80, prog: 0, progress: 0, planned_progress: 0, weight: 35, critical: true, is_critical: true, trade: 'WE' },
      { id: 'task_3_1', wbs: '3.1', wbs_code: '3.1', level: 3, parent_id: 'pkg_3_0', phase: 'Services & Commissioning', name: 'Installation of Heavy Arch Rubber Fenders & Cast Steel Bollards', dur: 12, duration_days: 12, start: 80, prog: 0, progress: 0, planned_progress: 0, weight: 15, critical: false, is_critical: false, is_expanded: false, track_index: 0, trade: 'WE', cost: 3500000, dependencies: [{ target_id: 'ms_mar_2', type: 'FS', lag_days: 0 }] },
      { id: 'task_3_2', wbs: '3.2', wbs_code: '3.2', level: 3, parent_id: 'pkg_3_0', phase: 'Services & Commissioning', name: 'Bunkering Water Supply Line & Marine Navigational Lighting', dur: 10, duration_days: 10, start: 86, prog: 0, progress: 0, planned_progress: 0, weight: 10, critical: true, is_critical: true, is_expanded: false, track_index: 1, trade: 'PL', cost: 1800000, dependencies: [{ target_id: 'task_3_1', type: 'SS', lag_days: 6 }] },
      { id: 'ms_mar_3', wbs: '3.0.M', wbs_code: '3.0.M', level: 3, parent_id: 'pkg_3_0', phase: 'Services & Commissioning', name: 'Statutory Gate 3: CCED Marine Berth Load Test & Stage Completion Sign-off', type: 'milestone', dur: 0, duration_days: 0, start: 106, prog: 0, progress: 0, planned_progress: 0, weight: 5, critical: true, is_critical: true, milestone_gate: 'Gate 3', status: 'pending', dependencies: [{ target_id: 'task_3_2', type: 'FS', lag_days: 10 }] }
    ],
    'General/Renovation': [
      { id: 'pkg_1_0', wbs: '1.0', wbs_code: '1.0', level: 2, type: 'package', phase: 'Audit & Civil Repairs', name: '1.0 Structural Audit & Civil Rehabilitation', dur: 23, duration_days: 23, start: 0, prog: 90, progress: 90, planned_progress: 95, weight: 35, critical: true, is_critical: true, trade: 'UL' },
      { id: 'task_1_1', wbs: '1.1', wbs_code: '1.1', level: 3, parent_id: 'pkg_1_0', phase: 'Audit & Civil Repairs', name: 'Structural Integrity Audit, Defect Mapping & Controlled Strip-out', dur: 8, duration_days: 8, start: 0, prog: 100, progress: 100, planned_progress: 100, weight: 10, critical: true, is_critical: true, is_expanded: false, track_index: 0, trade: 'UL', cost: 350000 },
      { id: 'task_1_2', wbs: '1.2', wbs_code: '1.2', level: 3, parent_id: 'pkg_1_0', phase: 'Audit & Civil Repairs', name: 'Spalling Concrete Repair, Anti-corrosion Rebar Coating & Grouting', dur: 15, duration_days: 15, start: 8, prog: 85, progress: 85, planned_progress: 90, weight: 25, critical: true, is_critical: true, is_expanded: false, track_index: 0, trade: 'MA', cost: 1250000, dependencies: [{ target_id: 'task_1_1', type: 'FS', lag_days: 0 }] },
      { id: 'ms_ren_1', wbs: '1.2.M', wbs_code: '1.2.M', level: 3, parent_id: 'pkg_1_0', phase: 'Audit & Civil Repairs', name: 'Statutory Gate 1: Rebar Primer & Core Test Structural Verification', type: 'milestone', dur: 0, duration_days: 0, start: 23, prog: 100, progress: 100, planned_progress: 100, weight: 2, critical: true, is_critical: true, milestone_gate: 'Gate 1', status: 'achieved', dependencies: [{ target_id: 'task_1_2', type: 'FS', lag_days: 0 }] },
      { id: 'pkg_2_0', wbs: '2.0', wbs_code: '2.0', level: 2, type: 'package', phase: 'Roofing & Finishes', name: '2.0 Roofing, Finishes & Joint Inspection', dur: 45, duration_days: 45, start: 23, prog: 20, progress: 20, planned_progress: 35, weight: 65, critical: true, is_critical: true, trade: 'CA' },
      { id: 'task_2_1', wbs: '2.1', wbs_code: '2.1', level: 3, parent_id: 'pkg_2_0', phase: 'Roofing & Finishes', name: 'Roof Truss Structural Strengthening & Waterproof Membrane Laying', dur: 14, duration_days: 14, start: 23, prog: 40, progress: 40, planned_progress: 55, weight: 20, critical: true, is_critical: true, is_expanded: false, track_index: 0, trade: 'CA', cost: 1950000, dependencies: [{ target_id: 'ms_ren_1', type: 'FS', lag_days: 0 }] },
      { id: 'task_2_2', wbs: '2.2', wbs_code: '2.2', level: 3, parent_id: 'pkg_2_0', phase: 'Roofing & Finishes', name: 'Plaster Repair, Crack Injection & Damp-Proof Course (DPC)', dur: 12, duration_days: 12, start: 27, prog: 20, progress: 20, planned_progress: 30, weight: 15, critical: false, is_critical: false, is_expanded: false, track_index: 1, trade: 'MA', cost: 980000, dependencies: [{ target_id: 'task_2_1', type: 'SS', lag_days: 4 }] },
      { id: 'ms_ren_2', wbs: '2.1.M', wbs_code: '2.1.M', level: 3, parent_id: 'pkg_2_0', phase: 'Roofing & Finishes', name: 'Statutory Gate 2: 24-Hour Ponding & Water Tightness Test Sign-off', type: 'milestone', dur: 0, duration_days: 0, start: 37, prog: 0, progress: 0, planned_progress: 0, weight: 2, critical: true, is_critical: true, milestone_gate: 'Gate 2', status: 'pending', dependencies: [{ target_id: 'task_2_1', type: 'FS', lag_days: 0 }] },
      { id: 'task_3_1', wbs: '3.1', wbs_code: '3.1', level: 3, parent_id: 'pkg_2_0', phase: 'Roofing & Finishes', name: 'Concealed Electrical Rewiring, Sub-Distribution & Sanitary Fittings', dur: 14, duration_days: 14, start: 38, prog: 0, progress: 0, planned_progress: 0, weight: 16, critical: true, is_critical: true, is_expanded: false, track_index: 0, trade: 'EL', cost: 1450000, dependencies: [{ target_id: 'ms_ren_2', type: 'FS', lag_days: 1 }] },
      { id: 'task_3_2', wbs: '3.2', wbs_code: '3.2', level: 3, parent_id: 'pkg_2_0', phase: 'Roofing & Finishes', name: 'External & Internal Weather-shield Emulsion Paint Application', dur: 10, duration_days: 10, start: 52, prog: 0, progress: 0, planned_progress: 0, weight: 13, critical: true, is_critical: true, is_expanded: false, track_index: 0, trade: 'PA', cost: 890000, dependencies: [{ target_id: 'task_3_1', type: 'FS', lag_days: 0 }] },
      { id: 'ms_ren_3', wbs: '4.0.M', wbs_code: '4.0.M', level: 3, parent_id: 'pkg_2_0', phase: 'Roofing & Finishes', name: 'Statutory Gate 3: Joint Final Handover Protocol with Station In-charge', type: 'milestone', dur: 0, duration_days: 0, start: 68, prog: 0, progress: 0, planned_progress: 0, weight: 5, critical: true, is_critical: true, milestone_gate: 'Gate 3', status: 'pending', dependencies: [{ target_id: 'task_3_2', type: 'FS', lag_days: 6 }] }
    ]
  };

  class ProgressCenterModule {
    constructor() {
      this.selectedProjectId = null;
      this.activeSubProjectId = null;
      this._isWbsCollapsed = false;
      this.activeTab = 'gantt'; // 'gantt' | 'tasks' | 'materials' | 'labour' | 'plant' | 'evm' | 'qa'
      this.zoom = 'Weeks'; // 'Days' | 'Weeks' | 'Months'
      this.dayW = 32;
      this.geometricScale = 1.0;
      this._scrollHudTimeout = null;
      this.statusFilter = 'All';
      this.projectDataCache = {};
      this.connectorLineType = 'orthogonal'; // 'orthogonal' | 'curved' | 'straight'
      this.showDependencyLinks = true;
      this._currentDepLinks = [];
      this._activeHoveredTaskId = null;
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

      // ── Sub-Projects Architecture (Combined Projects Support) ──
      const cleanPid = (pid || 'PRJ').replace(/[^a-zA-Z0-9_-]/g, '_');
      let subProjects = null;

      try {
        const savedSubProjects = localStorage.getItem('pc_subprojects_' + cleanPid);
        if (savedSubProjects) {
          const parsed = JSON.parse(savedSubProjects);
          if (Array.isArray(parsed) && parsed.length > 0) {
            subProjects = parsed;
          }
        }
      } catch (e) {}

      if (!subProjects && project.subProjects && Array.isArray(project.subProjects) && project.subProjects.length > 0) {
        subProjects = project.subProjects;
      }

      if (!subProjects) {
        if (pName.includes('FLOATING') || pName.includes('DOCK') || pid === 'NP-020' || pid === 'NP-VOTE2231012506-020') {
          subProjects = [
            {
              id: `${pid}_sp1`,
              code: 'SP-01',
              name: 'Mooring Dolphins, Piling & Marine Anchors',
              vote: project.voteNumber || 'VOTE 2506',
              officer: 'Lt Cdr KMAU Kahandawa',
              budget: 38000000,
              spent: 28500000,
              progress: 75,
              status: 'Active',
              startDate: '2025-01-01',
              endDate: '2025-08-30',
              color: '#38bdf8',
              tasks: ['pkg_1_0', 'task_1_1', 'task_1_2', 'ms_mar_1', 'task_2_1'],
              scope: 'Pre-stressed spun concrete piles 600mm dia, dynamic PDA load tests, marine epoxy encasement & chain ground tackle.'
            },
            {
              id: `${pid}_sp2`,
              code: 'SP-02',
              name: 'High-Voltage Shore Power & Substation Integration',
              vote: project.voteNumber || 'VOTE 2506',
              officer: 'Lt M. Fernando',
              budget: 24500000,
              spent: 9800000,
              progress: 40,
              status: 'Active',
              startDate: '2025-03-01',
              endDate: '2025-11-30',
              color: '#10b981',
              tasks: ['task_2_2', 'task_2_3', 'ms_mar_2'],
              scope: 'Installation of 33kV to 415V step-down transformer, waterproof shore-to-dock power receptacle pits, frequency converter synchronizer.'
            },
            {
              id: `${pid}_sp3`,
              code: 'SP-03',
              name: 'Dock Basin Deepening & Bathymetric Dredging',
              vote: project.voteNumber || 'VOTE 2506',
              officer: 'Lt W. Kumara',
              budget: 26000000,
              spent: 22100000,
              progress: 85,
              status: 'Active',
              startDate: '2025-01-15',
              endDate: '2025-06-30',
              color: '#f59e0b',
              tasks: ['task_3_1'],
              scope: 'Cutter suction dredging of dock approach fairway and pit to -8.5m Chart Datum with hydrographic multibeam sonar validation.'
            },
            {
              id: `${pid}_sp4`,
              code: 'SP-04',
              name: 'Submersible Ballast Pumping & Valve Manifold System',
              vote: project.voteNumber || 'VOTE 2506',
              officer: 'Lt Cdr S. Pathirana',
              budget: 18500000,
              spent: 3700000,
              progress: 20,
              status: 'In Progress',
              startDate: '2025-05-01',
              endDate: '2026-02-28',
              color: '#a855f7',
              tasks: ['task_3_2'],
              scope: 'Dual 600 m3/hr explosion-proof ballast dewatering pumps, pneumatic butterfly valves, remote tank sounding telemetry.'
            },
            {
              id: `${pid}_sp5`,
              code: 'SP-05',
              name: 'Access Gangway Ramp, Catwalks & Mobile Craneway',
              vote: project.voteNumber || 'VOTE 2506',
              officer: 'Lt K. Bandara',
              budget: 13000000,
              spent: 1300000,
              progress: 10,
              status: 'Pending',
              startDate: '2025-07-01',
              endDate: '2026-05-31',
              color: '#ec4899',
              tasks: ['ms_mar_3'],
              scope: 'Structural steel articulated gangway ramp (30m span), floating pontoon mooring catenary, 25T mobile crane rail alignment.'
            }
          ];
        } else if (pName.includes('JETTY') || pName.includes('PIER') || pName.includes('BERTH')) {
          subProjects = [
            {
              id: `${pid}_sp1`,
              code: 'SP-01',
              name: 'Deep Sea Piling & Reinforced Concrete Berth',
              vote: project.voteNumber || 'VOTE 2506',
              officer: 'Lt Cdr KMAU Kahandawa',
              budget: Math.round(Number(project.voteAllocation || 60000000) * 0.55),
              spent: Math.round(Number(project.voteAllocation || 60000000) * 0.45),
              progress: 82,
              status: 'Active',
              startDate: '2025-01-01',
              endDate: '2025-09-30',
              color: '#38bdf8',
              tasks: ['pkg_1_0', 'task_1_1', 'task_1_2', 'ms_mar_1', 'task_2_1'],
              scope: 'Marine spun piles, pile cap casting, deck slab reinforcement and grouting.'
            },
            {
              id: `${pid}_sp2`,
              code: 'SP-02',
              name: 'Bunkering Fuel, Fresh Water & Services Pipeline',
              vote: project.voteNumber || 'VOTE 2506',
              officer: 'Lt M. Fernando',
              budget: Math.round(Number(project.voteAllocation || 60000000) * 0.28),
              spent: Math.round(Number(project.voteAllocation || 60000000) * 0.15),
              progress: 55,
              status: 'Active',
              startDate: '2025-04-01',
              endDate: '2025-11-30',
              color: '#10b981',
              tasks: ['task_2_2', 'task_2_3', 'ms_mar_2'],
              scope: 'Marine fuel bunkering manifold, fresh water line, fire hydrant loops.'
            },
            {
              id: `${pid}_sp3`,
              code: 'SP-03',
              name: 'Navigational Lighting, Heavy Fenders & Catwalks',
              vote: project.voteNumber || 'VOTE 2506',
              officer: 'Lt W. Kumara',
              budget: Math.round(Number(project.voteAllocation || 60000000) * 0.17),
              spent: Math.round(Number(project.voteAllocation || 60000000) * 0.05),
              progress: 25,
              status: 'In Progress',
              startDate: '2025-07-01',
              endDate: '2026-03-31',
              color: '#f59e0b',
              tasks: ['task_3_1', 'task_3_2', 'ms_mar_3'],
              scope: 'High arch rubber fenders, cast steel bollards, solar marine navigational aids.'
            }
          ];
        } else {
          const totalAlloc = Number(project.voteAllocation || project.budget || 30000000);
          subProjects = [
            {
              id: `${pid}_sp1`,
              code: 'SP-01',
              name: 'Civil Works, Demolition & Structural Substructure',
              vote: project.voteNumber || 'Civil Capital',
              officer: 'Lt Cdr KMAU Kahandawa',
              budget: Math.round(totalAlloc * 0.45),
              spent: Math.round(totalAlloc * 0.38),
              progress: 80,
              status: 'Active',
              startDate: project.startDate || '2025-01-15',
              endDate: '2025-06-30',
              color: '#38bdf8',
              tasks: ['pkg_1_0', 'task_1_1', 'task_1_2', 'ms_ren_1', 'task_1_3'],
              scope: 'Site preparation, foundation excavations, structural rehabilitation, column casting.'
            },
            {
              id: `${pid}_sp2`,
              code: 'SP-02',
              name: 'Superstructure, Roofing & Specialized Envelopes',
              vote: project.voteNumber || 'Civil Capital',
              officer: 'Lt M. Fernando',
              budget: Math.round(totalAlloc * 0.35),
              spent: Math.round(totalAlloc * 0.15),
              progress: 45,
              status: 'Active',
              startDate: '2025-04-01',
              endDate: '2025-10-31',
              color: '#10b981',
              tasks: ['pkg_2_0', 'task_2_1', 'task_2_2', 'ms_ren_2'],
              scope: 'Structural steel truss erection, sheet roofing, masonry brickwork, weatherproofing.'
            },
            {
              id: `${pid}_sp3`,
              code: 'SP-03',
              name: 'Electrical, Plumbing & Handover Commissioning',
              vote: project.voteNumber || 'Civil Capital',
              officer: 'Lt W. Kumara',
              budget: Math.round(totalAlloc * 0.20),
              spent: Math.round(totalAlloc * 0.05),
              progress: 15,
              status: 'In Progress',
              startDate: '2025-08-01',
              endDate: project.endDate || '2025-12-31',
              color: '#f59e0b',
              tasks: ['pkg_3_0', 'task_3_1', 'task_3_2', 'ms_ren_3'],
              scope: 'Concealed conduit distribution, sanitary fixtures, architectural coatings, final sign-off.'
            }
          ];
        }
      }

      // Link tasks to sub-projects
      baseTasks.forEach((t, idx) => {
        let assignedSp = subProjects.find(sp => sp.tasks && (sp.tasks.includes(t.id) || sp.tasks.includes(t.parent_id)));
        if (!assignedSp) {
          const spIdx = idx % subProjects.length;
          assignedSp = subProjects[spIdx];
        }
        t.sub_project_id = assignedSp.id;
        t.sub_project_code = assignedSp.code;
        t.sub_project_name = assignedSp.name;
        t.sub_project_color = assignedSp.color;
      });

      const fullData = {
        subProjects: subProjects,
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

    // ── Render Component Sub-Projects Portfolio Hub ──
    _renderSubProjectsHub(subProjects, currentProject) {
      if (!subProjects || subProjects.length === 0) return '';

      const activeId = this.activeSubProjectId;
      const totalBudget = subProjects.reduce((sum, sp) => sum + (Number(sp.budget) || 0), 0);
      const avgProg = Math.round(subProjects.reduce((sum, sp) => sum + (Number(sp.progress) || 0), 0) / subProjects.length);

      return `
        <div class="pc-subproj-hub" id="pc-subproj-hub">
          <div class="pc-subproj-hub-header">
            <div class="pc-subproj-hub-title">
              <i class="fas fa-network-wired" style="color:#a855f7;"></i>
              <span>Component Sub-Projects (Execution Workstreams)</span>
              <span class="pc-subproj-badge-count">${subProjects.length} Sub-Projects</span>
              <span class="pc-subproj-budget-total">Combined Allocation: <strong>Rs. ${(totalBudget / 1000000).toFixed(1)}M</strong></span>
            </div>
            <div class="pc-subproj-hub-controls">
              <button class="pc-subproj-filter-pill ${!activeId ? 'is-active' : ''}" 
                      onclick="window.progressCenter.filterSubProject(null)"
                      title="Show complete combined master project schedule">
                <i class="fas fa-globe"></i> Master Combined View (${avgProg}%)
              </button>
              <button class="pc-subproj-add-btn" 
                      onclick="window.progressCenter.openAddSubProjectModal()"
                      title="Add a new component sub-project to this master project">
                <i class="fas fa-plus"></i> Add Sub-Project
              </button>
            </div>
          </div>

          <div class="pc-subproj-cards-grid">
            ${subProjects.map(sp => {
              const isSelected = (activeId === sp.id || activeId === sp.code);
              const pct = Math.round(sp.progress || 0);
              const budgetM = sp.budget ? (sp.budget / 1000000).toFixed(1) : '—';
              const statusClass = sp.status === 'Active' ? 'sp-status-active' : (sp.status === 'In Progress' ? 'sp-status-progress' : 'sp-status-pending');
              const cardBorder = isSelected ? `border-color:${sp.color}; box-shadow: 0 0 16px ${sp.color}44;` : `--sp-color:${sp.color};`;

              return `
                <div class="pc-subproj-card ${isSelected ? 'is-selected' : ''}" 
                     id="pc-subproj-card-${sp.id}"
                     style="${cardBorder}"
                     onclick="window.progressCenter.filterSubProject('${sp.id}')"
                     title="Click to filter schedule by ${sp.code}: ${sp.name}">
                  
                  <div class="pc-subproj-card-top">
                    <span class="pc-subproj-code-badge" style="background:${sp.color}22; color:${sp.color}; border: 1px solid ${sp.color}66;">
                      ${sp.code}
                    </span>
                    <span class="pc-subproj-status-badge ${statusClass}">
                      ${sp.status || 'Active'}
                    </span>
                    <button class="pc-subproj-info-btn" onclick="window.progressCenter.openSubProjectModal('${sp.id}', event)" title="View Sub-Project Detailed Dossier">
                      <i class="fas fa-circle-info"></i>
                    </button>
                  </div>

                  <div class="pc-subproj-name" title="${sp.name}">${sp.name}</div>

                  <div class="pc-subproj-prog-row">
                    <div class="pc-subproj-bar-track">
                      <div class="pc-subproj-bar-fill" style="width:${pct}%; background:${sp.color};"></div>
                    </div>
                    <span class="pc-subproj-pct" style="color:${sp.color};">${pct}%</span>
                  </div>

                  <div class="pc-subproj-meta-row">
                    <span><i class="fas fa-coins" style="color:#f59e0b;"></i> Rs. ${budgetM}M</span>
                    <span><i class="fas fa-user-shield" style="color:#38bdf8;"></i> ${(sp.officer || 'Officer').split(' ')[0]} ${(sp.officer || '').split(' ')[1] || ''}</span>
                    <span><i class="fas fa-tasks" style="color:#a855f7;"></i> ${(sp.tasks || []).length || 3} Tasks</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // ── Filter Sub-Project View ──
    filterSubProject(subProjectId) {
      if (this.activeSubProjectId === subProjectId || !subProjectId || subProjectId === 'all') {
        this.activeSubProjectId = null;
      } else {
        this.activeSubProjectId = subProjectId;
      }

      // Update UI active states
      document.querySelectorAll('.pc-subproj-card').forEach(c => {
        const id = c.id.replace('pc-subproj-card-', '');
        c.classList.toggle('is-selected', id === this.activeSubProjectId);
      });
      const masterPill = document.querySelector('.pc-subproj-filter-pill');
      if (masterPill) masterPill.classList.toggle('is-active', !this.activeSubProjectId);

      // Re-render timeline and WBS with filtered tasks
      const p = this.getSelectedProject();
      if (p) {
        const data = this.getProjectDetailedData(p);
        const wbsContainer = document.getElementById('pc-wbs-rows-container');
        if (wbsContainer && data) wbsContainer.innerHTML = this._renderWbsRows(data.tasks);
      }
      this.renderGanttTimeline();
    }


    // ── Render WBS Rows with Sub-Project Banner & Chips ──
    _renderWbsRows(allTasks) {
      const tasks = this.getVisibleTasks ? this.getVisibleTasks(allTasks) : allTasks;
      const p = this.getSelectedProject ? this.getSelectedProject() : null;
      const data = p && this.getProjectDetailedData ? this.getProjectDetailedData(p) : null;
      const activeSp = (data && data.subProjects && this.activeSubProjectId) 
        ? data.subProjects.find(s => s.id === this.activeSubProjectId || s.code === this.activeSubProjectId) 
        : null;

      const filterBanner = activeSp ? `
        <div class="pc-subproj-filter-banner">
          <div>
            <i class="fas fa-filter" style="color:${activeSp.color};margin-right:6px;"></i>
            <span>Viewing Sub-Project: <strong style="color:${activeSp.color};">${activeSp.code} — ${activeSp.name}</strong> (${tasks.length} tasks)</span>
          </div>
          <button class="pc-subproj-clear-btn" onclick="window.progressCenter.filterSubProject(null)">Show All Sub-Projects</button>
        </div>
      ` : '';

      const rows = tasks.map(t => `
        <div class="pc-wbs-row ${t.weight > 10 ? 'is-phase' : ''}" title="${t.name} (Trade: ${t.trade})">
          <div class="pc-wbs-name">
            <span class="pc-wbs-code" style="font-family:var(--mono);color:#38bdf8;font-size:0.7rem;font-weight:700;">${t.wbs_code || t.wbs}</span>
            ${t.sub_project_code ? `<span class="pc-subproj-chip" style="background:${t.sub_project_color || '#38bdf8'}22; color:${t.sub_project_color || '#38bdf8'}; border: 1px solid ${t.sub_project_color || '#38bdf8'}55;" title="${t.sub_project_name || ''}">${t.sub_project_code}</span>` : ''}
            <span class="pc-wbs-label" style="overflow:hidden;text-overflow:ellipsis;" title="${t.name}">${t.name}</span>
          </div>
          <div class="pc-wbs-dur">${t.dur || t.duration_days || 0}d</div>
          <div class="pc-wbs-prog-wrap">
            <div class="pc-wbs-prog-bar">
              <div class="pc-wbs-prog-fill ${t.critical ? 'fill-critical' : ((t.prog === 100 || t.progress === 100) ? 'fill-complete' : '')}" style="width:${t.prog || t.progress || 0}%;"></div>
            </div>
            <span class="pc-wbs-prog-text">${t.prog || t.progress || 0}%</span>
          </div>
        </div>
      `).join('');

      return filterBanner + rows;
    }

    // ── Get Visible Tasks (accounting for Sub-Project filter) ──
    getVisibleTasks(allTasks) {
      if (!allTasks) return [];
      if (!this.activeSubProjectId) return allTasks;
      const p = this.getSelectedProject();
      if (!p) return allTasks;
      const data = this.getProjectDetailedData(p);
      const sp = (data.subProjects || []).find(s => s.id === this.activeSubProjectId || s.code === this.activeSubProjectId);
      if (!sp) return allTasks;

      return allTasks.filter(t => {
        if (t.sub_project_id === sp.id || t.sub_project_code === sp.code) return true;
        if (sp.tasks && (sp.tasks.includes(t.id) || sp.tasks.includes(t.parent_id))) return true;
        return false;
      });
    }

    _getOrCreateModalOverlay() {
      let overlay = document.getElementById('pc-modal-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'pc-modal-overlay';
        overlay.className = 'modal-overlay pc-modal-overlay';
        overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove('open'); };
        document.body.appendChild(overlay);
      }
      return overlay;
    }

    // ── Open Sub-Project Detailed Specification Modal ──
    openSubProjectModal(subProjectId, event) {
      if (event) event.stopPropagation();
      const p = this.getSelectedProject();
      if (!p) return;
      const data = this.getProjectDetailedData(p);
      const sp = (data.subProjects || []).find(s => s.id === subProjectId || s.code === subProjectId);
      if (!sp) return;

      const overlay = this._getOrCreateModalOverlay();

      const tasksForSp = data.tasks.filter(t => t.sub_project_id === sp.id || t.sub_project_code === sp.code || (sp.tasks && sp.tasks.includes(t.id)));

      overlay.innerHTML = `
        <div class="pc-modal" style="max-width: 680px;">
          <div class="pc-modal-header">
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="pc-subproj-code-badge" style="background:${sp.color}22; color:${sp.color}; border: 1px solid ${sp.color}66; font-size:0.8rem; padding:3px 10px;">
                ${sp.code}
              </span>
              <h3 style="margin:0;font-size:1.1rem;color:#f8fafc;">${sp.name}</h3>
            </div>
            <button class="pc-modal-close" onclick="document.getElementById('pc-modal-overlay').classList.remove('open')">&times;</button>
          </div>

          <div class="pc-modal-body" style="display:flex;flex-direction:column;gap:16px;">
            <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;">
              <div class="pc-kpi-card" style="padding:10px 14px;">
                <span style="font-size:0.7rem;color:#94a3b8;font-weight:700;">ALLOCATION BUDGET</span>
                <div style="font-size:1.1rem;font-weight:800;color:${sp.color};font-family:var(--mono);margin-top:2px;">Rs. ${(sp.budget/1000000).toFixed(1)}M</div>
              </div>
              <div class="pc-kpi-card" style="padding:10px 14px;">
                <span style="font-size:0.7rem;color:#94a3b8;font-weight:700;">PHYSICAL PROGRESS</span>
                <div style="font-size:1.1rem;font-weight:800;color:#22c55e;font-family:var(--mono);margin-top:2px;">${sp.progress}%</div>
              </div>
              <div class="pc-kpi-card" style="padding:10px 14px;">
                <span style="font-size:0.7rem;color:#94a3b8;font-weight:700;">EXECUTION STATUS</span>
                <div style="font-size:0.95rem;font-weight:800;color:#f8fafc;margin-top:4px;">${sp.status}</div>
              </div>
            </div>

            <div style="background:rgba(15,23,42,0.6);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px 14px;">
              <div style="font-size:0.72rem;color:#38bdf8;font-weight:700;text-transform:uppercase;margin-bottom:4px;">SCOPE OF WORK & CIVIL SPECIFICATION</div>
              <p style="font-size:0.82rem;color:#cbd5e1;line-height:1.5;margin:0;">${sp.scope || 'Official component sub-project workstream under SLN Dockyard Civil Engineering Directorate.'}</p>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:0.8rem;color:#94a3b8;">
              <div><i class="fas fa-user-shield" style="color:#f59e0b;margin-right:6px;"></i> Officer In-Charge: <strong style="color:#f8fafc;">${sp.officer || 'Capt. K. Senanayake'}</strong></div>
              <div><i class="fas fa-calendar-alt" style="color:#38bdf8;margin-right:6px;"></i> Schedule: <strong style="color:#f8fafc;">${sp.startDate} to ${sp.endDate}</strong></div>
            </div>

            <div>
              <div style="font-size:0.75rem;color:#f1f5f9;font-weight:700;margin-bottom:8px;display:flex;justify-content:space-between;">
                <span>Sub-Project WBS Work Packages (${tasksForSp.length})</span>
                <span style="color:#38bdf8;font-family:var(--mono);font-size:0.7rem;">Vote: ${sp.vote || 'VOTE 2506'}</span>
              </div>
              <div style="max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;">
                ${tasksForSp.map(t => `
                  <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);padding:6px 10px;border-radius:6px;font-size:0.76rem;">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <span style="font-family:var(--mono);color:${sp.color};font-weight:700;">${t.wbs_code || t.wbs}</span>
                      <span style="color:#e2e8f0;">${t.name}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <span style="color:#94a3b8;font-family:var(--mono);">${t.dur || t.duration_days}d</span>
                      <span style="color:#22c55e;font-weight:700;font-family:var(--mono);">${t.prog || t.progress}%</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="pc-modal-footer" style="display:flex;justify-content:space-between;">
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('pc-modal-overlay').classList.remove('open')">Close</button>
            <button class="btn btn-primary btn-sm" onclick="document.getElementById('pc-modal-overlay').classList.remove('open'); window.progressCenter.filterSubProject('${sp.id}')">
              <i class="fas fa-filter"></i> Focus Gantt & WBS on ${sp.code}
            </button>
          </div>
        </div>
      `;
      overlay.classList.add('open');
    }

    // ── Add New Sub-Project Modal ──
    openAddSubProjectModal() {
      const p = this.getSelectedProject();
      if (!p) return;
      const overlay = this._getOrCreateModalOverlay();

      const data = this.getProjectDetailedData(p);
      const nextNum = (data.subProjects || []).length + 1;
      const nextCode = 'SP-0' + nextNum;

      overlay.innerHTML = `
        <div class="pc-modal" style="max-width: 580px;">
          <div class="pc-modal-header">
            <h3 style="margin:0;font-size:1.1rem;color:#f8fafc;"><i class="fas fa-plus" style="color:#38bdf8;margin-right:8px;"></i>Add Component Sub-Project</h3>
            <button class="pc-modal-close" onclick="document.getElementById('pc-modal-overlay').classList.remove('open')">&times;</button>
          </div>

          <div class="pc-modal-body">
            <form id="pc-add-subproject-form" style="display:flex;flex-direction:column;gap:12px;" onsubmit="event.preventDefault(); window.progressCenter.saveNewSubProject();">
              <div style="display:grid;grid-template-columns:120px 1fr;gap:10px;">
                <div class="pc-form-group">
                  <label>Code</label>
                  <input type="text" id="asp-code" value="${nextCode}" class="form-control" required style="font-family:var(--mono);font-weight:700;">
                </div>
                <div class="pc-form-group">
                  <label>Sub-Project Title</label>
                  <input type="text" id="asp-name" placeholder="e.g. Concrete Berthing Apron & Mooring Blocks" class="form-control" required>
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                <div class="pc-form-group">
                  <label>Officer In-Charge</label>
                  <input type="text" id="asp-officer" value="Lt Cdr KMAU Kahandawa" class="form-control">
                </div>
                <div class="pc-form-group">
                  <label>Budget Allocation (LKR)</label>
                  <input type="number" id="asp-budget" value="15000000" class="form-control" required>
                </div>
              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr 120px;gap:10px;">
                <div class="pc-form-group">
                  <label>Start Date</label>
                  <input type="date" id="asp-start" value="2025-02-01" class="form-control" required>
                </div>
                <div class="pc-form-group">
                  <label>Target Completion</label>
                  <input type="date" id="asp-end" value="2025-10-31" class="form-control" required>
                </div>
                <div class="pc-form-group">
                  <label>Color Accent</label>
                  <select id="asp-color" class="form-control">
                    <option value="#38bdf8" selected>Cyan</option>
                    <option value="#10b981">Emerald</option>
                    <option value="#f59e0b">Amber</option>
                    <option value="#a855f7">Purple</option>
                    <option value="#ec4899">Pink</option>
                  </select>
                </div>
              </div>

              <div class="pc-form-group">
                <label>Scope of Work / Engineering Summary</label>
                <textarea id="asp-scope" class="form-control" rows="3" placeholder="Describe civil and structural scope of work..."></textarea>
              </div>

              <div class="pc-modal-footer" style="padding:10px 0 0 0;margin:0;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('pc-modal-overlay').classList.remove('open')">Cancel</button>
                <button type="submit" class="btn btn-primary btn-sm"><i class="fas fa-check"></i> Add to Master Project</button>
              </div>
            </form>
          </div>
        </div>
      `;
      overlay.classList.add('open');
    }

    // ── Save New Sub-Project ──
    saveNewSubProject() {
      const p = this.getSelectedProject();
      if (!p) return;
      const data = this.getProjectDetailedData(p);
      const code = document.getElementById('asp-code').value.trim();
      const name = document.getElementById('asp-name').value.trim();
      const officer = document.getElementById('asp-officer').value.trim();
      const budget = Number(document.getElementById('asp-budget').value) || 10000000;
      const startDate = document.getElementById('asp-start').value;
      const endDate = document.getElementById('asp-end').value;
      const color = document.getElementById('asp-color').value || '#38bdf8';
      const scope = document.getElementById('asp-scope').value.trim();

      const newSp = {
        id: `${p.id || 'PRJ'}_sp_${Date.now()}`,
        code: code || 'SP-NEW',
        name: name || 'New Component Sub-Project',
        vote: p.voteNumber || 'Civil Vote',
        officer: officer || 'Civil Site Engineer',
        budget: budget,
        spent: 0,
        progress: 0,
        status: 'Active',
        startDate: startDate,
        endDate: endDate,
        color: color,
        tasks: [],
        scope: scope
      };

      data.subProjects = data.subProjects || [];
      data.subProjects.push(newSp);

      const cleanPid = (p.id || p.code || 'PRJ').replace(/[^a-zA-Z0-9_-]/g, '_');
      try {
        localStorage.setItem('pc_subprojects_' + cleanPid, JSON.stringify(data.subProjects));
      } catch (e) {}

      document.getElementById('pc-modal-overlay').classList.remove('open');
      this.toast(`Sub-Project ${newSp.code}: ${newSp.name} added successfully!`, 'success');
      this.render();
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
      this.activeSubProjectId = null;
      this.render();
    }

    // ── Set Zoom Level ──
    setZoom(z) {
      this.zoom = z;
      this.dayW = (z === 'Days') ? 56 : (z === 'Weeks' ? 32 : 16);
      this.geometricScale = 1.0;
      this.applyGeometricZoom(1.0);
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
                  ${(pData.subProjects && pData.subProjects.length > 0) ? `
                    <span class="pc-badge-tag pc-badge-combined" id="pc-badge-combined" title="Combined Master Project: Executed via ${pData.subProjects.length} synchronized sub-projects">
                      <i class="fas fa-network-wired"></i> Combined Master Project • ${pData.subProjects.length} Sub-Projects
                    </span>
                  ` : ''}
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
            ${this._renderSubProjectsHub(pData.subProjects, current)}
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
                  <!-- Dependency Link Line Type Selection & Visibility Toggle -->
                  <div class="pc-link-type-controls" id="pc-link-type-controls">
                    <span class="pc-link-type-label"><i class="fas fa-bezier-curve"></i> Links:</span>
                    <button class="pc-link-btn ${this.connectorLineType === 'orthogonal' ? 'active' : ''}" data-type="orthogonal" onclick="window.progressCenter.setConnectorLineType('orthogonal')" title="Stepped / Orthogonal Elbow Lines (90° Manhattan)"><i class="fas fa-turn-down"></i> Stepped</button>
                    <button class="pc-link-btn ${this.connectorLineType === 'curved' ? 'active' : ''}" data-type="curved" onclick="window.progressCenter.setConnectorLineType('curved')" title="Smooth Bezier S-Curve Lines"><i class="fas fa-wave-square"></i> Curved</button>
                    <button class="pc-link-btn ${this.connectorLineType === 'straight' ? 'active' : ''}" data-type="straight" onclick="window.progressCenter.setConnectorLineType('straight')" title="Direct Vector Straight Lines"><i class="fas fa-arrow-right-long"></i> Direct</button>
                    <button class="pc-link-toggle-btn ${this.showDependencyLinks ? 'active' : 'is-off'}" id="pc-link-toggle-btn" onclick="window.progressCenter.toggleDependencyLinks()" title="Show/Hide Dependency Lines">
                      <i class="fas ${this.showDependencyLinks ? 'fa-eye' : 'fa-eye-slash'}"></i>
                    </button>
                  </div>

                  <div class="pc-toolbar-divider"></div>

                  <span style="font-size:0.72rem;color:#94a3b8;margin-right:4px;">Timeline Scale:</span>
                  <button class="pc-zoom-btn" data-zoom="Days" onclick="window.progressCenter.setZoom('Days')">Days</button>
                  <button class="pc-zoom-btn active" data-zoom="Weeks" onclick="window.progressCenter.setZoom('Weeks')">Weeks</button>
                  <button class="pc-zoom-btn" data-zoom="Months" onclick="window.progressCenter.setZoom('Months')">Months</button>
                  <button class="pc-zoom-reset-btn" id="pc-zoom-reset-btn" onclick="window.progressCenter.resetTimelineZoom()" title="Reset timeline expansion & geometric zoom to 100%"><i class="fas fa-arrows-rotate"></i> Reset (100%)</button>
                  <span class="pc-scroll-help-pill" title="Interactive Scroll Settings:&#10;• Ctrl + Scroll: Expand Timeline (Left end stable)&#10;• Alt + Scroll: Expand Timeline (Center stable)&#10;• Ctrl + Shift + Scroll: Geometric Zoom (Center stable)&#10;• Double-Click Canvas: Reset 100%"><i class="fas fa-keyboard"></i> Scroll Modes</span>
                </div>
              </div>

              <!-- Split View: Left WBS Table, Right Gantt Chart -->
              <div class="pc-gantt-split" id="pc-gantt-split">
                <!-- Left WBS -->
                <div class="pc-wbs-list" id="pc-wbs-list">
                  <div class="pc-wbs-header">
                    <div style="display:flex;align-items:center;gap:8px;">
                      <button id="pc-toggle-wbs-btn" class="pc-wbs-toggle-btn" title="Toggle WBS Table (Shrink table to maximize Gantt span)"><i class="fas fa-table-columns"></i></button>
                      <span>WBS Item / Task Name</span>
                    </div>
                    <span>Dur</span>
                    <span>Progress</span>
                  </div>
                  <div id="pc-wbs-rows-container">
                    ${this._renderWbsRows(pData.tasks)}
                  </div>
                </div>

                <!-- Right Timeline Canvas -->
                <div class="pc-gantt-timeline-wrap" id="pc-gantt-timeline-wrap">
                  <div class="pc-gantt-stage-sizer" id="pc-gantt-stage-sizer">
                    <div class="pc-gantt-timeline-inner" id="pc-gantt-timeline-inner">
                      <!-- Rendered by renderGanttTimeline() -->
                    </div>
                  </div>
                  <!-- Floating Interactive Scroll HUD -->
                  <div class="pc-scroll-hud" id="pc-scroll-hud"></div>
                  <!-- Floating Dependency Link Tooltip -->
                  <div class="pc-dep-tooltip" id="pc-dep-tooltip" style="display:none;"></div>
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

      // Bind WBS table split toggle button
      const toggleWbsBtn = document.getElementById('pc-toggle-wbs-btn');
      const ganttSplit = document.getElementById('pc-gantt-split');
      const wbsList = document.getElementById('pc-wbs-list');
      if (toggleWbsBtn && ganttSplit && wbsList) {
        if (this._isWbsCollapsed) {
          ganttSplit.classList.add('wbs-collapsed');
          wbsList.classList.add('is-collapsed');
          const icon = toggleWbsBtn.querySelector('i');
          if (icon) icon.className = 'fas fa-angles-right';
          toggleWbsBtn.title = 'Expand WBS Table';
        }

        toggleWbsBtn.onclick = (e) => {
          e.stopPropagation();
          this._isWbsCollapsed = !this._isWbsCollapsed;
          ganttSplit.classList.toggle('wbs-collapsed', this._isWbsCollapsed);
          wbsList.classList.toggle('is-collapsed', this._isWbsCollapsed);
          const icon = toggleWbsBtn.querySelector('i');
          if (icon) {
            icon.className = this._isWbsCollapsed ? 'fas fa-angles-right' : 'fas fa-table-columns';
          }
          toggleWbsBtn.title = this._isWbsCollapsed ? 'Expand WBS Table' : 'Collapse WBS Table to maximize Gantt span';

          setTimeout(() => {
            if (this._updateMinimapViewport) this._updateMinimapViewport();
            if (this.syncRowHeights) this.syncRowHeights();
          }, 260);
        };
      }

      // Render timeline for Gantt by default
      setTimeout(() => {
        this.renderGanttTimeline();
        this.initGanttScrollGestures();
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
      const tasks = this.getVisibleTasks(data.tasks);

      if (!tasks || tasks.length === 0) {
        inner.innerHTML = `
          <div class="pc-gantt-empty-state" style="padding: 60px 20px; text-align: center; color: #94a3b8;">
            <i class="fas fa-tasks" style="font-size: 2.2rem; color: #38bdf8; margin-bottom: 12px; display: block; opacity: 0.6;"></i>
            <h4 style="color: #f1f5f9; margin: 0 0 6px 0; font-size: 1rem;">No WBS Tasks Assigned to this Sub-Project</h4>
            <p style="font-size: 0.8rem; margin: 0 auto 16px auto; max-width: 420px; color: #cbd5e1;">Use the 'Add WBS Task' button above or clear the sub-project filter to view the combined project timeline.</p>
            <button class="btn btn-ghost btn-sm" onclick="window.progressCenter.filterSubProject(null)">
              <i class="fas fa-arrows-rotate"></i> Show Complete Master Project Schedule
            </button>
          </div>
        `;
        return;
      }

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
        const offsetDays = Math.floor((tStart - minDate) / 86400000);
        const barLeft = Math.max(0, offsetDays * this.dayW);
        const isMilestone = (t.type === 'milestone' || t.dur === 0);

        if (isMilestone) {
          const mStatus = t.status || (t.prog === 100 ? 'achieved' : (t.critical ? 'critical' : 'pending'));
          return `
            <div class="pc-timeline-row" style="width:${timelineWidth}px;" data-task-id="${t.id}" data-row-idx="${idx}">
              <div class="pc-gantt-milestone status-${mStatus}"
                   id="pc-bar-${t.id}"
                   data-task-id="${t.id}"
                   style="left:${barLeft}px; top:50%;"
                   onmouseenter="window.progressCenter.highlightTaskDependencies('${t.id}')"
                   onmouseleave="window.progressCenter.clearDependencyHighlight()"
                   title="Milestone: ${t.name}">
                <div class="pc-milestone-diamond"><i class="fas fa-flag"></i></div>
                <span class="pc-milestone-label">
                  <span class="pc-milestone-code">${t.wbs_code || t.wbs || 'M'}</span>
                  <span>${t.name}</span>
                  <span class="pc-milestone-status-tag ${mStatus}">${t.status || (t.prog === 100 ? 'Achieved' : 'Pending')}</span>
                </span>
              </div>
            </div>
          `;
        }

        const barWidth = Math.max(12, t.dur * this.dayW);
        return `
          <div class="pc-timeline-row" style="width:${timelineWidth}px;" data-task-id="${t.id}" data-row-idx="${idx}">
            <div class="pc-gantt-bar ${t.critical ? 'is-critical' : (t.prog === 100 ? 'is-complete' : '')}"
                 id="pc-bar-${t.id}"
                 data-task-id="${t.id}"
                 style="left:${barLeft}px; width:${barWidth}px;"
                 onmouseenter="window.progressCenter.highlightTaskDependencies('${t.id}')"
                 onmouseleave="window.progressCenter.clearDependencyHighlight()"
                 title="${t.name} (${t.prog}% complete, ${t.dur} days)">
              <div class="pc-bar-progress" style="width:${t.prog}%;"></div>
              <span class="pc-bar-label">${t.sub_project_code ? `<span class="pc-subproj-chip" style="background:${t.sub_project_color || '#38bdf8'}22; color:${t.sub_project_color || '#38bdf8'}; border: 1px solid ${t.sub_project_color || '#38bdf8'}55;" title="${t.sub_project_name || ''}">${t.sub_project_code}</span>` : ''}${t.wbs} — ${t.name} (${t.prog}%)</span>
            </div>
          </div>
        `;
      }).join('');

      const totalHeight = 42 + tasks.length * 44;
      const depSvgHtml = this._renderDependencySvg(tasks, minDate, timelineWidth, totalHeight);

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
        ${depSvgHtml}
      `;

      // Apply geometric scale and update sizer
      const sizer = document.getElementById('pc-gantt-stage-sizer');
      const scale = this.geometricScale || 1.0;
      inner.style.transform = (scale !== 1.0) ? `scale(${scale})` : '';
      inner.style.transformOrigin = '0 0';

      if (sizer) {
        sizer.style.width = `${Math.round(timelineWidth * scale)}px`;
        const baseHeight = 42 + tasks.length * 44 + 40;
        sizer.style.height = `${Math.round(baseHeight * scale)}px`;
      }

      const ganttMain = document.getElementById('pc-gantt-main');
      if (ganttMain && ganttMain.style) {
        if (ganttMain.style.setProperty) {
          ganttMain.style.setProperty('--pc-canvas-scale', scale);
          ganttMain.style.setProperty('--pc-row-h', `${Math.round(44 * scale)}px`);
        } else {
          ganttMain.style['--pc-canvas-scale'] = scale;
          ganttMain.style['--pc-row-h'] = `${Math.round(44 * scale)}px`;
        }
      }

      const resetBtn = document.getElementById('pc-zoom-reset-btn');
      if (resetBtn) {
        resetBtn.innerHTML = `<i class="fas fa-arrows-rotate"></i> Reset (${Math.round(scale * 100)}%)`;
        resetBtn.classList.toggle('is-modified', scale !== 1.0 || this.dayW !== 32);
      }

      this.initGanttScrollGestures();
    }

    // ═════════════════════════════════════════════════════════════════════
    // GANTT DEPENDENCY LINKS & INTERACTIVE CONNECTOR ENGINE
    // Visualizes task dependencies (FS, SS, FF, SF) & Critical Path
    // Selectable styles: Orthogonal (Stepped Manhattan), Curved Bezier, Direct Straight
    // ═════════════════════════════════════════════════════════════════════

    _renderDependencySvg(tasks, minDate, timelineWidth, totalHeight) {
      if (!tasks || tasks.length === 0) return '';

      const taskMap = new Map();
      tasks.forEach((t, idx) => {
        const tStart = new Date(t.startDateStr);
        const offsetDays = Math.floor((tStart - minDate) / 86400000);
        const isMilestone = (t.type === 'milestone' || t.dur === 0);
        const xStart = Math.max(0, offsetDays * this.dayW);
        const barW = isMilestone ? 18 : Math.max(12, t.dur * this.dayW);
        const xEnd = xStart + barW;
        const yCenter = 42 + idx * 44 + 22;

        taskMap.set(t.id, {
          task: t,
          rowIdx: idx,
          isMilestone,
          xStart,
          xEnd,
          yCenter,
          critical: !!(t.critical || t.is_critical)
        });
      });

      this._currentDepLinks = [];
      const linkGroupsHtml = [];

      tasks.forEach(succTask => {
        const deps = succTask.dependencies || [];
        deps.forEach(dep => {
          const targetId = dep.target_id || dep.id;
          const predInfo = taskMap.get(targetId);
          const succInfo = taskMap.get(succTask.id);
          if (!predInfo || !succInfo) return;

          const depType = (dep.type || 'FS').toUpperCase();
          const lag = dep.lag_days !== undefined ? dep.lag_days : (dep.lag || 0);

          let x1, y1, x2, y2;
          y1 = predInfo.yCenter;
          y2 = succInfo.yCenter;

          if (depType === 'FS') {
            x1 = predInfo.xEnd;
            x2 = succInfo.xStart;
          } else if (depType === 'SS') {
            x1 = predInfo.xStart;
            x2 = succInfo.xStart;
          } else if (depType === 'FF') {
            x1 = predInfo.xEnd;
            x2 = succInfo.xEnd;
          } else if (depType === 'SF') {
            x1 = predInfo.xStart;
            x2 = succInfo.xEnd;
          } else {
            x1 = predInfo.xEnd;
            x2 = succInfo.xStart;
          }

          const isCritical = predInfo.critical && succInfo.critical;
          const pathD = this._calculateConnectorPath(x1, y1, x2, y2, this.connectorLineType, depType);
          const linkId = `dep-${predInfo.task.id}-${succInfo.task.id}`;

          const linkData = {
            id: linkId,
            predId: predInfo.task.id,
            succId: succInfo.task.id,
            type: depType,
            lag: lag,
            isCritical: isCritical,
            predName: predInfo.task.name,
            predWbs: predInfo.task.wbs || predInfo.task.wbs_code || '',
            succName: succInfo.task.name,
            succWbs: succInfo.task.wbs || succInfo.task.wbs_code || '',
            d: pathD
          };
          this._currentDepLinks.push(linkData);

          linkGroupsHtml.push(`
            <g class="pc-dep-link-group" data-link-id="${linkId}" data-pred-id="${predInfo.task.id}" data-succ-id="${succInfo.task.id}">
              <!-- Invisible hit-box path for responsive mouse hovering -->
              <path class="pc-dep-hitbox" d="${pathD}"
                    data-link-id="${linkId}"
                    onmouseenter="window.progressCenter.onLinkHover(event, '${linkId}')"
                    onmousemove="window.progressCenter.onLinkMouseMove(event)"
                    onmouseleave="window.progressCenter.onLinkLeave()"></path>
              <!-- Visible styled path -->
              <path class="pc-dep-path ${isCritical ? 'is-critical' : ''}"
                    id="pc-link-${linkId}"
                    d="${pathD}"
                    marker-end="${isCritical ? 'url(#pc-arrow-critical)' : 'url(#pc-arrow-default)'}"
                    data-link-id="${linkId}"
                    data-pred-id="${predInfo.task.id}"
                    data-succ-id="${succInfo.task.id}"></path>
            </g>
          `);
        });
      });

      const displayStyle = this.showDependencyLinks ? 'block' : 'none';

      return `
        <svg class="pc-gantt-dependency-svg" id="pc-gantt-dependency-svg"
             width="${timelineWidth}" height="${totalHeight}"
             viewBox="0 0 ${timelineWidth} ${totalHeight}"
             style="display:${displayStyle};">
          <defs>
            <marker id="pc-arrow-default" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8"></path>
            </marker>
            <marker id="pc-arrow-critical" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444"></path>
            </marker>
            <marker id="pc-arrow-highlight" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b"></path>
            </marker>
            <filter id="pc-glow-critical" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#ef4444" flood-opacity="0.8"/>
            </filter>
            <filter id="pc-glow-highlight" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#f59e0b" flood-opacity="0.9"/>
            </filter>
          </defs>
          <g class="pc-dep-links-layer" id="pc-dep-links-layer">
            ${linkGroupsHtml.join('')}
          </g>
        </svg>
      `;
    }

    _calculateConnectorPath(x1, y1, x2, y2, lineType, depType) {
      lineType = lineType || 'orthogonal';

      // ── Straight Vector Line ──
      if (lineType === 'straight') {
        return `M ${x1} ${y1} L ${x2} ${y2}`;
      }

      // ── Curved Bezier S-Curve ──
      if (lineType === 'curved') {
        if (depType === 'FS') {
          if (x2 >= x1 + 10) {
            const dx = Math.max(24, (x2 - x1) * 0.45);
            return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
          } else {
            const clr = (y2 >= y1) ? 22 : -22;
            return `M ${x1} ${y1} C ${x1 + 32} ${y1}, ${x1 + 32} ${y1 + clr}, ${Math.round((x1 + x2) / 2)} ${y1 + clr} S ${x2 - 32} ${y2}, ${x2} ${y2}`;
          }
        } else if (depType === 'SS') {
          const minX = Math.min(x1, x2) - 28;
          return `M ${x1} ${y1} C ${minX} ${y1}, ${minX} ${y2}, ${x2} ${y2}`;
        } else if (depType === 'FF') {
          const maxX = Math.max(x1, x2) + 28;
          return `M ${x1} ${y1} C ${maxX} ${y1}, ${maxX} ${y2}, ${x2} ${y2}`;
        } else {
          return `M ${x1} ${y1} C ${x1 - 28} ${y1}, ${x2 + 28} ${y2}, ${x2} ${y2}`;
        }
      }

      // ── Orthogonal / Stepped (90° Manhattan with rounded fillets) ──
      if (depType === 'FS') {
        if (x2 >= x1 + 16) {
          const midX = Math.round(x1 + (x2 - x1) / 2);
          if (Math.abs(y2 - y1) < 2) {
            return `M ${x1} ${y1} L ${x2} ${y2}`;
          }
          const r = Math.min(6, Math.max(1, Math.abs(midX - x1) - 1), Math.max(1, Math.abs(y2 - y1) / 2 - 1));
          if (y2 > y1) {
            return `M ${x1} ${y1} L ${midX - r} ${y1} Q ${midX} ${y1} ${midX} ${y1 + r} L ${midX} ${y2 - r} Q ${midX} ${y2} ${midX + r} ${y2} L ${x2} ${y2}`;
          } else {
            return `M ${x1} ${y1} L ${midX - r} ${y1} Q ${midX} ${y1} ${midX} ${y1 - r} L ${midX} ${y2 + r} Q ${midX} ${y2} ${midX + r} ${y2} L ${x2} ${y2}`;
          }
        } else {
          const xOut = x1 + 14;
          const yClear = y1 + (y2 >= y1 ? 22 : -22);
          const xEntry = x2 - 14;
          return `M ${x1} ${y1} L ${xOut} ${y1} L ${xOut} ${yClear} L ${xEntry} ${yClear} L ${xEntry} ${y2} L ${x2} ${y2}`;
        }
      } else if (depType === 'SS') {
        const minX = Math.min(x1, x2) - 16;
        return `M ${x1} ${y1} L ${minX} ${y1} L ${minX} ${y2} L ${x2} ${y2}`;
      } else if (depType === 'FF') {
        const maxX = Math.max(x1, x2) + 16;
        return `M ${x1} ${y1} L ${maxX} ${y1} L ${maxX} ${y2} L ${x2} ${y2}`;
      } else {
        const xOut = x1 - 16;
        return `M ${x1} ${y1} L ${xOut} ${y1} L ${xOut} ${y2} L ${x2} ${y2}`;
      }
    }

    setConnectorLineType(type) {
      if (!['orthogonal', 'curved', 'straight'].includes(type)) return;
      this.connectorLineType = type;

      const ctrl = document.getElementById('pc-link-type-controls');
      if (ctrl && ctrl.querySelectorAll) {
        ctrl.querySelectorAll('.pc-link-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.type === type);
        });
      }

      this.refreshDependencySvg();
      if (typeof this.showScrollHud === 'function') {
        this.showScrollHud(`Link Style: ${type.toUpperCase()}`);
      }
    }

    toggleDependencyLinks() {
      this.showDependencyLinks = !this.showDependencyLinks;
      const btn = document.getElementById('pc-link-toggle-btn');
      if (btn) {
        btn.classList.toggle('active', this.showDependencyLinks);
        btn.classList.toggle('is-off', !this.showDependencyLinks);
        btn.innerHTML = `<i class="fas ${this.showDependencyLinks ? 'fa-eye' : 'fa-eye-slash'}"></i>`;
      }
      const svg = document.getElementById('pc-gantt-dependency-svg');
      if (svg) {
        svg.style.display = this.showDependencyLinks ? 'block' : 'none';
      }
      if (typeof this.showScrollHud === 'function') {
        this.showScrollHud(`Dependency Links: ${this.showDependencyLinks ? 'ON' : 'OFF'}`);
      }
    }

    refreshDependencySvg() {
      const p = this.getSelectedProject();
      if (!p) return;
      const data = this.getProjectDetailedData(p);
      const tasks = this.getVisibleTasks(data.tasks);

      const startDates = tasks.map(t => new Date(t.startDateStr).getTime());
      const endDates = tasks.map(t => new Date(t.endDateStr).getTime());
      const minDate = new Date(Math.min(...startDates) - 2 * 86400000);
      const maxDate = new Date(Math.max(...endDates) + 14 * 86400000);

      const totalDays = Math.max(30, Math.ceil((maxDate - minDate) / 86400000));
      const timelineWidth = totalDays * this.dayW;
      const totalHeight = 42 + tasks.length * 44;

      const inner = document.getElementById('pc-gantt-timeline-inner');
      if (!inner) return;

      const oldSvg = document.getElementById('pc-gantt-dependency-svg');
      const newSvgHtml = this._renderDependencySvg(tasks, minDate, timelineWidth, totalHeight);

      if (oldSvg) {
        if (oldSvg.outerHTML !== undefined) {
          oldSvg.outerHTML = newSvgHtml;
        } else {
          inner.innerHTML = inner.innerHTML.replace(oldSvg.toString(), newSvgHtml);
        }
      } else {
        if (inner.insertAdjacentHTML) {
          inner.insertAdjacentHTML('beforeend', newSvgHtml);
        } else {
          inner.innerHTML += newSvgHtml;
        }
      }
    }

    highlightTaskDependencies(taskId) {
      this._activeHoveredTaskId = taskId;
      const inner = document.getElementById('pc-gantt-timeline-inner');
      if (!inner || !this._currentDepLinks || this._currentDepLinks.length === 0) return;

      const relatedLinks = this._currentDepLinks.filter(l => l.predId === taskId || l.succId === taskId);
      if (relatedLinks.length === 0) return;

      inner.classList.add('pc-linking-active');

      const bar = document.getElementById(`pc-bar-${taskId}`);
      if (bar) bar.classList.add('is-focused-task');

      relatedLinks.forEach(link => {
        const pathEl = document.getElementById(`pc-link-${link.id}`);
        if (pathEl) {
          pathEl.classList.add('is-highlighted');
          pathEl.setAttribute('marker-end', 'url(#pc-arrow-highlight)');
        }

        if (link.predId !== taskId) {
          const predBar = document.getElementById(`pc-bar-${link.predId}`);
          if (predBar) predBar.classList.add('is-pred-highlight');
        }

        if (link.succId !== taskId) {
          const succBar = document.getElementById(`pc-bar-${link.succId}`);
          if (succBar) succBar.classList.add('is-succ-highlight');
        }
      });
    }

    clearDependencyHighlight() {
      this._activeHoveredTaskId = null;
      const inner = document.getElementById('pc-gantt-timeline-inner');
      if (inner) inner.classList.remove('pc-linking-active');

      if (document.querySelectorAll) {
        document.querySelectorAll('.pc-gantt-bar, .pc-gantt-milestone').forEach(el => {
          el.classList.remove('is-focused-task', 'is-pred-highlight', 'is-succ-highlight');
        });
      }

      if (this._currentDepLinks) {
        this._currentDepLinks.forEach(link => {
          const pathEl = document.getElementById(`pc-link-${link.id}`);
          if (pathEl) {
            pathEl.classList.remove('is-highlighted');
            pathEl.setAttribute('marker-end', link.isCritical ? 'url(#pc-arrow-critical)' : 'url(#pc-arrow-default)');
          }
        });
      }

      this.onLinkLeave();
    }

    onLinkHover(e, linkId) {
      if (!this._currentDepLinks) return;
      const link = this._currentDepLinks.find(l => l.id === linkId);
      if (!link) return;

      const inner = document.getElementById('pc-gantt-timeline-inner');
      if (inner) inner.classList.add('pc-linking-active');

      const pathEl = document.getElementById(`pc-link-${link.id}`);
      if (pathEl) {
        pathEl.classList.add('is-highlighted');
        pathEl.setAttribute('marker-end', 'url(#pc-arrow-highlight)');
      }

      const predBar = document.getElementById(`pc-bar-${link.predId}`);
      if (predBar) predBar.classList.add('is-pred-highlight');

      const succBar = document.getElementById(`pc-bar-${link.succId}`);
      if (succBar) succBar.classList.add('is-succ-highlight');

      const typeLabels = {
        FS: 'Finish-to-Start (FS)',
        SS: 'Start-to-Start (SS)',
        FF: 'Finish-to-Finish (FF)',
        SF: 'Start-to-Finish (SF)'
      };

      const tooltip = document.getElementById('pc-dep-tooltip');
      if (tooltip) {
        tooltip.innerHTML = `
          <div class="pc-dep-tooltip-head">
            <span class="pc-dep-badge ${link.isCritical ? 'critical' : 'normal'}">${typeLabels[link.type] || link.type}</span>
            <span class="pc-dep-lag-badge">${link.lag === 0 ? 'Lag: 0d' : `Lag: +${link.lag}d`}</span>
            ${link.isCritical ? '<span class="pc-dep-crit-badge"><i class="fas fa-fire"></i> Critical Path (TF=0)</span>' : ''}
          </div>
          <div class="pc-dep-tooltip-chain">
            <div class="pc-chain-row pred">
              <span class="pc-chain-label">Predecessor:</span>
              <span class="pc-chain-name"><strong>${link.predWbs}</strong> ${link.predName}</span>
            </div>
            <div class="pc-chain-arrow"><i class="fas fa-arrow-down"></i></div>
            <div class="pc-chain-row succ">
              <span class="pc-chain-label">Successor:</span>
              <span class="pc-chain-name"><strong>${link.succWbs}</strong> ${link.succName}</span>
            </div>
          </div>
        `;
        tooltip.style.display = 'block';
        this.onLinkMouseMove(e);
      }
    }

    onLinkMouseMove(e) {
      const tooltip = document.getElementById('pc-dep-tooltip');
      if (!tooltip || tooltip.style.display === 'none') return;
      const wrap = document.getElementById('pc-gantt-timeline-wrap');
      if (!wrap) return;

      const rect = wrap.getBoundingClientRect ? wrap.getBoundingClientRect() : { left: 0, top: 0 };
      const clientX = e ? (e.clientX || 0) : 0;
      const clientY = e ? (e.clientY || 0) : 0;
      const x = clientX - rect.left + 16;
      const y = clientY - rect.top + 16;

      const maxLeft = (wrap.clientWidth || 900) - 280;
      tooltip.style.left = `${Math.max(10, Math.min(x, maxLeft))}px`;
      tooltip.style.top = `${Math.max(10, y)}px`;
    }

    onLinkLeave() {
      const tooltip = document.getElementById('pc-dep-tooltip');
      if (tooltip) tooltip.style.display = 'none';

      if (this._activeHoveredTaskId) {
        this.highlightTaskDependencies(this._activeHoveredTaskId);
        return;
      }

      const inner = document.getElementById('pc-gantt-timeline-inner');
      if (inner) inner.classList.remove('pc-linking-active');

      if (document.querySelectorAll) {
        document.querySelectorAll('.pc-gantt-bar, .pc-gantt-milestone').forEach(el => {
          el.classList.remove('is-focused-task', 'is-pred-highlight', 'is-succ-highlight');
        });
      }

      if (this._currentDepLinks) {
        this._currentDepLinks.forEach(link => {
          const pathEl = document.getElementById(`pc-link-${link.id}`);
          if (pathEl) {
            pathEl.classList.remove('is-highlighted');
            pathEl.setAttribute('marker-end', link.isCritical ? 'url(#pc-arrow-critical)' : 'url(#pc-arrow-default)');
          }
        });
      }
    }

    // ═════════════════════════════════════════════════════════════════════
    // GANTT SCROLL SETTINGS & THREE-MODAL WHEEL CONTROLLER
    // 1. Ctrl + Scroll: Expand timeline, keep one end (left edge) stable
    // 2. Alt + Scroll: Expand timeline, keep center of viewport stable
    // 3. Ctrl + Shift + Scroll: Geometric zoom in/out, center stable
    // ═════════════════════════════════════════════════════════════════════

    initGanttScrollGestures() {
      const wrap = document.getElementById('pc-gantt-timeline-wrap');
      const wbsList = document.getElementById('pc-wbs-list');
      const wbsRows = document.getElementById('pc-wbs-rows-container');
      if (!wrap || wrap._scrollGesturesInit) return;
      wrap._scrollGesturesInit = true;

      // ── Synchronize Vertical Scroll between Timeline & WBS Table ──
      wrap.addEventListener('scroll', () => {
        if (wbsRows && Math.abs(wbsRows.scrollTop - wrap.scrollTop) > 1) {
          wbsRows.scrollTop = wrap.scrollTop;
        }
      }, { passive: true });

      if (wbsRows) {
        wbsRows.addEventListener('scroll', () => {
          if (Math.abs(wrap.scrollTop - wbsRows.scrollTop) > 1) {
            wrap.scrollTop = wbsRows.scrollTop;
          }
        }, { passive: true });

        // Also allow vertical wheel on WBS pane to smoothly scroll timeline
        wbsRows.addEventListener('wheel', (e) => {
          if (e.ctrlKey || e.altKey) return;
          wrap.scrollTop += e.deltaY;
        }, { passive: true });
      }

      // ── Wheel Event Listener for the 3 Scroll Modes ──
      const handleWheel = (e) => {
        const isCtrl = e.ctrlKey || e.metaKey;
        const isAlt = e.altKey;
        const isShift = e.shiftKey;

        // If neither Ctrl nor Alt is pressed, allow normal native scroll
        if (!isCtrl && !isAlt) return;

        // Prevent native browser page zoom or default scroll
        e.preventDefault();
        e.stopPropagation();

        const zoomIn = e.deltaY < 0;
        const viewportW = wrap.clientWidth || 800;
        const viewportH = wrap.clientHeight || 500;

        // ─────────────────────────────────────────────────────────────────
        // SETTING 3: Ctrl + Shift + Scroll
        // Geometric Zoom In/Out (All text, geometries, and bars scale, center stable)
        // ─────────────────────────────────────────────────────────────────
        if (isCtrl && isShift) {
          const oldScale = this.geometricScale || 1.0;
          const scaleFactor = zoomIn ? 1.08 : 0.925;
          let newScale = parseFloat((oldScale * scaleFactor).toFixed(3));
          newScale = Math.max(0.5, Math.min(2.5, newScale));

          if (Math.abs(newScale - oldScale) < 0.001) return;

          // Capture viewport center coordinates before scale change
          const oldCenterX = wrap.scrollLeft + (viewportW / 2);
          const oldCenterY = wrap.scrollTop + (viewportH / 2);

          this.geometricScale = newScale;
          this.applyGeometricZoom(newScale);

          // Center stability in both X and Y:
          const ratio = newScale / oldScale;
          const newCenterX = oldCenterX * ratio;
          const newCenterY = oldCenterY * ratio;

          wrap.scrollLeft = Math.max(0, Math.round(newCenterX - (viewportW / 2)));
          wrap.scrollTop = Math.max(0, Math.round(newCenterY - (viewportH / 2)));
          if (wbsRows) wbsRows.scrollTop = wrap.scrollTop;

          this.showScrollHud({
            mode: 'geometric',
            title: 'Geometric Zoom (Center Stable)',
            value: `${Math.round(newScale * 100)}%`,
            sub: 'All text, geometries & bars scaled proportionally',
            shortcut: 'Ctrl + Shift + Scroll',
            color: '#a855f7'
          });
          return;
        }

        // ─────────────────────────────────────────────────────────────────
        // SETTING 1: Control + Scroll
        // Expand the timeline horizontally, keep one end (left edge) stable
        // ─────────────────────────────────────────────────────────────────
        if (isCtrl && !isAlt && !isShift) {
          const oldDayW = this.dayW || 32;
          const expandFactor = zoomIn ? 1.14 : 0.88;
          let newDayW = Math.max(10, Math.min(240, Math.round(oldDayW * expandFactor)));
          if (newDayW === oldDayW) {
            newDayW += (zoomIn ? 1 : -1);
            newDayW = Math.max(10, Math.min(240, newDayW));
          }
          if (newDayW === oldDayW) return;

          // Stable Left End:
          // The visible left edge of the viewport (scrollLeft) remains pinned to the same date
          const oldScrollLeft = wrap.scrollLeft;

          this.dayW = newDayW;
          this._updateGranularityState(newDayW);
          this.renderGanttTimeline();

          // Left end stability formula:
          const newScrollLeft = Math.max(0, Math.round(oldScrollLeft * (newDayW / oldDayW)));
          wrap.scrollLeft = newScrollLeft;

          this.showScrollHud({
            mode: 'left-anchor',
            title: 'Timeline Expansion (Left End Stable)',
            value: `${newDayW}px / day`,
            sub: 'Left boundary anchored • Horizontal timeline expanded',
            shortcut: 'Ctrl + Scroll',
            color: '#38bdf8'
          });
          return;
        }

        // ─────────────────────────────────────────────────────────────────
        // SETTING 2: Alt + Scroll
        // Expand the timeline horizontally, keep the center stable
        // ─────────────────────────────────────────────────────────────────
        if (isAlt && !isCtrl && !isShift) {
          const oldDayW = this.dayW || 32;
          const expandFactor = zoomIn ? 1.14 : 0.88;
          let newDayW = Math.max(10, Math.min(240, Math.round(oldDayW * expandFactor)));
          if (newDayW === oldDayW) {
            newDayW += (zoomIn ? 1 : -1);
            newDayW = Math.max(10, Math.min(240, newDayW));
          }
          if (newDayW === oldDayW) return;

          // Stable Center:
          // The exact date/task in the middle of the viewport stays in the center
          const oldScrollLeft = wrap.scrollLeft;
          const oldCenter = oldScrollLeft + (viewportW / 2);

          this.dayW = newDayW;
          this._updateGranularityState(newDayW);
          this.renderGanttTimeline();

          // Center stability formula:
          const newCenter = oldCenter * (newDayW / oldDayW);
          const newScrollLeft = Math.max(0, Math.round(newCenter - (viewportW / 2)));
          wrap.scrollLeft = newScrollLeft;

          this.showScrollHud({
            mode: 'center-anchor',
            title: 'Timeline Expansion (Center Stable)',
            value: `${newDayW}px / day`,
            sub: 'Center focus anchored • Timeline expanded symmetrically',
            shortcut: 'Alt + Scroll',
            color: '#10b981'
          });
          return;
        }
      };

      wrap.addEventListener('wheel', handleWheel, { passive: false });
      if (wbsList) wbsList.addEventListener('wheel', handleWheel, { passive: false });

      // Double-click on timeline canvas background to reset zoom/scale
      wrap.addEventListener('dblclick', (e) => {
        if (e.target.closest('.pc-gantt-bar') || e.target.closest('button')) return;
        this.resetTimelineZoom();
      });
    }

    // ── Apply Geometric Zoom (Scaling text, geometries & rows) ──
    applyGeometricZoom(scale) {
      const inner = document.getElementById('pc-gantt-timeline-inner');
      const sizer = document.getElementById('pc-gantt-stage-sizer');
      const ganttMain = document.getElementById('pc-gantt-main');
      const wbsList = document.getElementById('pc-wbs-list');
      if (!inner) return;

      inner.style.transform = (scale !== 1.0) ? `scale(${scale})` : '';
      inner.style.transformOrigin = '0 0';

      if (sizer) {
        const baseW = parseInt(inner.style.width, 10) || inner.offsetWidth || 1200;
        const p = this.getSelectedProject();
        const taskCount = (p && this.getProjectDetailedData(p)?.tasks?.length) || 12;
        const baseH = 42 + taskCount * 44 + 40;
        sizer.style.width = `${Math.round(baseW * scale)}px`;
        sizer.style.height = `${Math.round(baseH * scale)}px`;
      }

      if (ganttMain && ganttMain.style) {
        if (ganttMain.style.setProperty) {
          ganttMain.style.setProperty('--pc-canvas-scale', scale);
          ganttMain.style.setProperty('--pc-row-h', `${Math.round(44 * scale)}px`);
        } else {
          ganttMain.style['--pc-canvas-scale'] = scale;
          ganttMain.style['--pc-row-h'] = `${Math.round(44 * scale)}px`;
        }
      }

      if (wbsList && wbsList.style) {
        if (wbsList.style.setProperty) {
          wbsList.style.setProperty('--pc-row-h', `${Math.round(44 * scale)}px`);
        } else {
          wbsList.style['--pc-row-h'] = `${Math.round(44 * scale)}px`;
        }
        wbsList.style.fontSize = `${(0.78 * Math.max(0.85, Math.min(1.25, scale))).toFixed(2)}rem`;
      }

      const resetBtn = document.getElementById('pc-zoom-reset-btn');
      if (resetBtn) {
        resetBtn.innerHTML = `<i class="fas fa-arrows-rotate"></i> Reset (${Math.round(scale * 100)}%)`;
        resetBtn.classList.toggle('is-modified', scale !== 1.0 || this.dayW !== 32);
      }
    }

    // ── Reset Zoom & Expansion to 100% ──
    resetTimelineZoom() {
      this.geometricScale = 1.0;
      this.dayW = (this.zoom === 'Days') ? 56 : (this.zoom === 'Weeks' ? 32 : 16);
      this.applyGeometricZoom(1.0);
      this._updateGranularityState(this.dayW);
      this.renderGanttTimeline();

      this.showScrollHud({
        mode: 'reset',
        title: 'Timeline Reset to 100%',
        value: `Scale: 100% • ${this.dayW}px/day`,
        sub: 'Standard layout scale & default view restored',
        shortcut: 'Reset / Double-Click',
        color: '#38bdf8'
      });
    }

    // ── Update Granularity UI State according to day width ──
    _updateGranularityState(dayW) {
      let mode = 'Weeks';
      if (dayW >= 48) mode = 'Days';
      else if (dayW < 20) mode = 'Months';
      this.zoom = mode;
      document.querySelectorAll('.pc-zoom-btn').forEach(b => {
        if (b.dataset.zoom) {
          b.classList.toggle('active', b.dataset.zoom === mode);
        }
      });
    }

    // ── Floating Interactive Scroll HUD Display ──
    showScrollHud({ mode, title, value, sub, shortcut, color }) {
      let hud = document.getElementById('pc-scroll-hud');
      if (!hud) {
        const wrap = document.getElementById('pc-gantt-timeline-wrap');
        if (!wrap) return;
        hud = document.createElement('div');
        hud.id = 'pc-scroll-hud';
        hud.className = 'pc-scroll-hud';
        wrap.appendChild(hud);
      }

      let iconClass = 'fa-arrow-right-from-bracket';
      if (mode === 'geometric') iconClass = 'fa-magnifying-glass-plus';
      else if (mode === 'center-anchor') iconClass = 'fa-arrows-left-right';
      else if (mode === 'reset') iconClass = 'fa-arrows-rotate';

      hud.innerHTML = `
        <div class="pc-hud-badge" style="background:${color}22; color:${color}; border-color:${color}66;">
          <i class="fas ${iconClass}"></i>
          <span>${shortcut}</span>
        </div>
        <div class="pc-hud-content">
          <div class="pc-hud-title">${title}</div>
          <div class="pc-hud-val" style="color:${color};">${value}</div>
          <div class="pc-hud-sub">${sub}</div>
        </div>
      `;

      hud.classList.add('is-visible');
      if (this._scrollHudTimeout) clearTimeout(this._scrollHudTimeout);
      this._scrollHudTimeout = setTimeout(() => {
        hud.classList.remove('is-visible');
      }, 1400);
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

  window.ProgressCenter = ProgressCenterModule;
  window.progressCenter = new ProgressCenterModule();
})();
