<?php
session_start();
include("../config/db.php");

$email = $_POST['email'];
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT * FROM users WHERE email=? AND is_active=1");
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();

if (!$user || !password_verify($password, $user['password'])) {
    echo "Invalid credentials";
    exit();
}

// CHECK EMAIL VERIFIED
if (!$user['email_verified']) {
    echo "Please verify your email first!";
    exit();
}

// CHECK APPROVAL
if (!$user['is_approved']) {
    echo "Waiting for admin approval.";
    exit();
}

$_SESSION['user_id'] = $user['id'];
$_SESSION['role'] = $user['role'] ?? 'member';



echo "success";
?>
