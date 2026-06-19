<?php
header("Content-Type: application/json");
include "db.php";

$action = $_POST["action"] ?? "";
$key = $_POST["key"] ?? "";

if($action === "get"){
    $stmt = $conn->prepare("SELECT storage_value FROM page_storage WHERE storage_key = ?");
    $stmt->bind_param("s", $key);
    $stmt->execute();

    $result = $stmt->get_result();

    if($row = $result->fetch_assoc()){
        echo json_encode([
            "success" => true,
            "value" => $row["storage_value"]
        ]);
    }else{
        echo json_encode([
            "success" => true,
            "value" => null
        ]);
    }
    exit;
}

if($action === "set"){
    $value = $_POST["value"] ?? "";

    $stmt = $conn->prepare("
        INSERT INTO page_storage (storage_key, storage_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE storage_value = VALUES(storage_value)
    ");

    $stmt->bind_param("ss", $key, $value);
    $ok = $stmt->execute();

    echo json_encode(["success" => $ok]);
    exit;
}

if($action === "delete"){
    $stmt = $conn->prepare("DELETE FROM page_storage WHERE storage_key = ?");
    $stmt->bind_param("s", $key);
    $ok = $stmt->execute();

    echo json_encode(["success" => $ok]);
    exit;
}

echo json_encode([
    "success" => false,
    "message" => "Invalid action"
]);
?>