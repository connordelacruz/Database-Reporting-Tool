<?php

include "../ConnectionHandler.class.php";

$conn = new ConnectionHandler();

$table = $conn->validateTable('test_table');
echo "<pre>" . $conn->getColumns($table) . "</pre>";