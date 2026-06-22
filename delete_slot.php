<?php
header("Content-Type: application/json");
require "db.php";

$id = $_POST["id"] ?? "";

$stmt = $conn->prepare("DELETE FROM slots WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
  echo json_encode(["success" => true, "message" => "Slot deleted."]);
} else {
  echo json_encode(["success" => false, "message" => "Failed to delete slot."]);
}
?>