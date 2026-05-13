<?php
session_start();
session_destroy();

// Clear remember-me cookie
setcookie('admin_remember', '', time() - 3600, '/');

header('Location: login.php');
exit;
