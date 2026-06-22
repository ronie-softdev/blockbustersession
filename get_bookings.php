<?php
header("Content-Type: application/json");
require "db.php";

$result = $conn->query("SELECT * FROM bookings ORDER BY id DESC");

$bookings = [];

while ($row = $result->fetch_assoc()) {
  $bookings[] = $row;
}

echo json_encode($bookings);
?>