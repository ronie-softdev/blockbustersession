<?php
header("Content-Type: application/json");
require "db.php";

$result = $conn->query("
  SELECT 
    id,
    first_name,
    last_name,
    company_name,
    email,
    phone,
    slot_datetime,
    topics,
    created_at
  FROM bookings
  ORDER BY created_at DESC
");

if (!$result) {
  echo json_encode([
    "success" => false,
    "message" => $conn->error,
    "bookings" => []
  ]);
  exit;
}

$bookings = [];

while ($row = $result->fetch_assoc()) {
  $bookings[] = $row;
}

echo json_encode([
  "success" => true,
  "bookings" => $bookings
]);
?>