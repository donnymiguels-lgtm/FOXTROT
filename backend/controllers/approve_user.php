<?php
include("../config/db.php");

$id = $_GET['id'];

$conn->query("UPDATE users SET is_approved=1 WHERE id=$id");

header("Location: ../../frontend/pages/manage_users.php");
?>
