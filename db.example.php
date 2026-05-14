<?php
// Copy this file to db.php and fill in your own credentials
// db.php is gitignored and should never be committed

define('DB_HOST', 'your_mysql_host');       // e.g. sql303.infinityfree.com
define('DB_NAME', 'your_database_name');    // e.g. if0_12345678_portfolio
define('DB_USER', 'your_database_user');    // e.g. if0_12345678
define('DB_PASS', 'your_database_password');

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
