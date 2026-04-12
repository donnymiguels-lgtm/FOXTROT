<?php
session_start();
include("../config/db.php");

$user_id = $_SESSION['user_id'];
$event_id = $_POST['event_id'];

$stmt = $conn->prepare("
INSERT INTO attendance (user_id, event_id, status)
VALUES (?, ?, 'present')
ON DUPLICATE KEY UPDATE status='present'
");

$stmt->bind_param("ii", $user_id, $event_id);
$stmt->execute();

// LOG (AUDIT)
$conn->query("
INSERT INTO logs (user_id, action)
VALUES ($user_id, 'Marked attendance for event $event_id')
");

echo "Attendance recorded!";
?>
