<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$host = 'sql303.infinityfree.com';
$db   = 'if0_41913449_portfolio';
$user = 'if0_41913449';
$pass = 'r25C9drlftp';

echo "<h3>Testing connection...</h3>";
echo "Host: $host <br>";
echo "DB: $db <br>";
echo "User: $user <br><br>";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    echo "<p style='color:green;font-size:20px;'>✔ Connected successfully!</p>";
} catch (Exception $e) {
    echo "<p style='color:red;'>✘ PDO failed: " . $e->getMessage() . "</p>";

    // Try mysqli as fallback
    echo "<p>Trying mysqli...</p>";
    $conn = mysqli_connect($host, $user, $pass, $db);
    if ($conn) {
        echo "<p style='color:green;'>✔ mysqli works! Use mysqli instead of PDO.</p>";
    } else {
        echo "<p style='color:red;'>✘ mysqli also failed: " . mysqli_connect_error() . "</p>";
    }
}
?>
