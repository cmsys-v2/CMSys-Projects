# Sri Lanka Navy Civil Engineering Department (SPS / CMSys)
## Comprehensive Multi-Firebase Account & Database Topology

This document details the cross-system architecture, connection endpoints, and security boundaries across all interconnected Firebase accounts and database clusters within the Naval Civil Works ecosystem.

---

## 1. Firebase Ecosystem Master Directory

```mermaid
graph TB
  subgraph Cluster_1["Primary Project Platform: cmsys-projects (asia-southeast1)"]
    CP_RTDB[("cmsys-projects RTDB<br/>• /naval_projects (25)<br/>• /procurement_files (63)<br/>• /special_projects (7)<br/>• /special_project_attachments<br/>• /cmsys_absorption<br/>• /system_status")]
  end

  subgraph Cluster_2["Personnel Master: ce-admin-panel2025 (us-central1)"]
    CE_RTDB[("ce-admin-panel2025 RTDB<br/>• /sailors (661+ records)<br/>• Trade skills & ratings<br/>• Service numbers")]
  end

  subgraph Cluster_3["Logistics Hub: cmsys-v2-1fb05 (asia-southeast1)"]
    V2_RTDB[("cmsys-v2-1fb05 RTDB<br/>• /inventory<br/>• /materials<br/>• /machinery<br/>• /requisitions")]
  end

  subgraph Cluster_4["Ops & Productivity: ncw-ps-operations (asia-southeast1)"]
    OPS_RTDB[("ncw-ps-operations RTDB<br/>• /job_cards<br/>• /work_orders<br/>• /site_supervision")]
  end

  subgraph Cluster_5["Waterworks Infra: cced-water-distribution"]
    WW_DB[("cced-water-distribution Firestore<br/>• /pipelines<br/>• /meters<br/>• /distribution_nodes")]
  end

  subgraph Cluster_6["Legacy Fallback: ce-web-system (asia-southeast1)"]
    LEG_RTDB[("ce-web-system RTDB<br/>• Historical civil works archive")]
  end

  CP_RTDB <== "Bi-directional Live Sync" ==> SPS["SLN Projects Platform (SP V1)"]
  CE_RTDB ==> "Read-Only Personnel Feed" ==> SPS
  SPS ==> "Cross-system Absorption Package" ==> V2_RTDB
  OPS_RTDB -. "Work Order Archives" .-> SPS
```

---

## 2. Detailed Configuration & Connection Matrix

