# Sri Lanka Navy Civil Engineering Department (SPS / CMSys)
## Consolidated Multi-Module Firebase Topology & Architecture (`cmsys-v2`)

This document details the unified cross-system architecture, connection endpoints, and security boundaries across all modules within the Naval Civil Works ecosystem, centralized exclusively under **`cmsys-v2`**.

---

## 1. Firebase Ecosystem Master Directory

```mermaid
graph TB
  subgraph Cluster_Unified["Consolidated Platform: cmsys-v2 (asia-southeast1)"]
    CP_RTDB[("cmsys-v2 Realtime Database<br/>• /naval_projects (25 Capital Projects)<br/>• /procurement_files (63 Requisitions)<br/>• /special_projects (17 Special Projects)<br/>• /special_project_attachments (128 Attachments)<br/>• /sailors (682 Active Personnel)<br/>• /inventory & /logistics<br/>• /job_cards & /work_orders<br/>• /document_registry & /job_minutes<br/>• /system_status")]
  end

  subgraph Module_Clients["Operational Modules"]
    SPS["SLN Special Projects (SP V1)"]
    V2["CMSys V2 Command Tactical ERP"]
    LOG["CMSys Logistics & Stores"]
    DOCS["CMSys Documents Suite"]
  end

  CP_RTDB <== "Bi-directional Live Sync" ==> SPS
  CP_RTDB <== "Bi-directional Live Sync" ==> V2
  CP_RTDB <== "Bi-directional Live Sync" ==> LOG
  CP_RTDB <== "Bi-directional Live Sync" ==> DOCS
```

---

## 2. Detailed Configuration & Connection Matrix

| Parameter | Configuration Value | Core Purpose & Scope | Access Mode in SPS |
| :--- | :--- | :--- | :--- |
| **Primary Project ID** | **`cmsys-v2`** | Unified Naval Civil Works Firebase Container | Primary Target |
| **Primary Database URL** | **`https://cmsys-v2-default-rtdb.asia-southeast1.firebasedatabase.app`** | Capital projects, PR requisitions, EVM special projects, personnel & logistics | Read / Write (Primary) |
| **Auth Domain** | **`cmsys-v2.firebaseapp.com`** | Google OAuth security boundary | Primary Auth |
| **Storage Bucket** | **`cmsys-v2.firebasestorage.app`** | Document attachments & technical drawings | Primary Storage |
| **Client Web App ID** | **`1:743775137662:web:3f2fdd74cd06a31160cd2f`** | Client web SDK binding | App ID |
| **API Key** | **`AIzaSyD2taQsUz26yfLoqnFgs-ED6WcFveUXS8w`** | Client web SDK API key | API Key |

---

## 3. Decommissioned Legacy Endpoints

The following 5 legacy/external project endpoints are decommissioned and routed into `cmsys-v2`:
1. `ce-admin-panel2025` -> Consolidated into `cmsys-v2` (`/sailors`, `/sd_office_data`, etc.)
2. `ncw-ps-operations` -> Consolidated into `cmsys-v2` (`/naval_detachments`, etc.)
3. `cmsys-v2-1fb05` -> Consolidated into `cmsys-v2` (`/logistics`, etc.)
4. `cmsys-projects` -> Consolidated into `cmsys-v2` (`/naval_projects`, `/procurement_files`, `/special_projects`, etc.)
5. `cmsys-documents` -> Consolidated into `cmsys-v2` (`/document_registry`, `/naval_letters`, `/job_minutes`, etc.)
