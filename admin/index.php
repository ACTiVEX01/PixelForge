<?php $pageTitle = 'Dashboard'; require_once __DIR__ . '/header.php'; $pdo = getDB(); ?>

<?php if (isset($_GET['msg'])): ?>
<div class="alert alert-success">
<?php if ($_GET['msg'] === 'created') echo 'Post created successfully!'; elseif ($_GET['msg'] === 'updated') echo 'Post updated successfully!'; else echo 'Post deleted!'; ?>
</div>
<?php endif; ?>

<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-value"><?= $pdo->query("SELECT COUNT(*) FROM posts")->fetchColumn() ?></div>
        <div class="stat-label">Total Posts</div>
    </div>
    <div class="stat-card">
        <div class="stat-value"><?= $pdo->query("SELECT COUNT(*) FROM posts WHERE status='published'")->fetchColumn() ?></div>
        <div class="stat-label">Published</div>
    </div>
    <div class="stat-card">
        <div class="stat-value"><?= $pdo->query("SELECT COUNT(*) FROM posts WHERE status='draft'")->fetchColumn() ?></div>
        <div class="stat-label">Drafts</div>
    </div>
    <div class="stat-card">
        <div class="stat-value"><?= $pdo->query("SELECT COALESCE(SUM(views),0) FROM posts")->fetchColumn() ?></div>
        <div class="stat-label">Total Views</div>
    </div>
</div>

<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
        <h3>Recent Posts</h3>
        <a href="editor.php" class="btn btn-primary">+ New Post</a>
    </div>
    <div style="overflow-x:auto">
    <table>
        <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
        <?php $stmt = $pdo->query("SELECT * FROM posts ORDER BY created_at DESC LIMIT 10"); while ($post = $stmt->fetch()): ?>
        <tr>
            <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"><strong><?= htmlspecialchars($post['title']) ?></strong></td>
            <td><span class="badge badge-category"><?= htmlspecialchars($post['category']) ?></span></td>
            <td><span class="badge badge-<?= $post['status'] ?>"><?= $post['status'] ?></span></td>
            <td><?= number_format($post['views']) ?></td>
            <td><?= date('M j, Y', strtotime($post['created_at'])) ?></td>
            <td><a href="editor.php?id=<?= $post['id'] ?>" class="btn btn-secondary btn-sm">Edit</a></td>
        </tr>
        <?php endwhile; ?>
        </tbody>
    </table>
    </div>
</div>

<div class="card">
    <h3 style="margin-bottom:1rem">Quick Actions</h3>
    <div style="display:flex;gap:1rem;flex-wrap:wrap">
        <a href="editor.php" class="btn btn-primary">✏️ Write New Post</a>
        <a href="posts.php" class="btn btn-secondary">📋 Manage All Posts</a>
        <a href="settings.php#adsense" class="btn btn-secondary">💰 Configure AdSense</a>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
