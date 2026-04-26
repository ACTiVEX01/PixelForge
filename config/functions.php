<?php
require_once __DIR__ . '/database.php';

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            die(json_encode(['error' => 'Database connection failed']));
        }
    }
    return $pdo;
}

function generateSlug($title) {
    $slug = strtolower(trim($title));
    $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
    $slug = preg_replace('/-+/', '-', $slug);
    $slug = trim($slug, '-');
    return $slug . '-' . substr(md5(uniqid()), 0, 6);
}

function sanitize($data) {
    return htmlspecialchars(strip_tags($data), ENT_QUOTES, 'UTF-8');
}

function generateCSRF() {
    if (empty($_SESSION[CSRF_TOKEN_NAME])) {
        $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
    }
    return $_SESSION[CSRF_TOKEN_NAME];
}

function verifyCSRF($token) {
    return isset($_SESSION[CSRF_TOKEN_NAME]) && hash_equals($_SESSION[CSRF_TOKEN_NAME], $token);
}

function jsonResponse($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function isLoggedIn() {
    return isset($_SESSION['admin_id']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        header('Location: /admin/login.php');
        exit;
    }
}

function uploadImage($file) {
    if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
        return ['error' => 'Upload failed'];
    }
    
    $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowed)) {
        return ['error' => 'Invalid file type. Use JPG, PNG, GIF, or WebP.'];
    }
    
    if ($file['size'] > 5 * 1024 * 1024) {
        return ['error' => 'File too large. Max 5MB.'];
    }
    
    $uploadDir = UPLOAD_DIR;
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('img_') . '.' . $ext;
    $path = $uploadDir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $path)) {
        return ['url' => UPLOAD_URL . $filename];
    }
    
    return ['error' => 'Failed to save file'];
}

function formatDate($date) {
    return date('M j, Y', strtotime($date));
}

function readTime($content) {
    $words = str_word_count(strip_tags($content));
    $minutes = ceil($words / 200);
    return $minutes . ' min read';
}
?>
