<?php
include "db.php";

header("Content-Type: application/json");

// Load content from the current active session
$result = $conn->query("
    SELECT banner, description
    FROM sessions
    WHERE is_current = 1
    LIMIT 1
");

$row = $result->fetch_assoc();

echo json_encode([
    "banner_src" => $row["banner"] ?? "",
    "page_data" => $row["description"] ?? ""
]);
?>