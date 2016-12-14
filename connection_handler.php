<?PHP
/**
 * Processes the information from config.php and handles connecting to the database
 */

// Variables are set in config.php
include "config.php";

// When dbConnect is called to initialize the database, it sets this variable to an array of table names in
$table_whitelist = array();

/**
 * Creates the DSN string used in the constructor for PDO objects
 * @param string $host
 * @param string $dbname
 * @param string $port
 * @return string Formatted DSN string
 */
function dsn($host, $dbname, $port) {
    // PDO constructor will try to connect to the default mysql port if port is set to ''
    $dsn = "mysql:host=$host;dbname=$dbname;port=$port";
    return $dsn;
}

/**
 * Handles creating the database connection
 * @param string $server The name of the server
 * @param string $dbname The name of the database
 * @param string $port Port number (may be an empty string or false)
 * @param string $user The username for this database
 * @param string $pass The password for this database
 * @return PDO the PDO object representing the database connection
 */
function dbConnect($server, $dbname, $port, $user, $pass) {
    // Create DSN string
    $dsn = dsn($server, $dbname, $port);
    // Create the database connection and set the errmode attribute to throw exceptions
    $db = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

    // Populate $table_whitelist
    $stmt = $db->query("SHOW TABLES");
    $GLOBALS['table_whitelist'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $stmt = null;

    return $db;
}

/**
 * Checks if the given string is a table in the database that we're currently connected to
 * @param string $table The name of the table
 * @return bool|string false if the table isn't in our whitelist, or the table name with proper quotation marks if it
 * is whitelisted.
 */
function validateTable($table) {
    global $table_whitelist;
    // Check if the table is in the whitelist
    $whitelist_key = array_search($table, $table_whitelist);
    // If the search returns false, then return false
    if ($whitelist_key === false)
        return false;
    // otherwise, if it returned a key, we know that it is a valid table name
    else {
        // strings in the table aren't surrounded by `s, so we can add them here without issues
        // (http://php.net/manual/en/pdo.quote.php#112169)
        $to_return = $table_whitelist[$whitelist_key];
        $to_return = "`".str_replace("`","``",$to_return)."`";
        return $to_return;
    }
}

/**
 * @param $validatedTable
 * @param $column
 * @param PDO $db
 */
function validateColumns($validatedTable, $column, $db) {
    $stmt = $db->prepare("SHOW COLUMNS FROM $validatedTable");
    $stmt->execute();
    // TODO: check $column against this table
    // TODO: quote column name appropriately
}