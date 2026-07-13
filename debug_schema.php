<?php
require "db.php";

header("Content-Type: application/json");

try {
    // Check page_content table structure
    $columnsResult = $conn->query("DESCRIBE page_content");
    $columns = [];
    
    while ($row = $columnsResult->fetch_assoc()) {
        $columns[] = $row;
    }
    
    // Check current sessions
    $sessionsResult = $conn->query("SELECT id, title, is_current FROM sessions");
    $sessions = [];
    
    while ($row = $sessionsResult->fetch_assoc()) {
        $sessions[] = $row;
    }
    
    // Check page_content records
    $contentResult = $conn->query("SELECT * FROM page_content");
    $content = [];
    
    while ($row = $contentResult->fetch_assoc()) {
        $content[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "page_content_columns" => $columns,
        "sessions" => $sessions,
        "page_content_records" => $content
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
