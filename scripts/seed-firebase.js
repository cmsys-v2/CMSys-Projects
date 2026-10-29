/**
 * CMSys Projects Platform — Firebase Backend Seeder & Verifier
 * Project: cmsys-v2 (asia-southeast1)
 * RTDB URL: https://cmsys-v2-default-rtdb.asia-southeast1.firebasedatabase.app
 */

const fs = require('fs');
const path = require('path');

const RTDB_BASE = 'https://cmsys-v2-default-rtdb.asia-southeast1.firebasedatabase.app';

// Load local dataset files
const navalDataPath = path.join(__dirname, '../data/naval_projects.json');
const sampleDataPath = path.join(__dirname, '../data/sample_projects.json');

const navalData = JSON.parse(fs.readFileSync(navalDataPath, 'utf8'));
const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));

async function putNode(nodePath, data) {
  const url = `${RTDB_BASE}/${nodePath}.json`;
  console.log(`📡 Writing [${nodePath}] (${Array.isArray(data) ? data.length + ' items' : 'object'})...`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error(`Failed to write ${nodePath}: ${res.status} ${res.statusText}`);
  }
  return await res.json();
}

async function verifyNode(nodePath) {
  const url = `${RTDB_BASE}/${nodePath}.json?shallow=true`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to read ${nodePath}: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const count = data ? Object.keys(data).length : 0;
  return count;
}

async function runSeed() {
  console.log('====================================================');
  console.log('🚀 CMSys Projects: Firebase RTDB Seeder Starting...');
  console.log(`🎯 Target Endpoint: ${RTDB_BASE}`);
  console.log('====================================================\n');

  try {
    // 1. Seed naval_projects
    const navalProjects = navalData.naval_projects || [];
    await putNode('naval_projects', navalProjects);

    // 2. Seed procurement_files
    const procurementFiles = navalData.procurement_files || [];
    await putNode('procurement_files', procurementFiles);

    // 3. Seed special_projects
    const specialProjects = sampleData.projects || [];
    await putNode('special_projects', specialProjects);
    await putNode('projects', specialProjects); // mirror for legacy compatibility

    // 4. Seed special_project_attachments
    const attachments = sampleData.labour_attachments || [];
    if (attachments.length > 0) {
      await putNode('special_project_attachments', attachments);
      await putNode('attachments', attachments);
    }

    // 5. Seed job_cards
    const jobCards = sampleData.job_cards || [];
    if (jobCards.length > 0) {
      await putNode('job_cards', jobCards);
    }

    // 6. Seed documents
    const documents = sampleData.documents || [];
    if (documents.length > 0) {
      await putNode('documents', documents);
    }

    // 7. Seed weather_logs
    const weatherLogs = sampleData.weather_logs || [];
    if (weatherLogs.length > 0) {
      await putNode('weather_logs', weatherLogs);
    }

    // 8. Update system_status & ecosystem metadata
    const systemStatus = {
      system: 'Sri Lanka Navy Civil Engineering — SLN Projects Platform (CMSys Projects)',
      version: '5.0.0',
      last_seed_at: new Date().toISOString(),
      status: 'online',
      cluster: 'cmsys-v2 (asia-southeast1)',
      counts: {
        naval_projects: navalProjects.length,
        procurement_files: procurementFiles.length,
        special_projects: specialProjects.length,
        attachments: attachments.length,
        job_cards: jobCards.length
      },
      votes_catalog: [
        { code: '2104', label: 'Vote 2104 — Capital Works & Constructions' },
        { code: '2001', label: 'Vote 2001 — Infrastructure Renovations' },
        { code: '2506', label: 'Vote 2506 — Coastal & Marine Engineering' },
        { code: '1303', label: 'Vote 1303 — Base & Station Maintenance' },
        { code: '2103', label: 'Vote 2103 — Plant Machinery & Equipment' },
        { code: 'NON-NAVAL', label: 'Non-Naval / Welfare & Contractual Funds' }
      ]
    };
    await putNode('system_status', systemStatus);

    console.log('\n====================================================');
    console.log('🔍 Verifying Data in Firebase Realtime Database...');
    console.log('====================================================');

    const vNaval = await verifyNode('naval_projects');
    const vProc = await verifyNode('procurement_files');
    const vSpecial = await verifyNode('special_projects');
    const vAtt = await verifyNode('special_project_attachments');

    console.log(`✅ naval_projects count in RTDB:            ${vNaval}`);
    console.log(`✅ procurement_files count in RTDB:          ${vProc}`);
    console.log(`✅ special_projects count in RTDB:           ${vSpecial}`);
    console.log(`✅ special_project_attachments count in RTDB:${vAtt}`);
    console.log('\n🎉 Firebase Backend Seeding & Verification Completed Successfully!');
  } catch (err) {
    console.error('❌ Seeding failed with error:', err);
    process.exit(1);
  }
}

runSeed();