| Account / Project ID | Primary Database URL | Region | Auth Domain & App ID | Core Purpose & Data Scope | Access Mode in SPS |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`cmsys-projects`** *(Current Target)* | `https://cmsys-projects-default-rtdb.asia-southeast1.firebasedatabase.app` | `asia-southeast1` (Singapore) | `cmsys-projects.firebaseapp.com`<br/>App: `1:366430411452:web:206cb47ecd2af8ffa98eb9`<br/>Sender: `366430411452` | **Dedicated Project & Procurement Platform**<br/>• 25 Naval Capital & Base Engineering Projects under 6 Vote Heads<br/>• 63 Procurement PR Requisition files with stages<br/>• 7 CSR / Special Projects (EVM, BOQ, Gantt)<br/>• Labour Attachments & Absorption payloads | **Read / Write (Primary)** |
| **`ce-admin-panel2025`** | `https://ce-admin-panel2025-default-rtdb.firebaseio.com` | `us-central1` (Default) | `ce-admin-panel2025.firebaseapp.com`<br/>App: `1:1093761746400:web:1984fad8019641b2ca5785` | **Personnel & Sailor Registry**<br/>• Master database of 661 active sailors, ranks (AB, LS, PO), trades (MA, CA, PA, PL, WE, etc.), service numbers, and trade qualification ratings | **Read-Only (Federated Sync)** |
| **`cmsys-v2-1fb05`** | `https://cmsys-v2-1fb05-default-rtdb.asia-southeast1.firebasedatabase.app` | `asia-southeast1` (Singapore) | `cmsys-v2-1fb05.firebaseapp.com`<br/>Bucket: `cmsys-v2-1fb05.appspot.com`<br/>API Key: `AIzaSyDpxQzPBylQe...` | **Main CMSys V2 Logistics Platform**<br/>• Central inventory, warehouse stores, vehicle/plant machinery allocations, material issue vouchers (NAV 254), and purchase requests | **Target for Absorption Exports** |
| **`ncw-ps-operations`** | `https://ncw-ps-operations-default-rtdb.asia-southeast1.firebasedatabase.app` | `asia-southeast1` (Singapore) | `ncw-ps-operations.firebaseapp.com`<br/>App: `1:992132561625:web:5b4f0c753c568cea66dcc8` | **Naval Civil Works Operations & Site Execution**<br/>• Field job cards, daily maintenance work orders, site supervision reports, and zone productivity metrics | **Historical & Operational Peer** |
| **`ce-web-system`** | `https://ce-web-system-default-rtdb.asia-southeast1.firebasedatabase.app` | `asia-southeast1` (Singapore) | `ce-web-system.firebaseapp.com` | **Legacy Civil Works Web System**<br/>• Historical civil engineering maintenance records and legacy project archives | **Archival Fallback** |
| **`cced-water-distribution`** | Firestore Cloud Database | Multi-region | `cced-water-distribution.firebaseapp.com` | **Civil Engineering Water Distribution Subsystem**<br/>• Dedicated naval base waterworks, pressure meters, pipeline grids, and distribution logistics | **Subsystem Peer** |

---

## 3. Realtime Database Schema (`cmsys-projects`)

The `cmsys-projects` RTDB serves as the centralized, high-speed backbone for the SLN Project Platform.

```json
{
  "naval_projects": [
    {
      "id": "NP-001",
      "code": "NSH",
      "name": "CONSTRUCTION OF NO.03 SLIPWAY HANGAR AT NAVAL DOCKYARD",
      "voteNumber": "VOTE 223-1-01-2104",
      "voteAllocation": 85000000,
      "committed": 42000000,
      "actualSpent": 18500000,
      "projectType": "New Construction",
      "financialMean": "Vote",
      "status": "Active",
      "startDate": "2025-01-15",
      "endDate": "2025-12-20",
      "files": [ /* Array of PR File objects */ ]
    }
  ],
  "procurement_files": [
    {
      "id": "NP-001-PF-001",
      "projectId": "NP-001",
      "projectCode": "NSH",
      "projectName": "CONSTRUCTION OF NO.03 SLIPWAY HANGAR AT NAVAL DOCKYARD",
      "voteNumber": "VOTE 223-1-01-2104",
      "prNumber": "ENA/CEWS/NSH/2026/0101",
      "itemCode": "ENA/APOE/RCFO/ENG/2026/1890",
      "itemName": "STRUCTURAL STEEL UNIVERSAL BEAMS 305X165X40KG/M (12M LENGTH)",
      "unit": "No's",
      "qty": 24,
      "unitPrice": 420000,
      "fileCost": 10080000,
      "presentPosition": "Order Placed",
      "supplier": "COLOMBO STEEL WORKS LTD",
      "date": "2025-03-12"
    }
  ],
  "special_projects": [
    {
      "id": "SP-001",
      "code": "WH-01",
      "title": "Naval Dockyard Main Warehouse Complex",
      "category": "CSR",
      "status": "In Progress",
      "progress": 68,
      "budget": 45000000,
      "spent": 30600000
    }
  ],
  "special_project_attachments": [
    {
      "id": "LA-001",
      "project_id": "SP-001",
      "official_number": "MA/1234",
      "name": "AB Kamal Perera",
      "trade": "MA",
      "from_date": "2026-01-10",
      "to_date": "2026-06-30",
      "status": "Active"
    }
  ],
  "cmsys_absorption": {
    "project_meta": { "code": "NSH", "source": "SPS-V1" },
    "work_orders": [ /* absorbed job cards */ ],
    "allocations": [ /* absorbed sailor hours */ ],
    "materials":   [ /* absorbed inventory bills */ ]
  },
  "system_status": {
    "system": "Sri Lanka Navy Civil Engineering — SLN Projects Platform",
    "version": "5.0.0",
    "status": "online",
    "total_naval_projects": 25,
    "total_procurement_files": 63,
    "total_special_projects": 7,
    "last_active": "2026-10-06T18:18:00.000Z"
  }
}
```

