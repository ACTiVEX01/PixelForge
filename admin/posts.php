<?php $pageTitle = 'All Posts'; require_once __DIR__ . '/header.php'; $pdo = getDB(); ?>

<?php if (isset($_GET['msg'])): ?>
<div class="alert alert-success"><?= $_GET['msg']==='created'?'Post created!':($_GET['msg']==='updated'?'Post updated!':'Post deleted!') ?></div>
<?php endif; ?>

<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
        <h3>Manage Posts</h3>
        <a href="editor.php" class="btn btn-primary">+ New Post</a>
    </div>
    <div style="overflow-x:auto">
    <table>
        <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
        <?php $stmt = $pdo->query("SELECT * FROM posts ORDER BY created_at DESC"); while ($post = $stmt->fetch()): ?>
        <tr>
            <td><strong><?= htmlspecialchars($post['title']) ?></strong></td>
            <td><span class="badge badge-category"><?= htmlspecialchars($post['category']) ?></span></td>
            <td><span class="badge badge-<?= $post['status'] ?>"><?= $post['status'] ?></span></td>
            <td><?= number_format($post['views']) ?></td>
            <td><?= date('M j, Y', strtotime($post['created_at'])) ?></td>
            <td>
                <a href="editor.php?id=<?= $post['id'] ?>" class="btn btn-secondary btn-sm">Edit</a>
                <form method="POST" action="process.php" style="display:inline" onsubmit="return confirm('Delete this post?')">
                    <input type="hidden" name="action" value="delete_post">
                    <input type="hidden" name="id" value="<?= $post['id'] ?>">
                    <button type="submit" class="btn btn-danger btn-sm">Delete</button>
                </form>
            </td>
        </tr>
        <?php endwhile; ?>
        </tbody>
    </table>
    </div>
</div>

<?php require_once __DIR__ . '/footer.php'; ?>
