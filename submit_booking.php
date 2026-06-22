<?php
header("Content-Type: application/json");
require "db.php";

$firstName = $_POST["firstName"] ?? "";
$lastName  = $_POST["lastName"] ?? "";
$company   = $_POST["company"] ?? "";
$email     = $_POST["email"] ?? "";
$phone     = $_POST["phone"] ?? "";
$slot      = $_POST["slot"] ?? "";
$topics    = $_POST["topics"] ?? "";

if (!$firstName || !$lastName || !$company || !$email || !$phone || !$slot || !$topics) {
  echo json_encode(["success" => false, "message" => "Please fill in all required fields."]);
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
  echo json_encode(["success" => false, "message" => "Submit failed: " . $stmt->error]);
}
?>