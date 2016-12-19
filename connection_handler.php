<?php
/**
 * Handles ajax queries for database connection
 */

include_once 'ConnectionHandler.class.php';


// Get the function requested by ajax query
$function = $_POST['function'];
// Data to return
$data = array();

// Instantiate connection handler
$conn = new ConnectionHandler();

switch ($function) {

    case ('getTables'):
        // Retrieve list of tables
        $tables = $conn->getTables();
        $data['text'] = $tables;
        break;

}

// ensure that database connection is closed
$conn->closeConnection();

// send data back to client
echo json_encode($data);