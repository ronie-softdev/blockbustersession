<?php
header("Content-Type: application/json");
require "db.php";

try {
    // Get all sessions
    $sessions = $conn->query("SELECT * FROM sessions ORDER BY id DESC LIMIT 10");
    $sessionData = [];
    while ($row = $sessions->fetch_assoc()) {
        $sessionData[] = $row;
    }
    
    // Get table info
    $tables = $conn->query("SHOW TABLES");
    $tableList = [];
    while ($row = $tables->fetch_row()) {
        $tableList[] = $row[0];
    }
    
    echo json_encode([
        "success" => true,
        "sessions_count" => count($sessionData),
        "sessions" => $sessionData,
        "tables" => $tableList
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>
