<?php
header("Content-Type: application/json");
require "db.php";

$id = $_POST["id"] ?? "";
$label = trim($_POST["label"] ?? "");
$capacity = isset($_POST["capacity"]) ? (int) $_POST["capacity"] : 1;

if (!$id || !$label) {
  echo json_encode(["success" => false, "message" => "Slot id and label are required."]);
  exit;
}

$stmt = $conn->prepare("UPDATE slots SET label = ?, capacity = ? WHERE id = ?");
$stmt->bind_param("sii", $label, $capacity, $id);

$success = $stmt->execute();

echo json_encode([
  "success" => $success,
  "message" => $success ? "Slot updated." : "Failed to update slot: " . $stmt->error
]);
?>