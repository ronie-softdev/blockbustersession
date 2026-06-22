<?php
header("Content-Type: application/json");
require "db.php";

$label = $_POST["label"] ?? "";
$capacity = $_POST["capacity"] ?? 1;

if (!$label) {
  echo json_encode(["success" => false, "message" => "Slot label is required."]);
  exit;
}

$stmt = $conn->prepare("INSERT INTO slots (label, capacity) VALUES (?, ?)");
$stmt->bind_param("si", $label, $capacity);

if ($stmt->execute()) {
  echo json_encode(["success" => true, "message" => "Slot added successfully."]);
} else {
  echo json_encode(["success" => false, "message" => "Failed to add slot: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>