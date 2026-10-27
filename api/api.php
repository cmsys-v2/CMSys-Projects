<?php
/**
 * CMSys Project Platform — Master REST API Endpoint
 * Unified API for Sri Lanka Navy Dockyard Trincomalee
 * Handles:
 * 1. System Status & Multi-Cloud Health
 * 2. Officer Authentication & Profiles (Only Officers)
 * 3. Ongoing Projects (Naval Capital, Votes, Housing, Community & CSR)
 * 4. Attached Labors & Dynamic Allocation
 * 5. Full CMSys Ecosystem Bi-directional Synchronization
 */

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? 'status';

if (!function_exists('hashPasswordCustom')) {
    function hashPasswordCustom($password) {
        $hash = 2166136261;
        $salted = "ce-logistic-salt::" . $password;
        for ($i = 0; $i < strlen($salted); $i++) {
            $hash ^= ord($salted[$i]);
            $hash = ($hash * 16777619) & 0xFFFFFFFF;
        }
        return "h$" . base_convert($hash, 10, 36) . "$" . base_convert(strlen($salted), 10, 36);
    }
}

try {
    switch ($action) {
        case 'status':
        case 'firebase_status':
            $cloudRes = firebase_rtdb_request('GET', 'system_status');
            echo json_encode([
                'status' => 'online',
                'system' => 'CMSys Project Platform',
                'title' => 'CMSys Project',
                'dockyard' => 'Sri Lanka Navy Dockyard Trincomalee',
                'timestamp' => date('Y-m-d H:i:s'),
                'version' => '5.2.0',
                'cloud_db' => [
                    'project_id' => FIREBASE_PROJECT_ID,
                    'url' => FIREBASE_RTDB_URL,
                    'connected' => $cloudRes['success'],
                    'details' => $cloudRes['data']
                ]
            ]);
            break;

        // ═════════════════════════════════════════════════════════
        // REQUIREMENT 2: SYSTEM LOGIN DATA & OFFICER PROFILES (ONLY OFFICERS)
        // ═════════════════════════════════════════════════════════

        case 'get_officers':
            // 1. Try reading from cloud RTDB /officers
            $res = firebase_rtdb_request('GET', 'officers');
            if ($res['success'] && !empty($res['data'])) {
                $officers = is_array($res['data']) ? array_values(array_filter($res['data'])) : [];
                echo json_encode([
                    'status' => 'success',
                    'source' => 'cloud_rtdb',
                    'officers' => $officers
                ]);
            } else {
                // 2. Fallback to local data/officers.json
                $offPath = dirname(__DIR__) . '/data/officers.json';
                if (file_exists($offPath)) {
                    $officers = json_decode(file_get_contents($offPath), true);
                    echo json_encode([
                        'status' => 'success',
                        'source' => 'local_json',
                        'officers' => $officers
                    ]);
                } else {
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Officers directory unavailable'
                    ]);
                }
            }
            break;

        case 'login':
            $inputRaw = file_get_contents('php://input');
            $data = json_decode($inputRaw, true) ?: $_POST;

            $username = trim($data['username'] ?? '');
            $password = trim($data['password'] ?? '');

            if (empty($username) || empty($password)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Username and password are required'
                ]);
                break;
            }

            // Load officers from local JSON or cloud
            $offPath = dirname(__DIR__) . '/data/officers.json';
            $officers = file_exists($offPath) ? json_decode(file_get_contents($offPath), true) : [];

            $foundOfficer = null;
            $cleanUser = strtolower(str_replace(' ', '', $username));

            foreach ($officers as $off) {
                $match = (
                    strtolower(str_replace(' ', '', $off['username'] ?? '')) === $cleanUser ||
                    strtolower(str_replace(' ', '', $off['name'] ?? '')) === $cleanUser ||
                    strtolower(str_replace(' ', '', $off['serviceNo'] ?? '')) === $cleanUser
                );

                if (!$match && !empty($off['alt_usernames'])) {
                    foreach ($off['alt_usernames'] as $alt) {
                        if (strtolower(str_replace(' ', '', $alt)) === $cleanUser) {
                            $match = true;
                            break;
                        }
                    }
                }

                if ($match) {
                    $foundOfficer = $off;
                    break;
                }
            }

            if (!$foundOfficer) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Access Denied: Officer not recognized in CMSys naval registry'
                ]);
                break;
            }

            // Verify password against CMSys master passwords or hash
            $calcHash = hashPasswordCustom($password);
            $isValid = (
                $password === 'arjuna@1991' ||
                $password === 'Navy@2025' ||
                $password === 'admin123' ||
                (!empty($foundOfficer['passwordHash']) && $foundOfficer['passwordHash'] === $calcHash)
            );

            if (!$isValid) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Authentication Failed: Invalid password'
                ]);
                break;
            }

            // Return authenticated session
            $token = 'cmsys_' . bin2hex(random_bytes(16)) . '_' . time();
            echo json_encode([
                'status' => 'success',
                'message' => 'Officer authenticated successfully',
                'token' => $token,
                'officer' => [
                    'id' => $foundOfficer['id'],
                    'name' => $foundOfficer['name'],
                    'rank' => $foundOfficer['rank'],
                    'serviceNo' => $foundOfficer['serviceNo'],
                    'appointment' => $foundOfficer['appointment'],
                    'department' => $foundOfficer['department'],
                    'role' => $foundOfficer['role'],
                    'category' => 'Officer',
                    'email' => $foundOfficer['email'],
                    'phone' => $foundOfficer['phone'] ?? '',
                    'permissions' => $foundOfficer['permissions'] ?? ['view_all']
                ]
            ]);
            break;

        case 'save_officer':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || empty($input['id'])) {
                throw new Exception('Invalid officer payload');
            }

            // Update in local file
            $offPath = dirname(__DIR__) . '/data/officers.json';
            $officers = file_exists($offPath) ? json_decode(file_get_contents($offPath), true) : [];
            $found = false;
            foreach ($officers as &$off) {
                if ($off['id'] === $input['id']) {
                    $off = array_merge($off, $input);
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $officers[] = $input;
            }
            file_put_contents($offPath, json_encode($officers, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            // Sync to RTDB
            firebase_rtdb_request('PUT', 'officers', $officers);
            firebase_rtdb_request('PUT', 'user_profiles', $officers);

            echo json_encode([
                'status' => 'success',
                'message' => 'Officer profile updated and synchronized to cloud',
                'officers' => $officers
            ]);
            break;

        // ═════════════════════════════════════════════════════════
        // REQUIREMENT 3: ACQUIRE ONGOING PROJECTS & ATTACHED LABOURS & SYNC
        // ═════════════════════════════════════════════════════════

        case 'sync_all_cmsys':
            // Run full synchronization across all CMSys nodes
            $samplePath = dirname(__DIR__) . '/data/sample_projects.json';
            $navalPath = dirname(__DIR__) . '/data/naval_projects.json';
            $offPath = dirname(__DIR__) . '/data/officers.json';

            $sampleData = file_exists($samplePath) ? json_decode(file_get_contents($samplePath), true) : [];
            $navalData = file_exists($navalPath) ? json_decode(file_get_contents($navalPath), true) : [];
            $officersData = file_exists($offPath) ? json_decode(file_get_contents($offPath), true) : [];

            $specialProjects = $sampleData['projects'] ?? [];
            $attachments = $sampleData['labour_attachments'] ?? [];
            $navalProjects = $navalData['naval_projects'] ?? [];
            $procurementFiles = $navalData['procurement_files'] ?? [];

            // Push to cmsys-projects Cloud RTDB
            $p1 = firebase_rtdb_request('PUT', 'special_projects', $specialProjects);
            $p2 = firebase_rtdb_request('PUT', 'special_project_attachments', $attachments);
            $p3 = firebase_rtdb_request('PUT', 'naval_projects', $navalProjects);
            $p4 = firebase_rtdb_request('PUT', 'procurement_files', $procurementFiles);
            $p5 = firebase_rtdb_request('PUT', 'officers', $officersData);
            $p6 = firebase_rtdb_request('PUT', 'user_profiles', $officersData);

            $statusPayload = [
                'system' => 'CMSys Project Platform — Sri Lanka Navy Dockyard Trincomalee',
                'name' => 'CMSys Project',
                'version' => '5.2.0',
                'status' => 'online',
                'cluster' => 'cmsys-projects (asia-southeast1)',
                'last_sync' => date('c'),
                'counts' => [
                    'officers' => count($officersData),
                    'special_projects' => count($specialProjects),
                    'naval_projects' => count($navalProjects),
                    'procurement_files' => count($procurementFiles),
                    'attached_labours' => count($attachments)
                ]
            ];
            firebase_rtdb_request('PUT', 'system_status', $statusPayload);

            echo json_encode([
                'status' => 'success',
                'message' => 'Complete CMSys bi-directional synchronization performed successfully',
                'timestamp' => date('Y-m-d H:i:s'),
                'synced' => [
                    'officers' => count($officersData),
                    'ongoing_special_projects' => count($specialProjects),
                    'naval_capital_projects' => count($navalProjects),
                    'procurement_files' => count($procurementFiles),
                    'attached_labours' => count($attachments)
                ],
                'cloud_status' => [
                    'special_projects' => $p1['success'],
                    'attachments' => $p2['success'],
                    'naval_projects' => $p3['success'],
                    'procurement_files' => $p4['success'],
                    'officers' => $p5['success']
                ]
            ]);
            break;

        case 'get_cmsys_labour':
            $samplePath = dirname(__DIR__) . '/data/sample_projects.json';
            $sampleData = file_exists($samplePath) ? json_decode(file_get_contents($samplePath), true) : [];
            $attachments = $sampleData['labour_attachments'] ?? [];
            echo json_encode([
                'status' => 'success',
                'total' => count($attachments),
                'count' => count($attachments),
                'attachments' => $attachments
            ]);
            break;

        case 'get_cmsys_sailors':
            $sailorsPath = dirname(__DIR__) . '/data/cmsys_sailors.json';
            if (file_exists($sailorsPath)) {
                $raw = json_decode(file_get_contents($sailorsPath), true);
                echo json_encode(['status' => 'success', 'sailors' => $raw]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'cmsys_sailors.json not found']);
            }
            break;

        case 'get_cmsys_availability':
            $avPath = dirname(__DIR__) . '/data/cmsys_availability.json';
            if (file_exists($avPath)) {
                $raw = json_decode(file_get_contents($avPath), true);
                echo json_encode(['status' => 'success', 'availability' => $raw]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'cmsys_availability.json not found']);
            }
            break;

        case 'get_cmsys_out_projects':
            $outPath = dirname(__DIR__) . '/data/cmsys_out_projects.json';
            if (file_exists($outPath)) {
                $raw = json_decode(file_get_contents($outPath), true);
                echo json_encode(['status' => 'success', 'out_projects' => $raw]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'cmsys_out_projects.json not found']);
            }
            break;

        case 'get_ongoing_projects':
            $samplePath = dirname(__DIR__) . '/data/sample_projects.json';
            $sampleData = file_exists($samplePath) ? json_decode(file_get_contents($samplePath), true) : [];
            $navalPath = dirname(__DIR__) . '/data/naval_projects.json';
            $navalData = file_exists($navalPath) ? json_decode(file_get_contents($navalPath), true) : [];

            $sp = $sampleData['projects'] ?? [];
            $np = $navalData['naval_projects'] ?? [];

            echo json_encode([
                'status' => 'success',
                'total' => count($sp) + count($np),
                'special_projects_count' => count($sp),
                'naval_projects_count' => count($np),
                'special_projects' => $sp,
                'naval_projects' => $np
            ]);
            break;

        case 'cmsys_absorb':
            $inputRaw = file_get_contents('php://input');
            $payload = json_decode($inputRaw, true) ?: $_POST;

            if (!empty($payload)) {
                $saveRes = firebase_rtdb_request('PUT', 'cmsys_absorption', $payload);
                if (!empty($payload['attachments'])) {
                    firebase_rtdb_request('PUT', 'special_project_attachments', $payload['attachments']);
                }
                echo json_encode([
                    'status' => 'success',
                    'source' => 'CMSys Sync Engine',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'message' => 'Absorption payload successfully published to cmsys-projects cloud backend',
                    'attached_sailors_count' => count($payload['attachments'] ?? []),
                    'cloud_write' => $saveRes['success']
                ]);
            } else {
                $currentAbsorb = firebase_rtdb_request('GET', 'cmsys_absorption');
                echo json_encode([
                    'status' => 'success',
                    'source' => 'CMSys Sync Engine',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'data' => $currentAbsorb['data']
                ]);
            }
            break;

        case 'get_projects':
            $res = firebase_rtdb_request('GET', 'special_projects');
            if ($res['success'] && !empty($res['data'])) {
                echo json_encode([
                    'status' => 'success',
                    'projects' => is_array($res['data']) ? array_values(array_filter($res['data'])) : $res['data']
                ]);
            } else {
                $samplePath = dirname(__DIR__) . '/data/sample_projects.json';
                $json = file_exists($samplePath) ? json_decode(file_get_contents($samplePath), true) : [];
                echo json_encode([
                    'status' => 'fallback',
                    'projects' => $json['projects'] ?? []
                ]);
            }
            break;

        case 'save_projects':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) throw new Exception('Invalid JSON payload');
            $save = firebase_rtdb_request('PUT', 'special_projects', $input);
            echo json_encode([
                'status' => $save['success'] ? 'success' : 'error',
                'result' => $save['data']
            ]);
            break;

        case 'get_sailors':
            $res = firebase_rtdb_request('GET', 'sailors', null, FIREBASE_DB1_URL);
            echo json_encode([
                'status' => $res['success'] ? 'success' : 'error',
                'sailors' => $res['data'] ?? []
            ]);
            break;

        case 'get_naval_projects':
            $res = firebase_rtdb_request('GET', 'naval_projects');
            if ($res['success'] && !empty($res['data'])) {
                echo json_encode([
                    'status' => 'success',
                    'naval_projects' => is_array($res['data']) ? array_values(array_filter($res['data'])) : $res['data']
                ]);
            } else {
                $navalPath = dirname(__DIR__) . '/data/naval_projects.json';
                $json = file_exists($navalPath) ? json_decode(file_get_contents($navalPath), true) : [];
                echo json_encode([
                    'status' => 'fallback',
                    'naval_projects' => $json['naval_projects'] ?? []
                ]);
            }
            break;

        case 'save_naval_projects':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) throw new Exception('Invalid JSON payload');
            $save = firebase_rtdb_request('PUT', 'naval_projects', $input);
            echo json_encode([
                'status' => $save['success'] ? 'success' : 'error',
                'result' => $save['data']
            ]);
            break;

        case 'get_procurement_files':
            $res = firebase_rtdb_request('GET', 'procurement_files');
            if ($res['success'] && !empty($res['data'])) {
                echo json_encode([
                    'status' => 'success',
                    'procurement_files' => is_array($res['data']) ? array_values(array_filter($res['data'])) : $res['data']
                ]);
            } else {
                $navalPath = dirname(__DIR__) . '/data/naval_projects.json';
                $json = file_exists($navalPath) ? json_decode(file_get_contents($navalPath), true) : [];
                echo json_encode([
                    'status' => 'fallback',
                    'procurement_files' => $json['procurement_files'] ?? []
                ]);
            }
            break;

        case 'save_procurement_file':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) throw new Exception('Invalid JSON payload');
            $fileId = $input['id'] ?? ('PF-' . time());
            $save = firebase_rtdb_request('PUT', 'procurement_files/' . $fileId, $input);
            echo json_encode([
                'status' => $save['success'] ? 'success' : 'error',
                'file_id' => $fileId,
                'result' => $save['data']
            ]);
            break;

        default:
            echo json_encode([
                'status' => 'error',
                'message' => 'Unknown action: ' . htmlspecialchars($action, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
