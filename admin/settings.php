<?php $pageTitle = 'Settings & AdSense'; require_once __DIR__ . '/header.php'; $pdo = getDB();
$stmt = $pdo->query("SELECT setting_key, setting_value FROM settings"); $settings = [];
while ($row = $stmt->fetch()) $settings[$row['setting_key']] = $row['setting_value']; ?>

<div class="card" id="general">
<h3 style="margin-bottom:1.5rem">General Settings</h3>
<form method="POST" action="process.php"><input type="hidden" name="action" value="update_settings">
<div class="form-row">
<div class="form-group"><label>Site Name</label><input type="text" name="setting_site_name" value="<?= htmlspecialchars($settings['site_name'] ?? 'PixelForge') ?>"></div>
<div class="form-group"><label>Posts Per Page</label><input type="number" name="setting_posts_per_page" value="<?= htmlspecialchars($settings['posts_per_page'] ?? '9') ?>"></div>
</div>
<button type="submit" class="btn btn-primary">Save Settings</button></form></div>

<div class="card" id="adsense">
<h3 style="margin-bottom:1.5rem">Google AdSense</h3>
<p style="color:var(--muted);margin-bottom:1.5rem">Enter AdSense details. Ads appear automatically on your site.</p>
<form method="POST" action="process.php"><input type="hidden" name="action" value="update_settings">
<div class="form-group"><label>AdSense Publisher ID</label><input type="text" name="setting_adsense_client" value="<?= htmlspecialchars($settings['adsense_client'] ?? '') ?>" placeholder="ca-pub-1234567890123456"></div>
<div class="form-group"><label>Header Ad Slot ID</label><input type="text" name="setting_adsense_header" value="<?= htmlspecialchars($settings['adsense_header'] ?? '') ?>" placeholder="1234567890"></div>
<div class="form-group"><label>Sidebar Ad Slot ID</label><input type="text" name="setting_adsense_sidebar" value="<?= htmlspecialchars($settings['adsense_sidebar'] ?? '') ?>" placeholder="1234567890"></div>
<div class="form-group"><label>In-Article Ad Slot ID</label><input type="text" name="setting_adsense_inarticle" value="<?= htmlspecialchars($settings['adsense_inarticle'] ?? '') ?>" placeholder="1234567890"></div>
<div class="form-group"><label>Footer Ad Slot ID</label><input type="text" name="setting_adsense_footer" value="<?= htmlspecialchars($settings['adsense_footer'] ?? '') ?>" placeholder="1234567890"></div>
<button type="submit" class="btn btn-primary">Save AdSense</button></form>
<div style="margin-top:2rem;padding:1.5rem;background:rgba(0,245,255,0.05);border:1px solid rgba(0,245,255,0.2);border-radius:8px">
<h4 style="margin-bottom:0.75rem">Setup Steps:</h4>
<ol style="padding-left:1.5rem;color:var(--muted);font-size:0.9rem;line-height:2">
<li>Go to <a href="https://adsense.google.com" target="_blank" style="color:var(--accent)">AdSense</a></li>
<li>Create ad units for Header, Sidebar, In-Article, Footer</li>
<li>Copy the Slot ID (numbers only) for each</li>
<li>Paste above and save</li>
</ol></div></div>

<?php if (isset($_GET['msg']) && $_GET['msg'] === 'updated'): ?>
<div class="alert alert-success" style="position:fixed;bottom:2rem;right:2rem;z-index:999">Saved!</div>
<?php endif; ?>

<?php require_once __DIR__ . '/footer.php'; ?>