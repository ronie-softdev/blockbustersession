<?php
header("Content-Type: application/json");
include "db.php";

$result = $conn->query("SELECT * FROM bookings ORDER BY id DESC");

$bookings = [];

while($row = $result->fetch_assoc()){
    $bookings[] = $row;
}

echo json_encode([
    "success" => true,
    "bookings" => $bookings
]);
?>