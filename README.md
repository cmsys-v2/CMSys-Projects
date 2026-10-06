# SLN Project Platform — Sri Lanka Navy Civil Engineering Department

The **SLN Project Platform** is a unified, full-stack enterprise platform developed for the **Sri Lanka Navy (SLN) Civil Engineering Department (CED)**. It integrates:
1. **Naval Projects & Procurement Command Center (Dedicated Window)**: Capital dockyard and base engineering works financed under Government Votes (Votes 2104, 2001, 2506, 1303, Non-Naval Funds, 2103) with a comprehensive Procurement PR Register and multi-stage pipeline tracking.
2. **Special Projects Suite (CSR & Welfare)**: Civil engineering community, religious, clean Sri Lanka, and naval welfare housing projects.
3. **Quantity Surveying (QS) & BOQ Studio**: Full BOQ line-item management, Earned Value Management (EVM), and CPI/SPI metrics.
4. **Full Resource Gantt Chart Studio**: Work Breakdown Structure (WBS), Critical Path Method (CPM), and daily sailor trade histograms.
5. **Sailor Attachments & Equal Opportunity Engine**: Integrated with `ce-admin-panel2025` Firebase Realtime Database for trade allocation and fair rotation.
6. **Dedicated Cloud RTDB (`cmsys-projects`)**: Realtime bidirectional synchronization for Naval Projects, Procurement Files, and Special Projects on `asia-southeast1`.
7. **CMSys Logistics & V2 Bridge**: Cloud synchronization and JSON absorption packages for seamless data interoperability.

---

## 🏗️ System Architecture & Dual-Firebase Topology

```
                              ┌───────────────────────────────────────────────┐
                              │          ce-admin-panel2025 (DB #1)           │
                              │           Firebase Realtime Database          │
                              │           (Personnel & Sailors Pool)          │
                              └──────────────────────┬────────────────────────┘
                                                     │ (Read-Only Live Sync)
                                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SLN PROJECT PLATFORM                                      │
│ ┌──────────────────────────┐      ┌──────────────────────────┐      ┌─────────────────────┐ │
│ │  NAVAL PROJECTS WINDOW   │      │  SPECIAL PROJECTS SUITE  │      │    LABOUR CENTER    │ │
│ │  • Vote 2104 (Major)     │      │  • Religious             │      │  • 661 Sailors      │ │
│ │  • Vote 2001 (Renovation)│      │  • Clean Sri Lanka       │      │  • Equal Rotation   │ │
│ │  • Vote 2506 (Maritime)  │      │  • Housing               │      │  • Trade Loading    │ │
│ │  • Vote 1303 (Maint)     │      │  • Miscellaneous         │      │                     │ │
│ │  • Non-Naval / Funds     │      │                          │      │                     │ │
│ │  • Vote 2103 (Machinery) │      │                          │      │                     │ │
│ │  • Master PR Register    │      │                          │      │                     │ │
│ └──────────────────────────┘      └──────────────────────────┘      └─────────────────────┘ │
│                                                ▲                                            │
│                                                │ (REST / Local JSON / SQLite / MySQL)        │
│                                                ▼                                            │
│                               ┌─────────────────────────────────┐                           │
│                               │  Data Engine & Store (State v5) │                           │
│                               └────────────────┬────────────────┘                           │
└────────────────────────────────────────────────┼────────────────────────────────────────────┘
                         ▲                       │ (Bi-directional Live RTDB Sync)
                         │                       ▼
                         │      ┌─────────────────────────────────────────┐
                         │      │          cmsys-projects (DB #2)         │
                         └──────┤        Firebase Realtime Database       │
                                │   (Naval, Procurement, Special Projects)│
                                └────────────────┬────────────────────────┘
                                                 │ (Cross-system Absorption Package)
                                                 ▼
                                ┌─────────────────────────────────────────┐
                                │             CMSys Logistics             │
                                │        (PR Procurement Mirror)          │
                                └─────────────────────────────────────────┘
```

> 📖 **Comprehensive Topology Reference**: See [`FIREBASE_TOPOLOGY.md`](FIREBASE_TOPOLOGY.md) for full endpoint specifications, account boundaries, and interconnections across all 6 Firebase accounts in the ecosystem (`cmsys-projects`, `ce-admin-panel2025`, `cmsys-v2-1fb05`, `ncw-ps-operations`, `ce-web-system`, `cced-water-distribution`).

---

## 🚀 Dedicated Naval Projects Window Features

