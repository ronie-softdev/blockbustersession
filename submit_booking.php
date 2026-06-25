<?php
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set("display_errors", 0);

require "db.php";

$firstName = trim($_POST["firstName"] ?? "");
$lastName  = trim($_POST["lastName"] ?? "");
$company   = trim($_POST["company"] ?? "");
$email     = trim($_POST["email"] ?? "");
$phone     = trim($_POST["phone"] ?? "");
$slot      = trim($_POST["slot"] ?? "");
$topics    = trim($_POST["topics"] ?? "");

if (!$firstName || !$lastName || !$company || !$email || !$phone || !$slot || !$topics) {
  echo json_encode(["success" => false, "message" => "Please fill in all required fields."]);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(["success" => false, "message" => "Please enter a valid email address."]);
  exit;
}

if (!preg_match('/^[0-9+\-\s()]{7,20}$/', $phone)) {
  echo json_encode(["success" => false, "message" => "Please enter a valid phone number."]);
  exit;
}

$slotStmt = $conn->prepare("
  SELECT s.id, s.capacity
  FROM slots s
  INNER JOIN sessions se ON s.session_id = se.id
  WHERE s.label = ?
  AND se.is_current = 1
  LIMIT 1
");

$slotStmt->bind_param("s", $slot);
$slotStmt->execute();
$slotResult = $slotStmt->get_result();

if ($slotResult->num_rows === 0) {
  echo json_encode(["success" => false, "message" => "Invalid slot selected."]);
  exit;
}

$slotData = $slotResult->fetch_assoc();
$slotId = (int)$slotData["id"];
$capacity = (int)$slotData["capacity"];

$countStmt = $conn->prepare("
  SELECT COUNT(*) AS total 
  FROM bookings 
  WHERE slot_datetime = ?
");

$countStmt->bind_param("s", $slot);
$countStmt->execute();
$countResult = $countStmt->get_result()->fetch_assoc();
$booked = (int)$countResult["total"];

if ($booked >= $capacity) {
  echo json_encode(["success" => false, "message" => "Sorry, this slot is already FULL."]);
  exit;
}

$stmt = $conn->prepare("
  INSERT INTO bookings 
  (first_name, last_name, company_name, email, phone, slot_datetime, topics)
  VALUES (?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param("sssssss", $firstName, $lastName, $company, $email, $phone, $slot, $topics);

if ($stmt->execute()) {
  echo json_encode(["success" => true, "message" => "Your session has been booked!"]);
} else {
  echo json_encode(["success" => false, "message" => "Booking failed: " . $stmt->error]);
}
?>