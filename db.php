<?php
define('DB_HOST', 'sql303.infinityfree.com');
define('DB_NAME', 'if0_41913449_portfolio');
define('DB_USER', 'if0_41913449');
define('DB_PASS', 'r25C9drlftp');

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }
    return $pdo;
}
