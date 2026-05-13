<?php
session_start();
require_once '../db.php';

// Guard — must be logged in
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit;
}

$pdo = getDB();
$msg = '';

// ── Add project ──────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add') {
    $title = trim($_POST['title'] ?? '');
    $desc  = trim($_POST['description'] ?? '');
    $tags  = trim($_POST['tags'] ?? '');

    if ($title !== '' && $desc !== '') {
        $stmt = $pdo->prepare('INSERT INTO projects (title, description, tags) VALUES (:t, :d, :g)');
        $stmt->execute([':t' => $title, ':d' => $desc, ':g' => $tags]);
        $msg = 'Project added successfully.';
    } else {
        $msg = 'Title and description are required.';
    }
}

// ── Delete project ───────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_project') {
    $id = (int)$_POST['id'];
    $pdo->prepare('DELETE FROM projects WHERE id = :id')->execute([':id' => $id]);
    $msg = 'Project deleted.';
}

// ── Delete contact ───────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'delete_contact') {
    $id = (int)$_POST['id'];
    $pdo->prepare('DELETE FROM contacts WHERE id = :id')->execute([':id' => $id]);
    $msg = 'Message deleted.';
}

// ── Fetch data ───────────────────────────────────────────
$projects = $pdo->query('SELECT * FROM projects ORDER BY id ASC')->fetchAll(PDO::FETCH_ASSOC);
$contacts = $pdo->query('SELECT * FROM contacts ORDER BY sent_at DESC')->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Admin Dashboard</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #008080; font-family: 'Courier New', monospace; font-size: 13px; padding: 16px; }

    .topbar {
      background: linear-gradient(90deg, #000080, #1084d0);
      color: #fff; padding: 8px 14px;
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
      border: 2px solid; border-color: #fff #000 #000 #fff;
    }
    .topbar h1 { font-size: 15px; }
    .logout {
      padding: 4px 14px; font-size: 12px; cursor: pointer;
      font-family: inherit; background: #c0c0c0; color: #000;
      border: 1px solid; border-color: #fff #000 #000 #fff;
      text-decoration: none;
    }
    .logout:hover { background: #dfdfdf; }

    .panel {
      background: #c0c0c0;
      border: 2px solid; border-color: #fff #000 #000 #fff;
      box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #868686;
      margin-bottom: 16px;
    }
    .panel-title {
      background: linear-gradient(90deg, #000080, #1084d0);
      color: #fff; font-size: 12px; font-weight: bold;
      padding: 3px 8px;
    }
    .panel-body { padding: 14px; }

    .msg { color: #007700; font-size: 12px; margin-bottom: 10px; font-weight: bold; }
    .msg.err { color: #c00; }

    label { display: block; font-size: 12px; margin-bottom: 3px; margin-top: 8px; }
    input[type=text], textarea {
      display: block; width: 100%; padding: 4px 6px;
      font-size: 12px; font-family: inherit;
      background: #fff; margin-bottom: 4px;
      border: 1px solid; border-color: #868686 #fff #fff #868686;
      box-shadow: inset 1px 1px 0 #000;
    }
    textarea { resize: vertical; min-height: 60px; }

    .btn {
      padding: 4px 16px; font-size: 12px; cursor: pointer;
      font-family: inherit; background: #c0c0c0; margin-top: 8px;
      border: 1px solid; border-color: #fff #000 #000 #fff;
      box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #868686;
    }
    .btn:active { border-color: #000 #fff #fff #000; }
    .btn-del { background: #c0c0c0; color: #c00; padding: 2px 10px; font-size: 11px; }

    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th {
      background: #000080; color: #fff;
      padding: 5px 8px; text-align: left; font-weight: bold;
    }
    td { padding: 5px 8px; border-bottom: 1px solid #aaa; vertical-align: top; }
    tr:nth-child(even) td { background: #d8d8d8; }
    tr:hover td { background: #c8d8ff; }

    .tag {
      display: inline-block; padding: 1px 6px; font-size: 10px;
      background: #e8e8e8; border: 1px solid #aaa; margin: 1px;
    }
  </style>
</head>
<body>

<div class="topbar">
  <h1>📁 Portfolio Admin Dashboard</h1>
  <a class="logout" href="logout.php">⏻ Log Out</a>
</div>

<?php if ($msg): ?>
  <p class="msg <?= strpos($msg, 'required') !== false ? 'err' : '' ?>"><?= htmlspecialchars($msg) ?></p>
<?php endif; ?>

<!-- ── Add Project ─────────────────────────────────── -->
<div class="panel">
  <div class="panel-title">➕ Add New Project</div>
  <div class="panel-body">
    <form method="POST">
      <input type="hidden" name="action" value="add" />
      <label>Title *</label>
      <input type="text" name="title" placeholder="Project title" />
      <label>Description *</label>
      <textarea name="description" placeholder="Short description…"></textarea>
      <label>Tags (comma-separated)</label>
      <input type="text" name="tags" placeholder="Python, AI, ML" />
      <button class="btn" type="submit">Add Project</button>
    </form>
  </div>
</div>

<!-- ── Projects Table ──────────────────────────────── -->
<div class="panel">
  <div class="panel-title">📁 Projects (<?= count($projects) ?>)</div>
  <div class="panel-body">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Description</th>
          <th>Tags</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($projects as $p): ?>
        <tr>
          <td><?= $p['id'] ?></td>
          <td><?= htmlspecialchars($p['title']) ?></td>
          <td><?= htmlspecialchars($p['description']) ?></td>
          <td>
            <?php foreach (explode(',', $p['tags']) as $tag): ?>
              <span class="tag"><?= htmlspecialchars(trim($tag)) ?></span>
            <?php endforeach; ?>
          </td>
          <td>
            <form method="POST" onsubmit="return confirm('Delete this project?')">
              <input type="hidden" name="action" value="delete_project" />
              <input type="hidden" name="id" value="<?= $p['id'] ?>" />
              <button class="btn btn-del" type="submit">✕ Delete</button>
            </form>
          </td>
        </tr>
        <?php endforeach; ?>
        <?php if (empty($projects)): ?>
          <tr><td colspan="5" style="text-align:center;color:#666;">No projects yet.</td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

<!-- ── Contacts Table ──────────────────────────────── -->
<div class="panel">
  <div class="panel-title">✉ Contact Messages (<?= count($contacts) ?>)</div>
  <div class="panel-body">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Email</th>
          <th>Message</th>
          <th>Date</th>
          <th>Delete</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($contacts as $c): ?>
        <tr>
          <td><?= $c['id'] ?></td>
          <td><?= htmlspecialchars($c['name']) ?></td>
          <td><?= htmlspecialchars($c['email']) ?></td>
          <td><?= htmlspecialchars($c['message']) ?></td>
          <td><?= $c['sent_at'] ?></td>
          <td>
            <form method="POST" onsubmit="return confirm('Delete this message?')">
              <input type="hidden" name="action" value="delete_contact" />
              <input type="hidden" name="id" value="<?= $c['id'] ?>" />
              <button class="btn btn-del" type="submit">✕ Delete</button>
            </form>
          </td>
        </tr>
        <?php endforeach; ?>
        <?php if (empty($contacts)): ?>
          <tr><td colspan="6" style="text-align:center;color:#666;">No messages yet.</td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</div>

</body>
</html>
