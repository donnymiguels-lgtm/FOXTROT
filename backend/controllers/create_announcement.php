<?php
session_start();
include("../config/db.php");

$title = $_POST['title'];
$content = $_POST['content'];

$stmt = $conn->prepare("
INSERT INTO announcements (title, content, created_by)
VALUES (?, ?, ?)
");

$stmt->bind_param("ssi", $title, $content, $_SESSION['user_id']);
$stmt->execute();

echo "Announcement posted!";
?>
