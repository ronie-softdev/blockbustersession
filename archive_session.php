<?php
require "db.php";

$id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

if ($id <= 0) {
  header("Location: sessions.php");
  exit;
}

$check = $conn->prepare("SELECT is_current FROM sessions WHERE id = ?");
$check->bind_param("i", $id);
$check->execute();
$row = $check->get_result()->fetch_assoc();

if (!$row) {
  header("Location: sessions.php");
  exit;
}

if ((int)$row["is_current"] === 1) {
  echo "<script>alert('Cannot archive the current session directly. Open another session first.'); window.location='sessions.php';</script>";
  exit;
}

$stmt = $conn->prepare("
  UPDATE sessions
  SET status = 'archived',
      booking_status = 'closed',
      is_current = 0
  WHERE id = ?
");

$stmt->bind_param("i", $id);
$stmt->execute();

header("Location: sessions.php");
exit;
?>