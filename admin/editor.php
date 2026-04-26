<?php 
$pageTitle = isset($_GET['id']) ? 'Edit Post' : 'New Post'; 
require_once __DIR__ . '/header.php'; 
$pdo = getDB(); 
$post = null;
if (isset($_GET['id'])) {
    $stmt = $pdo->prepare("SELECT * FROM posts WHERE id = ?");
    $stmt->execute([$_GET['id']]);
    $post = $stmt->fetch();
    if (!$post) die('Post not found');
}
?>
<div class="card">
<form method="POST" action="process.php">
<input type="hidden" name="action" value="<?= $post ? 'update_post' : 'create_post' ?>">
<?php if ($post): ?><input type="hidden" name="id" value="<?= $post['id'] ?>"><?php endif; ?>
<div class="form-group"><label>Post Title *</label><input type="text" name="title" id="titleInput" value="<?= htmlspecialchars($post['title'] ?? '') ?>" placeholder="Enter post title" required></div>
<div class="form-row">
<div class="form-group"><label>Category *</label><select name="category" required>
<option value="">Select</option>
<option value="game-dev" <?= ($post['category'] ?? '')==='game-dev'?'selected':'' ?>>Game Development</option>
<option value="news" <?= ($post['category'] ?? '')==='news'?'selected':'' ?>>Gaming News</option>
<option value="reviews" <?= ($post['category'] ?? '')==='reviews'?'selected':'' ?>>Game Reviews</option>
<option value="tutorials" <?= ($post['category'] ?? '')==='tutorials'?'selected':'' ?>>Tutorials</option>
<option value="indie-games" <?= ($post['category'] ?? '')==='indie-games'?'selected':'' ?>>Indie Games</option>
</select></div>
<div class="form-group"><label>Status</label><select name="status">
<option value="draft" <?= ($post['status'] ?? 'draft')==='draft'?'selected':'' ?>>Draft</option>
<option value="published" <?= ($post['status'] ?? '')==='published'?'selected':'' ?>>Published</option>
</select></div>
</div>
<div class="form-group"><label>Excerpt</label><input type="text" name="excerpt" value="<?= htmlspecialchars($post['excerpt'] ?? '') ?>" placeholder="Short summary"></div>
<div class="form-group"><label>Tags (comma separated)</label><input type="text" name="tags" value="<?= htmlspecialchars($post['tags'] ?? '') ?>" placeholder="unity, tutorial"></div>
<div class="form-group"><label>Featured Image URL</label>
<input type="text" name="featured_image" id="imageUrl" value="<?= htmlspecialchars($post['featured_image'] ?? '') ?>" placeholder="https://example.com/image.jpg">
<div style="display:flex;gap:0.5rem;margin-top:0.5rem"><label class="btn btn-secondary btn-sm" style="cursor:pointer">Upload<input type="file" id="imageUpload" accept="image/*" style="display:none"></label><span id="uploadStatus" style="font-size:0.85rem;color:var(--muted)"></span></div></div>
<div class="form-group"><label>Content *</label>
<div class="toolbar">
<button type="button" onclick="execCmd('bold')" title="Bold"><b>B</b></button>
<button type="button" onclick="execCmd('italic')" title="Italic"><i>I</i></button>
<button type="button" onclick="execCmd('underline')"><u>U</u></button>
<button type="button" onclick="execCmd('strikeThrough')"><s>S</s></button>
<button type="button" onclick="execCmd('formatBlock','<h2>')">H2</button>
<button type="button" onclick="execCmd('formatBlock','<h3>')">H3</button>
<button type="button" onclick="execCmd('formatBlock','<p>')">P</button>
<button type="button" onclick="execCmd('insertUnorderedList')">List</button>
<button type="button" onclick="execCmd('insertOrderedList')">1. List</button>
<button type="button" onclick="insertLink()">Link</button>
<button type="button" onclick="insertImage()">Image</button>
<button type="button" onclick="insertCode()">Code</button>
<button type="button" onclick="execCmd('formatBlock','<blockquote>')">Quote</button>
<button type="button" onclick="toggleSource()">&lt;/&gt;</button>
<button type="button" onclick="document.getElementById('pasteModal').style.display='flex'">Paste HTML</button>
</div>
<div id="editor" contenteditable="true" style="padding:1rem;min-height:400px;background:var(--bg);border:1px solid var(--border);border-top:none;color:var(--text);outline:none;line-height:1.8"><?= $post ? $post['content'] : '<p>Start writing...</p>' ?></div>
<textarea name="content" id="contentField" style="display:none"><?= htmlspecialchars($post['content'] ?? '') ?></textarea>
</div>
<div class="card" style="margin-top:1.5rem"><h3 style="margin-bottom:1rem">SEO</h3>
<div class="form-group"><label>SEO Title</label><input type="text" name="seo_title" value="<?= htmlspecialchars($post['seo_title'] ?? '') ?>"></div>
<div class="form-group"><label>Meta Description</label><textarea name="meta_description" style="min-height:80px"><?= htmlspecialchars($post['meta_description'] ?? '') ?></textarea></div></div>
<div style="display:flex;gap:1rem;margin-top:1rem"><button type="submit" class="btn btn-primary">Save Post</button><a href="posts.php" class="btn btn-secondary">Cancel</a></div>
</form></div>

