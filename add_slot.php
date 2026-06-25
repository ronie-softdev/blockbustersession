<?php
header("Content-Type: application/json");
require "db.php";

$label = trim($_POST["label"] ?? "");
$capacity = isset($_POST["capacity"]) ? (int)$_POST["capacity"] : 1;

if (!$label) {
  echo json_encode(["success" => false, "message" => "Slot label is required."]);
  exit;
}

$currentSession = $conn->query("
  SELECT id 
  FROM sessions 
  WHERE is_current = 1 
  LIMIT 1
");

if (!$currentSession || $currentSession->num_rows === 0) {
  echo json_encode([
    "success" => false,
    "message" => "No current active session found."
  ]);
  exit;
}

$session = $currentSession->fetch_assoc();
$sessionId = (int)$session["id"];

$stmt = $conn->prepare("
  INSERT INTO slots (session_id, label, capacity) 
  VALUES (?, ?, ?)
");

$stmt->bind_param("isi", $sessionId, $label, $capacity);

if ($stmt->execute()) {
  echo json_encode([
    "success" => true,
    "message" => "Slot added successfully.",
    "session_id" => $sessionId
  ]);
} else {
  echo json_encode([
    "success" => false,
    "message" => "Failed to add slot: " . $stmt->error
  ]);
}

$stmt->close();
$conn->close();
?>