<?php
header("Content-Type: application/json");
require "db.php";

$first = trim($_POST["first_name"] ?? "");
$last = trim($_POST["last_name"] ?? "");
$company = trim($_POST["company_name"] ?? "");
$email = trim($_POST["email"] ?? "");
$phone = trim($_POST["phone"] ?? "");
$slot = trim($_POST["slot_datetime"] ?? "");
$topics = trim($_POST["topics"] ?? "");

if ($first === "" || $last === "" || $company === "" || $email === "" || $phone === "" || $slot === "" || $topics === "") {
  echo json_encode([
    "success" => false,
    "message" => "Please complete all fields."
  ]);
  exit;
}

$stmt = $conn->prepare("
  INSERT INTO bookings 
  (first_name, last_name, company_name, email, phone, slot_datetime, topics)
  VALUES (?, ?, ?, ?, ?, ?, ?)
");

if (!$stmt) {
  echo json_encode([
    "success" => false,
    "message" => "Prepare error: " . $conn->error
  ]);
  exit;
}

$stmt->bind_param("sssssss", $first, $last, $company, $email, $phone, $slot, $topics);

if ($stmt->execute()) {
  echo json_encode([
    "success" => true,
    "message" => "Booking saved successfully."
  ]);
} else {
  echo json_encode([
    "success" => false,
    "message" => "Execute error: " . $stmt->error
  ]);
}
?>