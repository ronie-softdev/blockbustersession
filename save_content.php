<?php
include "db.php";

header("Content-Type: application/json");

$banner = $_POST['bannerSrc'] ?? '';
$pageData = $_POST['pageData'] ?? '';

// Update the current active session with the banner and description
$stmt = $conn->prepare("
    UPDATE sessions
    SET banner = ?, description = ?
    WHERE is_current = 1
");

$stmt->bind_param("ss", $banner, $pageData);

$success = $stmt->execute();

echo json_encode([
    "success" => $success,
    "message" => $success ? "Saved successfully" : "Save failed",
    "banner_length" => strlen($banner)
]);
?>