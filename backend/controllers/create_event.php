<?php
session_start();
include("../config/db.php");

if ($_SESSION['role'] != 'admin' && $_SESSION['role'] != 'officer') {
    die("Unauthorized");
}

$title = $_POST['title'];
$desc = $_POST['description'];
$date = $_POST['date'];

$stmt = $conn->prepare("INSERT INTO events (title, description, event_date, created_by) VALUES (?,?,?,?)");
$stmt->bind_param("sssi", $title, $desc, $date, $_SESSION['user_id']);

$stmt->execute();

echo "Event created!";
?>