### 1. Capital Works & Government Votes Directory
- **Vote 223-1-01-2104**: Construction of No.03 Slipway Hangar (NSH), 50m x 20m Steel Workshop Building (EFS), Front of Beach Security Point (SGP), Logistic & Management School (LMS).
- **Vote 223-1-01-2001**: Major renovations for Kashyapa security fence, Vidura Marine Home, Command Wardrooms, Store Yards, Married Quarters (Peyton Terrace 01-10), SBS HQ Training facilities, NAD Waterproofing tunnels, Thissa Naval Hospital.
- **Vote 223-1-01-2506**: Maritime and coastal infrastructure including Guide Pier Extension, Floating Dock, Gas Chlorination Plants, and Dockyard security fencing.
- **Vote 223-1-01-1303**: Base and station annual maintenance works.
- **Non-Naval / Funds**: Malima Hospitality works (Sobar Island Resort) and contractual projects (Paper Port Jetty).
- **Vote 223-1-01-2103**: Heavy machinery and capital plant acquisition (CNC Plasma Cutters, Mobile Aerial Platforms).

### 2. Master Procurement PR Register & Pipeline
- Real-time tracking of Purchase Requisitions (PRs) from inception to stores receipt:
  - `Processing File`: Initial requisition and specification vetting.
  - `Awaiting Financial Approval`: Tender board and financial authority concurrence.
  - `Order Placed`: Purchase order issued to selected supplier.
  - `Items Dispatched`: Supplier dispatch in transit.
  - `Items Received`: Verified and taken on-charge at Base / Dockyard stores.
- Interactive status updates, modal inspection, and 1-click CSV export of the entire PR register.

### 3. Vote Budget Allocation Matrix
- High-level executive burn-down monitoring comparing **Vote Allocation** vs **Committed Funds** vs **Actual Expenditure** with remaining uncommitted balance.

---

## ☁️ Firebase Backend & CLI Configuration

- **Target Project**: `cmsys-projects`
- **RTDB Endpoint**: `https://cmsys-projects-default-rtdb.asia-southeast1.firebasedatabase.app`
- **Database Rules**: [`database.rules.json`](database.rules.json) (optimized indexes on `voteNumber`, `status`, `prNumber`, etc.)
- **Project Configuration**: [`firebase.json`](firebase.json) & [`.firebaserc`](.firebaserc)
- **Zero-Dependency Seeder**: Run `node scripts/seed-firebase.js` to populate/verify all nodes.

---

## 📂 File Directory Structure

```
c:\xampp\htdocs\SP V1\
├── index.html               # Main Web App UI (Executive Dashboard, Naval Projects, Special Projects, Labour)
├── firebase.json            # Firebase CLI Deployment Configuration
├── .firebaserc              # Firebase Active Project Config (cmsys-projects)
├── database.rules.json      # Realtime Database Security & Indexing Rules
├── FIREBASE_TOPOLOGY.md     # Cross-System Multi-Firebase Account Directory
├── css/
│   ├── style.css            # Master Design System, Naval Theme Variables, Badges, Table Cards
│   ├── gantt.css            # Resource Gantt Chart & Timeline Styling
│   └── boq.css              # Quantity Surveying & BOQ Table Styling
├── js/
│   ├── naval-projects.js    # Dedicated Naval Projects & Procurement Command Center Module
│   ├── store.js             # Central Reactive State Store (State v5: Naval & Special Projects)
│   ├── app.js               # Master Application Controller, Router & Modal Handlers
│   ├── project-detail.js    # Special Project Detail Modal Handler
│   ├── labour-centre.js     # Labour Centre & Equal Opportunity Rotation Helper
│   ├── gantt-engine.js      # Advanced Resource Gantt Chart & CPM Solver Engine
│   ├── qs-boq-engine.js     # Quantity Surveying & EVM Calculation Engine
│   ├── firebase-sync.js     # Firebase Realtime DB (ce-admin-panel2025) Connector
│   ├── cloud-sync.js        # Firebase Cloud Operations Sync (cmsys-projects)
│   └── cmsys-bridge.js      # CMSys Absorption & Sync Bridge
├── api/
│   ├── config.php           # Database & CORS Configuration
│   ├── api.php              # REST API for Naval Projects, Special Projects & Procurement
│   └── database.sql         # SQL Database Schema (naval_projects, procurement_files, special_projects)
├── data/
│   ├── naval_projects.json  # Master Naval Projects & Procurement PR Dataset (25 Projects, 63 PRs)
│   └── sample_projects.json # Pre-loaded Combined Project Dataset
├── scripts/
│   └── seed-firebase.js     # Standalone Firebase Backend Seeder & Verification Tool
└── README.md                # System Documentation
```
