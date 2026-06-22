<?php
header("Content-Type: application/json");
require "db.php";

$sql = "
SELECT 
  s.id,
  s.label,
  s.capacity,
  COUNT(b.id) AS booked
FROM slots s
LEFT JOIN bookings b 
ON s.label COLLATE utf8mb4_general_ci = b.slot_datetime COLLATE utf8mb4_general_ci
GROUP BY s.id, s.label, s.capacity
ORDER BY s.id ASC
";

$result = $conn->query($sql);

if (!$result) {
  echo json_encode([
    "success" => false,
    "message" => "SQL error: " . $conn->error
  ]);
  exit;
}

$slots = [];

while ($row = $result->fetch_assoc()) {
  $capacity = (int)$row["capacity"];
  $booked = (int)$row["booked"];

  $slots[] = [
    "id" => (int)$row["id"],
    "label" => $row["label"],
    "capacity" => $capacity,
    "booked" => $booked,
    "available" => max($capacity - $booked, 0)
  ];
}

echo json_encode($slots);
?>