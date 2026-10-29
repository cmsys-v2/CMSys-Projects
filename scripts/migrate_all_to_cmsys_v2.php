<?php
/**
 * Migration Script: Consolidate all Projects, Procurement, Labours, and Officers into cmsys-v2
 * Target RTDB: https://cmsys-v2-default-rtdb.asia-southeast1.firebasedatabase.app
 */

$targetBaseUrl = 'https://cmsys-v2-default-rtdb.asia-southeast1.firebasedatabase.app';

echo "========================================================\n";
echo "  Consolidating Datasets into cmsys-v2 Unified RTDB\n";
echo "  Target: $targetBaseUrl\n";
echo "========================================================\n\n";

function rtdb_put($path, $data, $baseUrl) {
    $url = rtrim($baseUrl, '/') . '/' . ltrim($path, '/') . '.json';
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($json)
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'success' => ($httpCode >= 200 && $httpCode < 300),
        'response' => $response,
        'error' => $err
    ];
}

// 1. Load Files
$baseDir = dirname(__DIR__);
$sampleFile = $baseDir . '/data/sample_projects.json';
$navalFile  = $baseDir . '/data/naval_projects.json';
$offFile    = $baseDir . '/data/officers.json';

$sampleData = file_exists($sampleFile) ? json_decode(file_get_contents($sampleFile), true) : [];
$navalData  = file_exists($navalFile)  ? json_decode(file_get_contents($navalFile), true) : [];
$offData    = file_exists($offFile)    ? json_decode(file_get_contents($offFile), true) : [];

$specialProjects = $sampleData['projects'] ?? [];
$attachments     = $sampleData['labour_attachments'] ?? [];
$navalProjects   = $navalData['naval_projects'] ?? [];
$procurementFiles= $navalData['procurement_files'] ?? [];
$officers        = $offData['officers'] ?? (is_array($offData) ? $offData : []);

echo "Loaded records:\n";
echo "  - Special Projects: " . count($specialProjects) . "\n";
echo "  - Labour Attachments: " . count($attachments) . "\n";
echo "  - Naval Capital Projects: " . count($navalProjects) . "\n";
echo "  - Procurement Files: " . count($procurementFiles) . "\n";
echo "  - Officers Profiles: " . count($officers) . "\n\n";

// 2. Push to cmsys-v2
echo "[1/7] Migrating /special_projects to cmsys-v2...\n";
$r1 = rtdb_put('special_projects', $specialProjects, $targetBaseUrl);
echo "      HTTP {$r1['code']} — " . ($r1['success'] ? "SUCCESS" : "FAILED: " . $r1['response']) . "\n";

echo "[2/7] Migrating /special_project_attachments to cmsys-v2...\n";
$r2 = rtdb_put('special_project_attachments', $attachments, $targetBaseUrl);
echo "      HTTP {$r2['code']} — " . ($r2['success'] ? "SUCCESS" : "FAILED: " . $r2['response']) . "\n";

echo "[3/7] Migrating /naval_projects to cmsys-v2...\n";
$r3 = rtdb_put('naval_projects', $navalProjects, $targetBaseUrl);
echo "      HTTP {$r3['code']} — " . ($r3['success'] ? "SUCCESS" : "FAILED: " . $r3['response']) . "\n";

echo "[4/7] Migrating /procurement_files to cmsys-v2...\n";
$r4 = rtdb_put('procurement_files', $procurementFiles, $targetBaseUrl);
echo "      HTTP {$r4['code']} — " . ($r4['success'] ? "SUCCESS" : "FAILED: " . $r4['response']) . "\n";

echo "[5/7] Migrating /officers to cmsys-v2...\n";
$r5 = rtdb_put('officers', $officers, $targetBaseUrl);
echo "      HTTP {$r5['code']} — " . ($r5['success'] ? "SUCCESS" : "FAILED: " . $r5['response']) . "\n";

echo "[6/7] Migrating /user_profiles to cmsys-v2...\n";
$r6 = rtdb_put('user_profiles', $officers, $targetBaseUrl);
echo "      HTTP {$r6['code']} — " . ($r6['success'] ? "SUCCESS" : "FAILED: " . $r6['response']) . "\n";

echo "[7/7] Updating /system_status on cmsys-v2...\n";
$statusPayload = [
    'system' => 'CMSys Project Platform — Sri Lanka Navy Dockyard Trincomalee',
    'name' => 'CMSys Project',
    'version' => '5.3.0',
    'status' => 'online',
    'cluster' => 'cmsys-v2 (asia-southeast1)',
    'consolidated_at' => date('c'),
    'counts' => [
        'officers' => count($officers),
        'special_projects' => count($specialProjects),
        'naval_projects' => count($navalProjects),
        'procurement_files' => count($procurementFiles),
        'attached_labours' => count($attachments)
    ]
];
$r7 = rtdb_put('system_status', $statusPayload, $targetBaseUrl);
echo "      HTTP {$r7['code']} — " . ($r7['success'] ? "SUCCESS" : "FAILED: " . $r7['response']) . "\n\n";

echo "Migration to cmsys-v2 complete!\n";
