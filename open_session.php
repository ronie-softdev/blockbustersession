<?php
require "db.php";

$id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

if ($id <= 0) {
  header("Location: sessions.php");
  exit;
}

$conn->begin_transaction();

try {
  $conn->query("
    UPDATE sessions 
    SET is_current = 0,
        status = 'archived',
        booking_status = 'closed'
  ");

  $stmt = $conn->prepare("
    UPDATE sessions
    SET is_current = 1,
        status = 'active',
        booking_status = 'open'
    WHERE id = ?
  ");

  $stmt->bind_param("i", $id);
  $stmt->execute();

  $conn->commit();

} catch (Exception $e) {
  $conn->rollback();
}

header("Location: sessions.php");
exit;
?>