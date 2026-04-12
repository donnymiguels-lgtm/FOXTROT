<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit();
}

include("../../backend/config/db.php");

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];

// EVENTS + ATTENDANCE STATUS
$events = $conn->query("
SELECT e.*, a.status 
FROM events e
LEFT JOIN attendance a 
ON e.id = a.event_id AND a.user_id = $user_id
ORDER BY e.event_date DESC
");

// ANNOUNCEMENTS
$announcements = $conn->query("
SELECT * FROM announcements ORDER BY created_at DESC
");

// STATS
$totalUsers = $conn->query("SELECT COUNT(*) as count FROM users")->fetch_assoc()['count'];
$totalEvents = $conn->query("SELECT COUNT(*) as count FROM events")->fetch_assoc()['count'];
?>

<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

<div class="container mt-5">
    <div class="card p-4 shadow">

        <!-- HEADER -->
        <h2>Welcome to Dashboard</h2>
        <p>You are logged in!</p>

        <!-- STATS -->
        <div class="row mt-3">
            <div class="col-md-6">
                <div class="card p-3 text-center bg-primary text-white">
                    <h4><?php echo $totalUsers; ?></h4>
                    <p>Total Users</p>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card p-3 text-center bg-success text-white">
                    <h4><?php echo $totalEvents; ?></h4>
                    <p>Total Events</p>
                </div>
            </div>
        </div>

        <!-- ROLE -->
        <h5 class="mt-4">Role: <?php echo $role; ?></h5>

        <?php if ($role == 'admin'): ?>
            <div class="alert alert-danger">You are an ADMIN</div>
        <?php elseif ($role == 'officer'): ?>
            <div class="alert alert-warning">You are an OFFICER</div>
        <?php else: ?>
            <div class="alert alert-primary">You are a MEMBER</div>
        <?php endif; ?>

        <!-- ACTION BUTTONS -->
        <?php if ($role == 'admin' || $role == 'officer'): ?>
            <a href="create_event.php" class="btn btn-success mb-2">Create Event</a>
            <a href="create_announcement.php" class="btn btn-primary mb-2">Create Announcement</a>
            
        <?php endif; ?>
        <?php if ($role == 'admin'): ?>
            <a href="manage_users.php" class="btn btn-dark mb-2">Manage Users</a>
        <?php endif; ?>


        <!-- ANNOUNCEMENTS -->
        <h4 class="mt-4">Announcements</h4>

        <?php while($a = $announcements->fetch_assoc()): ?>
            <div class="card mb-2 p-3">
                <h5><?php echo $a['title']; ?></h5>
                <p><?php echo $a['content']; ?></p>
                <small class="text-muted"><?php echo $a['created_at']; ?></small>
            </div>
        <?php endwhile; ?>

        <!-- EVENTS -->
        <h4 class="mt-4">Events</h4>

        <table class="table table-bordered table-hover">
            <tr class="table-dark">
                <th>Title</th>
                <th>Description</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
            </tr>

            <?php while($row = $events->fetch_assoc()): ?>
                <tr>
                    <td><?php echo $row['title']; ?></td>
                    <td><?php echo $row['description']; ?></td>
                    <td><?php echo $row['event_date']; ?></td>

                    <!-- STATUS -->
                    <td>
                        <?php if ($row['status'] == 'present'): ?>
                            <span class="badge bg-success">Present</span>
                        <?php else: ?>
                            <span class="badge bg-secondary">Not Attended</span>
                        <?php endif; ?>
                    </td>

                    <!-- ACTION -->
                    <td>

                        <!-- ATTEND BUTTON -->
                        <?php if ($row['status'] == 'present'): ?>
                            <button class="btn btn-success btn-sm" disabled>
                                Attended
                            </button>
                        <?php else: ?>
                            <button onclick="attend(<?php echo $row['id']; ?>)" class="btn btn-primary btn-sm">
                                Attend
                            </button>
                        <?php endif; ?>

                        <!-- VIEW ATTENDANCE -->
                        <?php if ($role == 'admin' || $role == 'officer'): ?>
                            <a href="view_attendance.php?event_id=<?php echo $row['id']; ?>" 
                               class="btn btn-dark btn-sm mt-1">
                                View
                            </a>
                        <?php endif; ?>

                    </td>
                </tr>
            <?php endwhile; ?>
        </table>

        <!-- LOGOUT -->
        <a href="../../backend/controllers/logout.php" class="btn btn-danger mt-3">Logout</a>

    </div>
</div>

<!-- SCRIPT -->
<script>
function attend(eventId) {
    let formData = new FormData();
    formData.append("event_id", eventId);

    fetch("../../backend/controllers/mark_attendance.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.text())
    .then(data => {
        alert(data);
        location.reload();
    });
}
</script>

</body>
</html>
