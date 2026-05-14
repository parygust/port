<?php
header('Content-Type: application/json');
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
    exit;
}

$data    = json_decode(file_get_contents('php://input'), true);
$name    = trim($data['name']    ?? '');
$email   = trim($data['email']   ?? '');
$message = trim($data['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    echo json_encode(['success' => false, 'error' => 'All fields are required.']);
    exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Invalid email address.']);
    exit;
}

try {
    $pdo  = getDB();
    $stmt = $pdo->prepare('INSERT INTO contacts (name, email, message, sent_at) VALUES (:name, :email, :message, NOW())');
    $stmt->execute([':name' => $name, ':email' => $email, ':message' => $message]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error.']);
}
