<?php
include "db.php";

header("Content-Type: application/json");

$banner = $_POST['bannerSrc'] ?? '';
$pageData = $_POST['pageData'] ?? '';

$stmt = $conn->prepare("
    UPDATE page_content
    SET banner = ?, description = ?
    WHERE id = 1
");

$stmt->bind_param("ss", $banner, $pageData);

$success = $stmt->execute();

echo json_encode([
    "success" => $success,
    "message" => $success ? "Saved successfully" : "Save failed",
    "banner_length" => strlen($banner)
]);
?>