<?php
header('Content-Type: application/json');
require_once 'db.php';

try {
    $stmt = getDB()->query('SELECT id, title, description, tags FROM projects ORDER BY id ASC');
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(['error' => 'Could not load projects.']);
}
