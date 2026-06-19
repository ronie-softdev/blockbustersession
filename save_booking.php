<?php
header("Content-Type: application/json");
include "db.php";

$first_name = $_POST["first_name"] ?? "";
$last_name = $_POST["last_name"] ?? "";
$company_name = $_POST["company_name"] ?? "";
$email = $_POST["email"] ?? "";
$phone = $_POST["phone"] ?? "";
$slot_datetime = $_POST["slot_datetime"] ?? "";
$topics = $_POST["topics"] ?? "";

$stmt = $conn->prepare("
    INSERT INTO bookings 
    (first_name, last_name, company_name, email, phone, slot_datetime, topics)
    VALUES (?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "sssssss",
    $first_name,
    $last_name,
    $company_name,
    $email,
    $phone,
    $slot_datetime,
    $topics
);

if($stmt->execute()){
    echo json_encode(["success" => true]);
}else{
    echo json_encode([
        "success" => false,
        "message" => "Failed to save booking"
    ]);
}
?>