<?php
/**
 * Migration: Make page_content session-specific
 * Run this once to add session_id to page_content table
 */

require "db.php";

header("Content-Type: application/json");

try {
    // Check if session_id column already exists
    $checkColumn = $conn->query("
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'page_content' AND COLUMN_NAME = 'session_id'
    ");

    if ($checkColumn->num_rows === 0) {
        // Step 1: Add session_id column to page_content
        $conn->query("
            ALTER TABLE page_content 
            ADD COLUMN session_id INT UNIQUE NULL
        ");

        // Step 2: Add foreign key constraint
        $conn->query("
            ALTER TABLE page_content 
            ADD CONSTRAINT fk_page_content_session 
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
        ");

        // Step 3: Create records for each session
        $sessions = $conn->query("SELECT id FROM sessions");
        $globalBanner = '';
        $globalDesc = '';
        
        // Get existing global content if any
        $globalContent = $conn->query("SELECT banner, description FROM page_content WHERE id = 1");
        if ($globalContent && $globalRow = $globalContent->fetch_assoc()) {
            $globalBanner = $globalRow['banner'] ?? '';
            $globalDesc = $globalRow['description'] ?? '';
        }

        // Insert content for each session
        while ($session = $sessions->fetch_assoc()) {
            $sessionId = $session['id'];
            $stmt = $conn->prepare("
                INSERT INTO page_content (session_id, banner, description) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE banner = banner
            ");
            $stmt->bind_param("iss", $sessionId, $globalBanner, $globalDesc);
            $stmt->execute();
        }

        echo json_encode([
            "success" => true,
            "message" => "Migration completed: session_id column added to page_content with unique constraint"
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "message" => "Migration already applied: session_id column exists"
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Migration failed: " . $e->getMessage()
    ]);
}
?>
