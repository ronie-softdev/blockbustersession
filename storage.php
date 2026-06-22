<?php
header("Content-Type: application/json");
require "db.php";

$action = $_POST["action"] ?? "";
$key = $_POST["key"] ?? "";

if ($action === "" || $key === "") {
  echo json_encode([
    "success" => false,
    "message" => "Missing action or key"
  ]);
  exit;
}

if ($action === "get") {
  $stmt = $conn->prepare("SELECT data_value FROM page_storage WHERE data_key = ?");
  $stmt->bind_param("s", $key);
  $stmt->execute();

  $result = $stmt->get_result();

  if ($row = $result->fetch_assoc()) {
    echo json_encode([
      "success" => true,
      "value" => $row["data_value"]
    ]);
  } else {
    echo json_encode([
      "success" => true,
      "value" => null
    ]);
  }

  exit;
}

if ($action === "set") {
  $value = $_POST["value"] ?? "";

  $stmt = $conn->prepare("
    INSERT INTO page_storage (data_key, data_value)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE data_value = VALUES(data_value)
  ");

  $stmt->bind_param("ss", $key, $value);
  $success = $stmt->execute();

  echo json_encode([
    "success" => $success,
    "message" => $success ? "Saved" : $stmt->error
  ]);
  exit;
}

if ($action === "delete") {
  $stmt = $conn->prepare("DELETE FROM page_storage WHERE data_key = ?");
  $stmt->bind_param("s", $key);
  $success = $stmt->execute();

  echo json_encode([
    "success" => $success
  ]);
  exit;
}

echo json_encode([
  "success" => false,
  "message" => "Invalid action"
]);
?>