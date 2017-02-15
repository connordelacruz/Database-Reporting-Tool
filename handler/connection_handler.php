<?php
/**
 * Handles ajax queries for database connection
 * @author Connor de la Cruz
 */

include_once '../class/autoloader.php';


// Get the function requested by ajax query
$function = $_POST['function'];
// Data to return
$data = array();


try {
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
            // Check validity of table name. Exception is thrown if not valid
            $conn->validateTable($table);
            $columnNames = $conn->getColumns($table);
            // return column names
            $data['text'] = $columnNames;
            break;
    }

    // ensure that database connection is closed
    $conn->closeConnection();

    // send data back to client
    echo json_encode($data);
}

catch (Exception $e) {
    $data['error'] = $e->getMessage();
    error_log($data['error']);
    // Pass info to client
    echo json_encode($data);
}
