<?php
/**
 * Special Project System (SPS) - Database & Server Configuration
 * Consolidated Unified Firebase Architecture:
 * Primary Unified RTDB: cmsys-v2 (asia-southeast1)
 * Decommissioned: legacy external endpoints consolidated into cmsys-v2
 */

// Baseline Security Headers
header("X-Frame-Options: SAMEORIGIN");
header("X-Content-Type-Options: nosniff");
header("Referrer-Policy: strict-origin-when-cross-origin");

// CORS & Content Configuration
$allowedOrigins = ['http://localhost', 'http://127.0.0.1'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Local Database Fallback Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'special_projects_db');
define('DB_USER', 'root');
define('DB_PASS', '');

// Unified Cloud Firebase Database Configuration (Target: cmsys-v2)
define('FIREBASE_PROJECT_ID', 'cmsys-v2');
define('FIREBASE_RTDB_URL', 'https://cmsys-v2-default-rtdb.asia-southeast1.firebasedatabase.app');
define('FIREBASE_DB1_URL', 'https://cmsys-v2-default-rtdb.asia-southeast1.firebasedatabase.app');

/**
 * Universal Firebase Realtime Database REST API Client
 */
function firebase_rtdb_request(string $method, string $path, $data = null, string $baseUrl = FIREBASE_RTDB_URL) {
    $cleanPath = ltrim($path, '/');
    if (!str_ends_with($cleanPath, '.json')) {
        $cleanPath .= '.json';
    }
    $url = rtrim($baseUrl, '/') . '/' . $cleanPath;

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, strtoupper($method));
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For local XAMPP environment compatibility

    $headers = ['Content-Type: application/json; charset=UTF-8'];

    if ($data !== null && in_array(strtoupper($method), ['PUT', 'POST', 'PATCH'], true)) {
        $jsonBody = is_string($data) ? $data : json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonBody);
        $headers[] = 'Content-Length: ' . strlen($jsonBody);
    }

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr  = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        return [
            'success' => false,
            'http_code' => 500,
            'error' => 'cURL error: ' . $curlErr,
            'data' => null
        ];
    }

    $decoded = json_decode($response, true);
    return [
        'success' => ($httpCode >= 200 && $httpCode < 300),
        'http_code' => $httpCode,
        'data' => ($decoded !== null) ? $decoded : $response,
        'raw' => $response
    ];
}

/**
 * Local PDO Database Connection with SQLite Fallback
 */
function getSPSDatabaseConnection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]);
        return $pdo;
    } catch (PDOException $e) {
        try {
            $sqlitePath = __DIR__ . '/sps_local.sqlite';
            $pdo = new PDO("sqlite:" . $sqlitePath);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            return $pdo;
        } catch (Exception $ex) {
            return null;
        }
    }
}
?>
