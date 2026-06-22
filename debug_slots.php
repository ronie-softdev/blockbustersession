<?php

require "db.php";

$result = $conn->query("SHOW COLUMNS FROM slots");

while($row = $result->fetch_assoc()){
    echo $row['Field'] . "<br>";
}

?>