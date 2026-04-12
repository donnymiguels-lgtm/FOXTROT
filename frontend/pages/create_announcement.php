<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

if ($_SESSION['role'] != 'admin' && $_SESSION['role'] != 'officer') {
    echo "Unauthorized";
    exit();
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Create Announcement</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

<div class="container mt-5">
    <div class="card p-4">
        <h3>Create Announcement</h3>

        <form id="announcementForm">
            <input type="text" name="title" class="form-control mb-2" placeholder="Title" required>
            <textarea name="content" class="form-control mb-2" placeholder="Content" required></textarea>

            <button class="btn btn-primary">Post</button>
        </form>

        <a href="dashboard.php" class="btn btn-secondary mt-2">Back</a>
    </div>
</div>

<script>
document.getElementById("announcementForm").onsubmit = async (e) => {
    e.preventDefault();

    let formData = new FormData(e.target);

    let res = await fetch("../../backend/controllers/create_announcement.php", {
        method: "POST",
        body: formData
    });

    let text = await res.text();
    alert(text);
};
</script>

</body>
</html>
