<?php
include "db.php";

header("Content-Type: application/json");

$result = $conn->query("SELECT banner, description FROM page_content WHERE id = 1");
$row = $result->fetch_assoc();

echo json_encode([
    "banner_src" => $row["banner"] ?? "",
    "page_data" => $row["description"] ?? ""
]);
?>