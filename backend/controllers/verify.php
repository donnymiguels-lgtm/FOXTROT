<?php
include("../config/db.php");

$token = $_GET['token'];

$stmt = $conn->prepare("
UPDATE users 
SET email_verified=1, verification_token=NULL 
WHERE verification_token=?
");

$stmt->bind_param("s", $token);
$stmt->execute();

echo "Email verified! You can now wait for admin approval.";
?>
