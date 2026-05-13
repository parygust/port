<?php
session_start();

// Change these credentials before going live
define('ADMIN_USER', 'admin');
define('ADMIN_PASS', 'admin123');

// Already logged in — go straight to dashboard
if (isset($_SESSION['admin_logged_in'])) {
    header('Location: dashboard.php');
    exit;
}

// Check remember-me cookie
if (!isset($_SESSION['admin_logged_in']) && isset($_COOKIE['admin_remember'])) {
    if ($_COOKIE['admin_remember'] === hash('sha256', ADMIN_USER . ADMIN_PASS)) {
        $_SESSION['admin_logged_in'] = true;
        header('Location: dashboard.php');
        exit;
    }
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = trim($_POST['username'] ?? '');
    $pass = trim($_POST['password'] ?? '');

    if ($user === ADMIN_USER && $pass === ADMIN_PASS) {
        $_SESSION['admin_logged_in'] = true;

        // Set remember-me cookie for 7 days if checkbox was ticked
        if (!empty($_POST['remember'])) {
            setcookie(
                'admin_remember',
                hash('sha256', ADMIN_USER . ADMIN_PASS),
                time() + (7 * 24 * 60 * 60),
                '/',
                '',
                false,
                true   // httponly
            );
        }

        header('Location: dashboard.php');
        exit;
    } else {
        $error = 'Invalid username or password.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Admin Login</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #008080;
      font-family: 'Courier New', monospace;
      display: flex; align-items: center; justify-content: center;
      height: 100vh;
    }
    .box {
      background: #c0c0c0;
      border: 2px solid;
      border-color: #fff #000 #000 #fff;
      box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #868686, 4px 4px 8px rgba(0,0,0,.4);
      width: 320px;
    }
    .title-bar {
      background: linear-gradient(90deg, #000080, #1084d0);
      color: #fff; font-size: 13px; font-weight: bold;
      padding: 4px 8px; display: flex; align-items: center; gap: 6px;
    }
    .body { padding: 20px; }
    h2 { font-size: 14px; margin-bottom: 16px; }
    label { display: block; font-size: 12px; margin-bottom: 3px; }
    input[type=text], input[type=password] {
      display: block; width: 100%; padding: 4px 6px;
      font-size: 12px; font-family: inherit;
      background: #fff; margin-bottom: 12px;
      border: 1px solid; border-color: #868686 #fff #fff #868686;
      box-shadow: inset 1px 1px 0 #000;
    }
    .remember { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-bottom: 14px; }
    .btn {
      padding: 5px 20px; font-size: 12px; cursor: pointer;
      font-family: inherit; background: #c0c0c0;
      border: 1px solid; border-color: #fff #000 #000 #fff;
      box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #868686;
    }
    .btn:active { border-color: #000 #fff #fff #000; }
    .error { color: #c00; font-size: 11px; margin-bottom: 10px; }
  </style>
</head>
<body>
<div class="box">
  <div class="title-bar">🔐 Admin Login</div>
  <div class="body">
    <h2>Portfolio Admin Panel</h2>
    <?php if ($error): ?>
      <p class="error">⚠ <?= htmlspecialchars($error) ?></p>
    <?php endif; ?>
    <form method="POST">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" autocomplete="off" />
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" />
      <div class="remember">
        <input type="checkbox" id="remember" name="remember" value="1" />
        <label for="remember" style="margin:0;">Remember me for 7 days</label>
      </div>
      <button class="btn" type="submit">Log In</button>
    </form>
  </div>
</div>
</body>
</html>
