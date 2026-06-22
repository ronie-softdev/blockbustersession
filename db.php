<?php
header("Content-Type: application/json");

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "vap_bookings";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
  echo json_encode([
    "success" => false,
    "message" => "Database connection failed: " . $conn->connect_error
  ]);
  exit;
}

$conn->set_charset("utf8mb4");
?>