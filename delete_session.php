<?php
require "db.php";

$id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

if ($id <= 0) {
    header("Location: sessions.php");
    exit;
}

$checkCurrent = $conn->prepare("SELECT is_current FROM sessions WHERE id = ?");
$checkCurrent->bind_param("i", $id);
$checkCurrent->execute();
$currentRow = $checkCurrent->get_result()->fetch_assoc();

if (!$currentRow) {
    header("Location: sessions.php");
    exit;
}

if ((int)$currentRow["is_current"] === 1) {
    echo "<script>
            alert('Cannot delete the current active session. Open another session first.');
            window.location='sessions.php';
          </script>";
    exit;
}

$checkSlots = $conn->prepare("SELECT COUNT(*) AS total FROM slots WHERE session_id = ?");
$checkSlots->bind_param("i", $id);
$checkSlots->execute();
$slotCount = (int)$checkSlots->get_result()->fetch_assoc()["total"];

if ($slotCount > 0) {
    echo "<script>
            alert('Cannot delete this session because it has slots. Archive it instead.');
            window.location='sessions.php';
          </script>";
    exit;
}

$stmt = $conn->prepare("DELETE FROM sessions WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();

header("Location: sessions.php");
exit;
?>