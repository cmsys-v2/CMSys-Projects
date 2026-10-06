<?php
/**
 * Special Project System (SPS) — Master REST API Endpoint
 * Handles Projects, Trade Quotas, Sailor Attachments,
 * Weather Logs, User Roles, and CMSys Cloud Bridge
 */

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? 'status';

try {
    switch ($action) {
        case 'status':
        case 'firebase_status':
            $cloudRes = firebase_rtdb_request('GET', 'system_status');
            echo json_encode([
                'status' => 'online',
                'system' => 'Special Project System (SPS v4)',
                'timestamp' => date('Y-m-d H:i:s'),
                'version' => '4.0.0',
                'cloud_db' => [
                    'project_id' => FIREBASE_PROJECT_ID,
                    'url' => FIREBASE_RTDB_URL,
                    'connected' => $cloudRes['success'],
                    'details' => $cloudRes['data']
                ]
            ]);
            break;

        case 'cmsys_absorb':
            // Receive payload from client or external service
            $inputRaw = file_get_contents('php://input');
            $payload = json_decode($inputRaw, true);

            if (!$payload) {
                $payload = $_POST;
            }

            if (!empty($payload)) {
                // Publish directly to Firebase RTDB for CMSys absorption
                $saveRes = firebase_rtdb_request('PUT', 'cmsys_absorption', $payload);
                if (!empty($payload['attachments'])) {
                    firebase_rtdb_request('PUT', 'special_project_attachments', $payload['attachments']);
                }
                echo json_encode([
                    'status' => 'success',
                    'source' => 'SPS Cloud Engine',
                    'timestamp' => date('Y-m-d H:i:s'),
                    'message' => 'Absorption payload successfully published to cmsys-projects cloud backend',
                    'attached_sailors_count' => count($payload['attachments'] ?? []),
                    'cloud_write' => $saveRes['success']
                ]);
            } else {
                // Return current absorption state
                $currentAbsorb = firebase_rtdb_request('GET', 'cmsys_absorption');
                echo json_encode([
                    'status' => 'success',
                    'source' => 'SPS Cloud Engine',
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
                    'projects' => $res['data']
                ]);
            } else {
                // Fallback to sample data
                $samplePath = dirname(__DIR__) . '/data/sample_projects.json';
                if (file_exists($samplePath)) {
                    $json = json_decode(file_get_contents($samplePath), true);
                    echo json_encode([
                        'status' => 'fallback',
                        'projects' => $json['projects'] ?? []
                    ]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'No projects found']);
                }
            }
            break;

        case 'save_projects':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                throw new Exception('Invalid JSON payload');
            }
            $save = firebase_rtdb_request('PUT', 'special_projects', $input);
            echo json_encode([
                'status' => $save['success'] ? 'success' : 'error',
                'result' => $save['data']
            ]);
            break;

        case 'get_sailors':
            // Proxied read from Database #1 (ce-admin-panel2025)
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
                    'naval_projects' => $res['data']
                ]);
            } else {
                $navalPath = dirname(__DIR__) . '/data/naval_projects.json';
                if (file_exists($navalPath)) {
                    $json = json_decode(file_get_contents($navalPath), true);
                    echo json_encode([
                        'status' => 'fallback',
                        'naval_projects' => $json['naval_projects'] ?? []
                    ]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'No naval projects found']);
                }
            }
            break;

        case 'save_naval_projects':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                throw new Exception('Invalid JSON payload');
            }
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
                    'procurement_files' => $res['data']
                ]);
            } else {
                $navalPath = dirname(__DIR__) . '/data/naval_projects.json';
                if (file_exists($navalPath)) {
                    $json = json_decode(file_get_contents($navalPath), true);
                    echo json_encode([
                        'status' => 'fallback',
                        'procurement_files' => $json['procurement_files'] ?? []
                    ]);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'No procurement files found']);
                }
            }
            break;

        case 'save_procurement_file':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                throw new Exception('Invalid JSON payload');
            }
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
