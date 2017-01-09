<?php
include 'ConnectionHandler.class.php';

$conn = new ConnectionHandler();

$table = $conn->validateTable('test_table');
echo "<pre>" . print_r($conn->getColumns($table),true) . "</pre>";