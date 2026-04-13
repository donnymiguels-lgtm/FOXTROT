<?php
session_start();

if (!isset($_SESSION['user_id']) || !isset($_SESSION['role'])) {
    die("Unauthorized - Please login again");
}

if ($_SESSION['role'] != 'admin') {
    die("Unauthorized");
}



include("../../backend/config/db.php");

$users = $conn->query("SELECT * FROM users WHERE is_approved=0");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Manage Users</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<div class="container mt-5">
    <h3>Pending Users</h3>

    <table class="table">
        <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Proof</th>
            <th>Action</th>
        </tr>

        <?php while($u = $users->fetch_assoc()): ?>
            <tr>
                <td><?php echo $u['name']; ?></td>
                <td><?php echo $u['email']; ?></td>
                <td>
                    <a href="../../uploads/<?php echo $u['proof_file']; ?>" target="_blank">
                        View File
                    </a>
                </td>
                <td>
                    <a href="../../backend/controllers/approve_user.php?id=<?php echo $u['id']; ?>" 
                       class="btn btn-success btn-sm">
                        Approve
                    </a>
                </td>
            </tr>
        <?php endwhile; ?>
    </table>
</div>

</body>
</html>