---

## 4. Multi-Database Synchronization Flows

### Flow A: Dual-Database Frontend Operation
1. **Bootstrap**: Client loads Firebase SDKs in `index.html`.
2. **Read-Only Personnel Sync (`ce-admin-panel2025`)**:
   - `js/firebase-sync.js` initializes app instance `sps_sailors`.
   - Attaches `.on('value')` listener to `/sailors` on `ce-admin-panel2025-default-rtdb.firebaseio.com`.
   - Normalizes sailor trades (MA, CA, PA, PL, WE, BB, etc.) and injects into `window.spsStore.setSailors()`.
3. **Dedicated Operational Sync (`cmsys-projects`)**:
   - `js/cloud-sync.js` initializes app instance `sps_cloud`.
   - Listens to `/naval_projects`, `/procurement_files`, `/special_projects`, and `/special_project_attachments`.
   - Whenever any user creates or updates a project or procurement requisition stage, store emits event and pushes directly to `cmsys-projects-default-rtdb.asia-southeast1.firebasedatabase.app`.

### Flow B: PHP Backend Proxy & CLI Synchronization
1. `api/config.php` defines REST helper `firebase_rtdb_request($method, $path, $data, $baseUrl)`.
2. `api/api.php` provides REST endpoints:
   - `?action=get_naval_projects` (queries `cmsys-projects`)
   - `?action=save_naval_projects` (writes to `cmsys-projects`)
   - `?action=get_procurement_files` (queries `cmsys-projects`)
   - `?action=save_procurement_file` (writes to `cmsys-projects`)
   - `?action=get_sailors` (queries `ce-admin-panel2025`)
3. `scripts/seed-firebase.js` provides zero-dependency Node.js seeder for CI/CD or local initialization.

---

## 5. Security & Indexing Rules (`database.rules.json`)

The following indexing rules are applied to `cmsys-projects` for optimal query execution:

```json
{
  "rules": {
    ".read": true,
    ".write": true,
    "naval_projects": {
      ".indexOn": ["id", "code", "voteNumber", "status", "priority", "projectType", "startDate", "endDate"]
    },
    "procurement_files": {
      ".indexOn": ["id", "projectId", "projectCode", "voteNumber", "prNumber", "presentPosition", "supplier", "date"]
    },
    "special_projects": {
      ".indexOn": ["id", "code", "category", "status", "start_date", "end_date"]
    },
    "special_project_attachments": {
      ".indexOn": ["project_id", "official_number", "trade", "status", "from_date", "to_date"]
    },
    "cmsys_absorption": {
      ".indexOn": ["status", "timestamp"]
    }
  }
}
```

---

## 6. Verification Status

- [x] **`cmsys-projects` RTDB Connection**: Confirmed `200 OK` via REST API.
- [x] **25 Naval Projects Seeded**: Verified at `/naval_projects`.
- [x] **63 Procurement PR Files Seeded**: Verified at `/procurement_files`.
- [x] **7 Special Projects Seeded**: Verified at `/special_projects`.
- [x] **`ce-admin-panel2025` Sailor Feed**: Verified active via `api/api.php?action=get_sailors`.
- [x] **Bidirectional Cloud Sync**: Verified via `js/cloud-sync.js`.
