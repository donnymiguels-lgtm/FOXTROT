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

include("../../backend/config/db.php");

$event_id = $_GET['event_id'];

// Get event info
$event = $conn->query("SELECT * FROM events WHERE id=$event_id")->fetch_assoc();

// Get attendees
$attendees = $conn->query("
SELECT users.name, users.email, attendance.status
FROM attendance
JOIN users ON attendance.user_id = users.id
WHERE attendance.event_id = $event_id
");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Attendance</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

<div class="container mt-5">
    <div class="card p-4">

        <h3>Attendance for: <?php echo $event['title']; ?></h3>

        <table class="table table-bordered mt-3">
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
            </tr>

            <?php while($row = $attendees->fetch_assoc()): ?>
                <tr>
                    <td><?php echo $row['name']; ?></td>
                    <td><?php echo $row['email']; ?></td>
                    <td>
                        <?php if ($row['status'] == 'present'): ?>
                            <span class="badge bg-success">Present</span>
                        <?php else: ?>
                            <span class="badge bg-secondary">Absent</span>
                        <?php endif; ?>
                    </td>
                </tr>
            <?php endwhile; ?>
        </table>

        <a href="dashboard.php" class="btn btn-secondary">Back</a>

    </div>
</div>

</body>
</html>
