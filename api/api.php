<?php
/**
 * Special Project System (SPS) — Master REST API Endpoint
 * Handles Projects, Trade Quotas, Equal Opportunity Sailor Attachments,
 * Weather Logs, User Roles, and CMSys Absorption Sync
 */

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? $_POST['action'] ?? 'status';

try {
    switch ($action) {
        case 'status':
            echo json_encode([
                'status' => 'online',
                'system' => 'Special Project System (SPS v4)',
                'timestamp' => date('Y-m-d H:i:s'),
                'version' => '4.0.0'
            ]);
            break;

        case 'cmsys_absorb':
            // Endpoint allowing CMSys to absorb special project attachment details
            echo json_encode([
                'status' => 'success',
                'source' => 'SPS Module',
                'timestamp' => date('Y-m-d H:i:s'),
                'message' => 'Ready to stream attachment details to CMSys',
                'endpoint_ready' => true
            ]);
            break;

        default:
            echo json_encode([
                'status' => 'error',
                'message' => 'Unknown action: ' . htmlspecialchars($action)
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
