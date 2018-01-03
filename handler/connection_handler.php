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
            $data['text'] = $conn->getTables();
            break;

        case ('getColumns'):
            $table = $_POST['table'];
            // return column names and total number of rows
            $data['text'] = $conn->getColumns($table);
            $data['rowCount'] = $conn->countRows($table);
            break;

        case ('getColumnsBatch'):
            $tables = $_POST['tables'];
            // return column names and total number of rows
            $data['text'] = $conn->getColumnsBatch($tables);
            // TODO: batch row count
            //$data['rowCount'] = $conn->countRows($tables);
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
