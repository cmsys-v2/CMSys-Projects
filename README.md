# Special Project System (SPS) — Quantity Surveying, Resource Gantt & Sailor Attachments Suite

The **Special Project System (SPS)** is an independent, full-stack module designed for managing specialized Naval Civil Works projects, performing Quantity Surveying & BOQ estimation, generating interactive Full Resource Gantt charts with Critical Path Method (CPM) calculation, and managing Sailor Attachments synced with the **Sailor Details API** (`ce-admin-panel2025`).

---

## 🏗️ System Architecture Overview

```
                                  ┌───────────────────────────────┐
                                  │   ce-admin-panel2025 (DB #1)  │
                                  │  Firebase Realtime Database   │
                                  │   (Sailor Details API)        │
                                  └──────────────┬────────────────┘
                                                 │ (Read-Only Live Sync)
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SPECIAL PROJECT SYSTEM (SPS) MODULE                          │
│ ┌──────────────────────┐  ┌──────────────────────────┐  ┌─────────────────────┐ │
│ │  Quantity Surveying  │  │   Full Resource Gantt    │  │ Sailor Attachments  │ │
│ │  (BOQ, Rate Analysis,│  │   (WBS, CPM, Timeline,   │  │ (Role Allocation,   │ │
│ │   Earned Value EVM)  │  │   Resource Histograms)   │  │  Trade Loading)     │ │
│ └──────────────────────┘  └──────────────────────────┘  └─────────────────────┘ │
│                                       ▲                                         │
│                                       │ (REST / Local JSON DB)                  │
│                                       ▼                                         │
│                      ┌─────────────────────────────────┐                        │
│                      │  SPS Data Engine & Persistence  │                        │
│                      └────────────────┬────────────────┘                        │
└───────────────────────────────────────┼─────────────────────────────────────────┘
                                        │ (Sync & Absorption API / Bridge)
                                        ▼
                       ┌─────────────────────────────────┐
                       │          CMSys v2 Main          │
                       │   (Absorbs Attachment Logs)     │
                       └─────────────────────────────────┘
```

---

## 🚀 Key Features & Modules

### 1. Quantity Surveying (QS) & BOQ Studio
- **Bill of Quantities (BOQ)** line item management with unit rates, quantities, and work item categorization (Civil, Structural, Electrical, Plumbing, Fabrication, Carpentry).
- **Earned Value Management (EVM)** metrics calculation:
  - **Planned Value (PV)** = Total Budget × Planned % Complete
  - **Earned Value (EV)** = Total Budget × Actual % Complete
  - **Actual Cost (AC)** = Incurred expenditure
  - **Cost Performance Index (CPI)** = $\text{EV} / \text{AC}$ (Values $\ge 1.0$ indicate project is under budget)
  - **Schedule Performance Index (SPI)** = $\text{EV} / \text{PV}$ (Values $\ge 1.0$ indicate project is ahead of schedule)
  - **Estimate at Completion (EAC)** = $\text{BAC} / \text{CPI}$

### 2. Full Resource Gantt Chart Studio
- **Work Breakdown Structure (WBS)** hierarchy (Project $\rightarrow$ Phase $\rightarrow$ Task $\rightarrow$ Subtask $\rightarrow$ Milestone).
- **Critical Path Method (CPM)** solver computing Early Start (ES), Early Finish (EF), Late Start (LS), Late Finish (LF), and Total Float/Slack.
- **Resource Allocation Matrix & Trade Histograms**: Visualizes daily sailor man-days per trade (MA, CA, PA, PL, BB, RW, WE, AL, SW) and flags over-allocations.
- **Interactive SVG Timeline**: Visualizes dependency links (Finish-to-Start FS, Start-to-Start SS) and milestone highlights.

### 3. Sailor Details API & Firebase Sync Engine
- **Read-only live integration** with `ce-admin-panel2025` Firebase Realtime Database.
- Syncs master personnel records (Official Number, Name, Rank, Trade, Category, Special Skills, Performance Scores).
- Realtime status fallback mode ensures seamless offline operation when network is unavailable.

### 4. CMSys Attachment Sync & Absorption Bridge
- **CMSys Attachment Absorption Interface**: Allows **CMSys** to absorb Special Project sailor attachment logs.
- REST Sync API Endpoint (`GET/POST /api/api.php?action=cmsys_absorb`) and downloadable 1-click JSON absorption package.

---

## 📂 File Directory Structure

```
c:\Projects\CMSys v2\SpecialProjectSystem\
├── index.html               # Main Web App UI (Dashboard, Gantt, BOQ, Attachments, Sync)
├── css/
│   ├── style.css            # Master Design System, Glassmorphism, Theme Variables
│   ├── gantt.css            # Resource Gantt Chart & Timeline Styling
│   └── boq.css              # Quantity Surveying & BOQ Table Styling
├── js/
│   ├── firebase-sync.js     # Firebase Realtime DB (ce-admin-panel2025) Connector
│   ├── store.js             # Central Reactive State Store & LocalStorage Cache
│   ├── gantt-engine.js      # Advanced Resource Gantt Chart & CPM Solver Engine
│   ├── qs-boq-engine.js     # Quantity Surveying & EVM Calculation Engine
│   ├── cmsys-bridge.js      # CMSys Absorption & Attachment Sync Engine
│   └── app.js               # Main Controller, Router & Modal Handlers
├── api/
│   ├── config.php           # Database & CORS Config
│   ├── api.php              # REST API for Special Projects & CMSys Absorption
│   └── database.sql         # SQL Database Schema
├── data/
│   └── sample_projects.json # Pre-loaded Initial Special Project & BOQ Dataset
└── README.md                # System Documentation
```

---

## 🔗 How CMSys Absorbs Special Project Attachments

CMSys can absorb attachment details through two pathways:
1. **Automated REST Sync**: CMSys issues a GET request to `SpecialProjectSystem/api/api.php?action=cmsys_absorb` to retrieve attached sailor IDs, project codes, duty roles, and date ranges.
2. **Offline JSON Package**: Click **"Download CMSys Absorption Package (.json)"** in the **CMSys Sync Bridge** tab and upload the generated JSON package directly into CMSys.
