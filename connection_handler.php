<?php
/**
 * Handles ajax queries for database connection
 * @author Connor de la Cruz
 */

include_once 'autoloader.php';


// Get the function requested by ajax query
$function = $_POST['function'];
// Data to return
$data = array();

// Instantiate connection handler
$conn = new ConnectionHandler();

// Determine what function to perform based on query
switch ($function) {

    case ('getTables'):
        // Retrieve list of tables
        $tables = $conn->getTables();
        $data['text'] = $tables;
        break;

    case ('getColumns'):
        $table = $_POST['table'];
        // Check validity of table name
        if (!$conn->validateTable($table)) {
            // if the table wasn't validated, then pass this error message back and break
            $data['error'] = "$table does not appear to be a valid table. Please select a different table.";
            break;
        }
        $columnNames = $conn->getColumns($table);
        // return column names
        $data['text'] = $columnNames;
        break;
}

// ensure that database connection is closed
$conn->closeConnection();

// send data back to client
echo json_encode($data);