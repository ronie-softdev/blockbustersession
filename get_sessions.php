<?php
header("Content-Type: application/json");
require "db.php";

$sql = "
  SELECT 
    id,
    title,
    status,
    booking_status,
    is_current,
    created_at
  FROM sessions
  ORDER BY is_current DESC, id DESC
";

$result = $conn->query($sql);

if (!$result) {
  echo json_encode([
    "success" => false,
    "message" => "Failed to load sessions: " . $conn->error
  ]);
  exit;
}

$sessions = [];

while ($row = $result->fetch_assoc()) {
  $sessions[] = $row;
}

echo json_encode([
  "success" => true,
  "sessions" => $sessions
]);
?>