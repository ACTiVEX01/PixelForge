<?php require_once __DIR__ . '/../config/functions.php'; session_start(); requireLogin();
$pageTitle = $pageTitle ?? 'Dashboard'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= $pageTitle ?> - Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#0a0a0f;--card:#1a1a25;--hover:#22222f;--text:#fff;--muted:#888;--accent:#00f5ff;--border:rgba(255,255,255,0.1);--success:#00ff88;--warn:#ffaa00;--error:#ff3366;--r:12px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);display:flex;min-height:100vh}
.sidebar{width:260px;background:var(--card);border-right:1px solid var(--border);padding:1.5rem;position:fixed;height:100vh;z-index:100}
.sidebar-logo{display:flex;align-items:center;gap:0.75rem;font-size:1.25rem;font-weight:700;margin-bottom:2rem;color:var(--accent);text-decoration:none}
.sidebar-nav a{display:flex;align-items:center;gap:0.75rem;padding:0.75rem 1rem;color:var(--muted);text-decoration:none;border-radius:8px;margin-bottom:0.25rem;transition:0.2s}
.sidebar-nav a:hover,.sidebar-nav a.active{background:rgba(0,245,255,0.1);color:var(--accent)}
.main{flex:1;margin-left:260px}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:1rem 2rem;background:var(--card);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:50}
.content{padding:2rem}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:1.5rem;margin-bottom:1.5rem}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem;margin-bottom:2rem}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:1.5rem}
.stat-value{font-size:2rem;font-weight:700;color:var(--accent)}
.stat-label{color:var(--muted);font-size:0.85rem;margin-top:0.25rem}
.form-group{margin-bottom:1.25rem}
.form-group label{display:block;margin-bottom:0.5rem;font-weight:500;color:var(--muted);font-size:0.9rem}
.form-group input,.form-group textarea,.form-group select{width:100%;padding:0.75rem 1rem;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:0.95rem;outline:none;font-family:inherit}
.form-group input:focus,.form-group textarea:focus,.form-group select:focus{border-color:var(--accent)}
.form-group textarea{min-height:350px;resize:vertical}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.btn{padding:0.65rem 1.25rem;border-radius:8px;border:none;font-weight:600;cursor:pointer;transition:0.2s;font-size:0.9rem;display:inline-flex;align-items:center;gap:0.5rem;text-decoration:none}
.btn-primary{background:var(--accent);color:var(--bg)}
.btn-secondary{background:transparent;border:1px solid var(--border);color:var(--text)}
.btn-danger{background:var(--error);color:#fff}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:0.75rem 1rem;color:var(--muted);font-size:0.85rem;border-bottom:1px solid var(--border)}
td{padding:0.75rem 1rem;border-bottom:1px solid var(--border);font-size:0.9rem}
tr:hover td{background:var(--hover)}
.badge{display:inline-block;padding:0.25rem 0.6rem;border-radius:50px;font-size:0.75rem;font-weight:600}
.badge-published{background:rgba(0,255,136,0.15);color:var(--success)}
.badge-draft{background:rgba(255,170,0,0.15);color:var(--warn)}
.alert{padding:0.75rem 1rem;border-radius:8px;margin-bottom:1rem}
.alert-success{background:rgba(0,255,136,0.15);border:1px solid var(--success);color:var(--success)}
.toolbar{display:flex;flex-wrap:wrap;gap:0.25rem;padding:0.5rem;background:var(--bg);border:1px solid var(--border);border-bottom:none;border-radius:8px 8px 0 0}
.toolbar button{width:36px;height:36px;background:transparent;border:none;color:var(--muted);border-radius:6px;cursor:pointer;font-size:0.9rem}
.toolbar button:hover{background:var(--hover);color:var(--accent)}
.editor-wrap{border-radius:0 0 8px 8px}
.img-area{border:2px dashed var(--border);border-radius:8px;padding:2rem;text-align:center;cursor:pointer}
.img-area:hover{border-color:var(--accent)}
.mt{display:none;background:none;border:none;color:var(--text);font-size:1.5rem;cursor:pointer}
@media(max-width:768px){.sidebar{transform:translateX(-100%);transition:0.3s}.sidebar.open{transform:translateX(0)}.main{margin-left:0}.form-row{grid-template-columns:1fr}.mt{display:block}}
</style>
</head>
<body>
<aside class="sidebar" id="sidebar">
    <a href="index.php" class="sidebar-logo">🎮 PixelForge</a>
    <nav class="sidebar-nav">
        <a href="index.php" <?= strpos($_SERVER['PHP_SELF'],'/index.php')!==false?'class="active"':'' ?>>📊 Dashboard</a>
        <a href="posts.php" <?= strpos($_SERVER['PHP_SELF'],'/posts.php')!==false?'class="active"':'' ?>>📝 Posts</a>
        <a href="editor.php" <?= strpos($_SERVER['PHP_SELF'],'/editor.php')!==false?'class="active"':'' ?>>✏️ New Post</a>
        <a href="settings.php" <?= strpos($_SERVER['PHP_SELF'],'/settings.php')!==false?'class="active"':'' ?>>⚙️ Settings & AdSense</a>
        <a href="process.php?action=logout">🚪 Logout</a>
    </nav>
</aside>
<div class="main">
<div class="topbar">
    <div style="display:flex;align-items:center;gap:1rem">
        <button class="mt" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
        <h2><?= $pageTitle ?></h2>
    </div>
    <span style="color:var(--muted);font-size:0.9rem"><?= $_SESSION['admin_name'] ?></span>
</div>
<div class="content">