<div id="pasteModal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:999;align-items:center;justify-content:center">
<div style="background:var(--card);padding:2rem;border-radius:12px;max-width:700px;width:90%">
<h3 style="margin-bottom:1rem">Paste HTML</h3>
<p style="color:var(--muted);margin-bottom:1rem;font-size:0.9rem">Paste HTML from Google Docs, WordPress, or any source.</p>
<textarea id="htmlPasteArea" style="width:100%;min-height:200px;padding:1rem;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:monospace" placeholder="Paste HTML here..."></textarea>
<div style="display:flex;gap:1rem;margin-top:1rem"><button onclick="applyHtml()" class="btn btn-primary">Apply</button><button onclick="document.getElementById('pasteModal').style.display='none'" class="btn btn-secondary">Cancel</button></div></div></div>

<script>
const editor=document.getElementById('editor');const cf=document.getElementById('contentField');
editor.addEventListener('input',()=>{cf.value=editor.innerHTML});
function execCmd(c,v){document.execCommand(c,false,v||null);editor.focus()}
function insertLink(){const u=prompt('URL:');if(u)execCmd('createLink',u)}
function insertImage(){const u=prompt('Image URL:');if(u)execCmd('insertImage',u)}
function insertCode(){const c=prompt('Code:');if(c)document.execCommand('insertHTML',false,'<pre><code>'+c.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</code></pre><p></p>')}
function toggleSource(){if(editor.contentEditable==='true'){editor.textContent=editor.innerHTML;editor.contentEditable='false';editor.style.fontFamily='monospace'}else{editor.innerHTML=editor.textContent;editor.contentEditable='true';editor.style.fontFamily=''}}
function applyHtml(){const h=document.getElementById('htmlPasteArea').value;if(h){editor.innerHTML=h;cf.value=h}document.getElementById('pasteModal').style.display='none'}
document.getElementById('imageUpload').addEventListener('change',async function(e){const f=e.target.files[0];if(!f)return;document.getElementById('uploadStatus').textContent='Uploading...';const fd=new FormData();fd.append('action','upload_image');fd.append('image',f);try{const r=await fetch('process.php',{method:'POST',body:fd});const d=await r.json();if(d.url){document.getElementById('imageUrl').value=d.url;document.getElementById('uploadStatus').textContent='Done!'}else{document.getElementById('uploadStatus').textContent='Error: '+d.error}}catch(e){document.getElementById('uploadStatus').textContent='Failed'}});
document.querySelector('form').addEventListener('submit',function(){cf.value=editor.innerHTML});
</script>
<?php require_once __DIR__ . '/footer.php'; ?>