<?php
session_start();
require_once '../config/functions.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $pdo = getDB();

    switch ($action) {
        case 'login':
            $username = trim($_POST['username'] ?? '');
            $password = $_POST['password'] ?? '';
            
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();
            
            if ($user && password_verify($password, $user['password'])) {
                $_SESSION['admin_id'] = $user['id'];
                $_SESSION['admin_name'] = $user['display_name'];
                $_SESSION['admin_role'] = $user['role'];
                $_SESSION[CSRF_TOKEN_NAME] = bin2hex(random_bytes(32));
                header('Location: index.php');
                exit;
            }
            $error = 'Invalid credentials';
            break;

        case 'create_post':
            requireLogin();
            $title = trim($_POST['title']);
            $content = $_POST['content'];
            $category = $_POST['category'];
            $excerpt = trim($_POST['excerpt']);
            $tags = trim($_POST['tags']);
            $status = $_POST['status'] ?? 'draft';
            $seoTitle = trim($_POST['seo_title'] ?? '');
            $metaDesc = trim($_POST['meta_description'] ?? '');
            
            $slug = generateSlug($title);
            $publishedAt = $status === 'published' ? date('Y-m-d H:i:s') : null;
            
            $stmt = $pdo->prepare("INSERT INTO posts (title, slug, content, category, excerpt, tags, status, author_id, seo_title, meta_description, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $slug, $content, $category, $excerpt, $tags, $status, $_SESSION['admin_id'], $seoTitle, $metaDesc, $publishedAt]);
            
            header('Location: posts.php?msg=created');
            exit;

        case 'update_post':
            requireLogin();
            $id = intval($_POST['id']);
            $title = trim($_POST['title']);
            $content = $_POST['content'];
            $category = $_POST['category'];
            $excerpt = trim($_POST['excerpt']);
            $tags = trim($_POST['tags']);
            $status = $_POST['status'];
            $seoTitle = trim($_POST['seo_title'] ?? '');
            $metaDesc = trim($_POST['meta_description'] ?? '');
            
            $stmt = $pdo->prepare("SELECT slug, status FROM posts WHERE id = ?");
            $stmt->execute([$id]);
            $old = $stmt->fetch();
            
            $slug = $old['slug'];
            $publishedAt = null;
            if ($status === 'published' && $old['status'] !== 'published') {
                $publishedAt = date('Y-m-d H:i:s');
            }
            
            $stmt = $pdo->prepare("UPDATE posts SET title = ?, content = ?, category = ?, excerpt = ?, tags = ?, status = ?, seo_title = ?, meta_description = ?, published_at = COALESCE(?, published_at) WHERE id = ?");
            $stmt->execute([$title, $content, $category, $excerpt, $tags, $status, $seoTitle, $metaDesc, $publishedAt, $id]);
            
            header('Location: posts.php?msg=updated');
            exit;

        case 'delete_post':
            requireLogin();
            $id = intval($_POST['id']);
            $pdo->prepare("DELETE FROM posts WHERE id = ?")->execute([$id]);
            header('Location: posts.php?msg=deleted');
            exit;

        case 'upload_image':
            requireLogin();
            if (isset($_FILES['image'])) {
                $result = uploadImage($_FILES['image']);
                if (isset($result['url'])) {
                    $pdo->prepare("INSERT INTO images (filename, url, size) VALUES (?, ?, ?)")->execute([
                        $_FILES['image']['name'], $result['url'], $_FILES['image']['size']
                    ]);
                    echo json_encode(['url' => $result['url']]);
                } else {
                    echo json_encode(['error' => $result['error']]);
                }
            }
            exit;

        case 'update_settings':
            requireLogin();
            foreach ($_POST as $key => $value) {
                if (strpos($key, 'setting_') === 0) {
                    $settingKey = str_replace('setting_', '', $key);
                    $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
                    $stmt->execute([$settingKey, $value, $value]);
                }
            }
            header('Location: settings.php?msg=updated');
            exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    
    if ($action === 'logout') {
        session_destroy();
        header('Location: login.php');
        exit;
    }
}
?>
