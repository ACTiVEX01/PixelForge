<?php session_start(); if (isset($_SESSION['admin_id'])) { header('Location: index.php'); exit; } ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - PixelForge Admin</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', sans-serif; background: #0a0a0f; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-box { background: #1a1a25; padding: 3rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); width: 100%; max-width: 400px; }
        h1 { text-align: center; margin-bottom: 0.5rem; font-size: 1.75rem; }
        .subtitle { text-align: center; color: #888; margin-bottom: 2rem; }
        .form-group { margin-bottom: 1.25rem; }
        label { display: block; margin-bottom: 0.5rem; font-weight: 500; font-size: 0.9rem; color: #aaa; }
        input { width: 100%; padding: 0.85rem 1rem; background: #0a0a0f; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #fff; font-size: 1rem; outline: none; transition: border-color 0.3s; }
        input:focus { border-color: #00f5ff; }
        .btn { width: 100%; padding: 0.85rem; background: linear-gradient(135deg, #00f5ff, #0080ff); border: none; border-radius: 8px; color: #0a0a0f; font-weight: 700; font-size: 1rem; cursor: pointer; transition: transform 0.2s; }
        .btn:hover { transform: translateY(-2px); }
        .error { background: rgba(255,51,102,0.15); border: 1px solid #ff3366; color: #ff3366; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; text-align: center; font-size: 0.9rem; }
        .logo { text-align: center; font-size: 2rem; margin-bottom: 0.5rem; }
    </style>
</head>
<body>
    <div class="login-box">
        <div class="logo">🎮</div>
        <h1>PixelForge Admin</h1>
        <p class="subtitle">Sign in to manage your blog</p>
        <?php if (isset($error)): ?><div class="error"><?= $error ?></div><?php endif; ?>
        <form method="POST" action="process.php">
            <input type="hidden" name="action" value="login">
            <div class="form-group">
                <label>Username</label>
                <input type="text" name="username" required autofocus>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit" class="btn">Sign In</button>
        </form>
    </div>
</body>
</html>
