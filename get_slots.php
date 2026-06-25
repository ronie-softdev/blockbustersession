<?php
include "db.php";

header("Content-Type: application/json");

$sql = "
SELECT 
  s.id,
  s.label,
  s.capacity,
  (
    SELECT COUNT(*) 
    FROM bookings b 
    WHERE CONVERT(b.slot_datetime USING utf8mb4) COLLATE utf8mb4_general_ci
    =
    CONVERT(s.label USING utf8mb4) COLLATE utf8mb4_general_ci
  ) AS booked
FROM slots s
INNER JOIN sessions se ON s.session_id = se.id
WHERE se.is_current = 1
ORDER BY s.id ASC
";

$result = $conn->query($sql);

if (!$result) {
  echo json_encode([
    "success" => false,
    "message" => $conn->error
  ]);
  exit;
}

$slots = [];

while ($row = $result->fetch_assoc()) {
  $booked = (int)$row["booked"];
  $capacity = (int)$row["capacity"];

  $slots[] = [
    "id" => $row["id"],
    "label" => $row["label"],
    "capacity" => $capacity,
    "booked" => $booked,
    "available" => max($capacity - $booked, 0)
  ];
}

echo json_encode($slots);
?>