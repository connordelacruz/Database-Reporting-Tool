<?php
/**
 * Handles ajax queries for database connection
 * @author Connor de la Cruz
 */

try {

    include_once '../class/autoloader.php';
    // Ensure config file exists before including it
    if (!file_exists('../config/config.php'))
        throw new Exception('Configuration file config/config.php does not exist and will need to be set up before using this tool.');
    include_once '../config/config.php';

    // Get the function requested by ajax query
    $function = $_POST['function'];
    // Data to return
    $data = array();

    // Instantiate connection handler
    $conn = new ConnectionHandler($SQL_SERVER, $SQL_PORT, $SQL_DATABASE, $SQL_USER, $SQL_PASSWORD);

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
            // TODO: return total number of rows
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
