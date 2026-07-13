<?php
require "db.php";

$result = $conn->query("SELECT * FROM sessions ORDER BY id DESC");
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Session Management</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<div class="admin-bar">
    <div class="admin-label">
        <div class="admin-dot"></div>
        SESSION MANAGEMENT
    </div>

    <div style="display:flex;gap:10px;">
        <a href="admin/create-session.php" class="btn btn-edit">
            + Create New Session
        </a>

        <a href="dashboard.php" class="btn btn-reset">
            Back to Dashboard
        </a>

        <a href="logout.php" class="btn btn-logout">
            Logout
        </a>
    </div>
</div>

<div class="cards-wrap">

<div class="card">

<div class="card-title">
ALL SESSIONS
</div>

<?php while($row = $result->fetch_assoc()): ?>

<div class="reg-item" style="margin-bottom:18px;">

    <div class="reg-header">

        <div>

            <div class="reg-name">
                <?php echo htmlspecialchars($row["title"]); ?>
            </div>

            <div class="reg-meta">

                Status :
                <strong><?php echo ucfirst($row["status"]); ?></strong>

                &nbsp; | &nbsp;

                Booking :
                <strong><?php echo ucfirst($row["booking_status"]); ?></strong>

                &nbsp; | &nbsp;

                Current :
                <strong>
                    <?php echo $row["is_current"] ? "YES" : "NO"; ?>
                </strong>

            </div>

        </div>

        <div style="display:flex;gap:8px;">

            <?php if(!$row["is_current"]): ?>

            <button
                class="btn btn-edit"
                onclick="openSession(<?php echo $row['id']; ?>)">
                Open
            </button>

            <?php endif; ?>

            <button
                class="btn btn-reset"
                onclick="archiveSession(<?php echo $row['id']; ?>)">
                Archive
            </button>

            <button
                class="btn btn-danger"
                onclick="deleteSession(<?php echo $row['id']; ?>)">
                Delete
            </button>

        </div>

    </div>

</div>

<?php endwhile; ?>

</div>

</div>

<script>

function openSession(id){

    if(confirm("Open this session?")){

        location.href="open_session.php?id="+id;

    }

}

function archiveSession(id){

    if(confirm("Archive this session?")){

        location.href="archive_session.php?id="+id;

    }

}

function deleteSession(id){

    if(confirm("Delete this session?")){

        location.href="delete_session.php?id="+id;

    }

}

</script>

</body>
</html>