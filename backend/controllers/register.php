<?php
include("../config/db.php");

// GET FORM DATA
$name = $_POST['name'];
$email = $_POST['email'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);

// GENERATE TOKEN
$token = bin2hex(random_bytes(16));

// CHECK IF EMAIL EXISTS
$check = $conn->prepare("SELECT id FROM users WHERE email=?");
$check->bind_param("s", $email);
$check->execute();
$result = $check->get_result();

if ($result->num_rows > 0) {
    echo "Email already exists!";
    exit();
}

// FILE UPLOAD (SAFE VERSION)
if (isset($_FILES['proof']) && $_FILES['proof']['error'] === 0) {

    // CREATE UNIQUE FILE NAME
    $proof = uniqid() . "_" . basename($_FILES['proof']['name']);
    $tmp = $_FILES['proof']['tmp_name'];

    // CORRECT PATH
    $uploadPath = __DIR__ . "/../../uploads/" . $proof;

    // MOVE FILE
    if (!move_uploaded_file($tmp, $uploadPath)) {
        echo "File upload failed!";
        exit();
    }

} else {
    echo "Please upload a proof file!";
    exit();
}

// INSERT USER
$stmt = $conn->prepare("
INSERT INTO users (name, email, password, verification_token, proof_file)
VALUES (?, ?, ?, ?, ?)
");

if (!$stmt) {
    die("SQL Error: " . $conn->error);
}

$stmt->bind_param("sssss", $name, $email, $password, $token, $proof);

if ($stmt->execute()) {

    // VERIFICATION LINK
    $link = "http://localhost/org_system/backend/controllers/verify.php?token=$token";

    echo "Registered successfully!<br>";
    echo "Click to verify your email:<br>";
    echo "<a href='$link'>$link</a>";

} else {
    echo "Registration failed!";
}
?>
