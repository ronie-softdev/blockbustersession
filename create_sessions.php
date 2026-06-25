<?php
header("Content-Type: application/json");
require "db.php";

$title = trim($_POST["title"] ?? "");
$banner = $_POST["banner"] ?? "";
$description = $_POST["description"] ?? "";

if (!$title) {
  echo json_encode([
    "success" => false,
    "message" => "Session title is required."
  ]);
  exit;
}

$conn->begin_transaction();

try {
  // Archive old current session
  $conn->query("
    UPDATE sessions
    SET status = 'archived',
        booking_status = 'closed',
        is_current = 0
    WHERE is_current = 1
  ");

  // Create new active session
  $stmt = $conn->prepare("
    INSERT INTO sessions 
    (title, banner, description, status, booking_status, is_current)
    VALUES (?, ?, ?, 'active', 'open', 1)
  ");

  $stmt->bind_param("sss", $title, $banner, $description);
  $stmt->execute();

  $newSessionId = $stmt->insert_id;

  $conn->commit();

  echo json_encode([
    "success" => true,
    "message" => "New session created successfully.",
    "session_id" => $newSessionId
  ]);

} catch (Exception $e) {
  $conn->rollback();

  echo json_encode([
    "success" => false,
    "message" => "Failed to create session: " . $e->getMessage()
  ]);
}
?>