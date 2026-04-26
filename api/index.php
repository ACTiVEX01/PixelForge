<?php
session_start();
require_once '../config/functions.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$pdo = getDB();

try {
    switch ($action) {
        case 'get_posts':
            $status = $_GET['status'] ?? 'published';
            $category = $_GET['category'] ?? '';
            $page = max(1, intval($_GET['page'] ?? 1));
            $limit = 9;
            $offset = ($page - 1) * $limit;
            
            $where = "WHERE p.status = ?";
            $params = [$status];
            
            if ($category) {
                $where .= " AND p.category = ?";
                $params[] = $category;
            }
            
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM posts p $where");
            $stmt->execute($params);
            $total = $stmt->fetchColumn();
            
            $stmt = $pdo->prepare("SELECT p.*, u.display_name as author_name, u.avatar as author_avatar, (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'approved') as comment_count FROM posts p LEFT JOIN users u ON p.author_id = u.id $where ORDER BY p.published_at DESC LIMIT $limit OFFSET $offset");
            $stmt->execute($params);
            $posts = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'posts' => $posts, 'total' => $total, 'pages' => ceil($total / $limit), 'page' => $page]);
            break;

        case 'get_post':
            $slug = $_GET['slug'] ?? '';
            if (!$slug) { echo json_encode(['error' => 'No slug']); break; }
            
            $stmt = $pdo->prepare("SELECT p.*, u.display_name as author_name, u.avatar as author_avatar FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.slug = ? AND p.status = 'published'");
            $stmt->execute([$slug]);
            $post = $stmt->fetch();
            
            if (!$post) { echo json_encode(['error' => 'Post not found']); break; }
            
            $pdo->prepare("UPDATE posts SET views = views + 1 WHERE id = ?")->execute([$post['id']]);
            
            $stmt = $pdo->prepare("SELECT * FROM comments WHERE post_id = ? AND status = 'approved' ORDER BY created_at DESC");
            $stmt->execute([$post['id']]);
            $post['comments'] = $stmt->fetchAll();
            
            $stmt = $pdo->prepare("SELECT id, title, slug, excerpt, featured_image, published_at FROM posts WHERE category = ? AND id != ? AND status = 'published' ORDER BY published_at DESC LIMIT 3");
            $stmt->execute([$post['category'], $post['id']]);
            $post['related'] = $stmt->fetchAll();
            
            echo json_encode(['success' => true, 'post' => $post]);
            break;

        case 'get_categories':
            $stmt = $pdo->query("SELECT category, COUNT(*) as count FROM posts WHERE status = 'published' GROUP BY category ORDER BY count DESC");
            echo json_encode(['success' => true, 'categories' => $stmt->fetchAll()]);
            break;

        case 'get_settings':
            $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
            $rows = $stmt->fetchAll();
            $settings = [];
            foreach ($rows as $row) $settings[$row['setting_key']] = $row['setting_value'];
            echo json_encode(['success' => true, 'settings' => $settings]);
            break;

        case 'search':
            $query = $_GET['q'] ?? '';
            if (strlen($query) < 2) { echo json_encode(['success' => true, 'posts' => []]); break; }
            $stmt = $pdo->prepare("SELECT p.*, u.display_name as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.status = 'published' AND (p.title LIKE ? OR p.excerpt LIKE ? OR p.tags LIKE ?) ORDER BY p.published_at DESC LIMIT 10");
            $search = '%' . $query . '%';
            $stmt->execute([$search, $search, $search]);
            echo json_encode(['success' => true, 'posts' => $stmt->fetchAll()]);
            break;

        case 'subscribe':
            $email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
            if (!$email) { echo json_encode(['error' => 'Invalid email']); break; }
            try {
                $pdo->prepare("INSERT INTO subscribers (email) VALUES (?)")->execute([$email]);
                echo json_encode(['success' => true, 'message' => 'Subscribed!']);
            } catch (PDOException $e) {
                echo json_encode(['success' => true, 'message' => 'Already subscribed!']);
            }
            break;

        case 'add_comment':
            $data = json_decode(file_get_contents('php://input'), true);
            $postId = intval($data['post_id'] ?? 0);
            $name = trim($data['name'] ?? '');
            $content = trim($data['content'] ?? '');
            if (!$postId || !$name || !$content) { echo json_encode(['error' => 'Missing fields']); break; }
            $pdo->prepare("INSERT INTO comments (post_id, author_name, content) VALUES (?, ?, ?)")->execute([$postId, $name, $content]);
            echo json_encode(['success' => true, 'message' => 'Comment added!']);
            break;

        default:
            echo json_encode(['error' => 'Invalid action']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
