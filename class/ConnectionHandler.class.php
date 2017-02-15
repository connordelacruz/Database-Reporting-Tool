<?php
/**
 * Processes the information from config.ini and handles connecting to the database
 * @author Connor de la Cruz
 */

class ConnectionHandler {

    /* Array to store connection info from config.ini
     * Keys: SQL_SERVER, SQL_DATABASE, SQL_PORT, SQL_USER, SQL_PASSWORD */
    private $conf = [];

    // PDO object used to connect to the database. Assigned at construction
    private $db;

    // When dbConnect is called to initialize the database, it sets this variable to an array of table names in
    private $table_whitelist = array();

    public function __construct() {
        // TODO: more reliable way of checking config filepath
        // Parse config.ini and retrieve configuration settings
        if (file_exists('../config/config.ini')) {
            $ini = parse_ini_file('../config/config.ini');
            foreach($ini as $key => $value) {
                $this->conf[$key] = $value;
                // TODO: check required values and throw error if not set
            }

            
        }
        // If config.ini doesn't exist, then the connection will fail because the connection info wasn't specified
        else {
            // TODO: throw exception instead of just logging error. connection_handler.php will catch it and handle it
            error_log('config.ini does not exist. Create a copy of config_template.ini named config.ini and fill out connection information there.');
        }

        // Use the connection information to create PDO object
        $dsn = $this->dsn($this->conf['SQL_SERVER'], $this->conf['SQL_DATABASE'], $this->conf['SQL_PORT']);
        $this->db = new PDO($dsn, $this->conf['SQL_USER'], $this->conf['SQL_PASSWORD'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

        // Get the list of tables and store it in $table_whitelist
        $stmt = $this->db->query("SHOW TABLES");
        $this->table_whitelist = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $stmt = null;
    }


    /**
     * Creates the DSN string used in the constructor for PDO objects
     * @param string $host
     * @param string $dbname
     * @param string $port
     * @return string Formatted DSN string
     */
    private function dsn($host, $dbname, $port) {
        // PDO constructor will try to connect to the default mysql port if port is set to ''
        $dsn = "mysql:host=$host;dbname=$dbname;port=$port";
        return $dsn;
    }


    /**
     * Closes the connection by setting the PDO object to null. May not be necessary, but included to ensure that connection
     * isn't left open.
     */
    public function closeConnection() {
        $this->db = null;
    }

    /**
     * Checks if the given string is a table in the database that we're currently connected to
     * @param string $table The name of the table
     * @return bool|string false if the table isn't in our whitelist, or the table name with proper quotation marks if it
     * is whitelisted.
     */
    public function validateTable($table) {
        // Check if the table is in the whitelist
        $whitelist_key = array_search($table, $this->table_whitelist);
        // If the search returns false, then return false
        if ($whitelist_key === false)
            return false;
        // otherwise, if it returned a key, we know that it is a valid table name
        else {
            // strings in the table aren't surrounded by `s, so we can add them here without issues
            // (http://php.net/manual/en/pdo.quote.php#112169)
            $to_return = $this->table_whitelist[$whitelist_key];
            $to_return = "`" . str_replace("`", "``", $to_return) . "`";
            return $to_return;
        }
    }


    /**
     * @return array List of tables
     */
    public function getTables() {
        return $this->table_whitelist;
    }


    /**
     * Validates selected columns and returns array with all valid column names
     * @param string $table The table to check
     * @param array $columns Column selection to validate
     * @return array Valid column names
     */
    public function validateColumns($table, $columns) {
        // Get all valid column names (table is validated in getColumns)
        $valid_columns = $this->getColumns($table);
        // intersection b/w $valid_columns and $columns are all selected columns that are legitimate
        $whitelisted_columns = array_intersect($valid_columns, $columns);
        return $whitelisted_columns;
    }


    /**
     * Takes an array of column names and puts quotation marks around them
     * @param array $columns Whitelisted column names
     * @return array The contents of $columns surrounded by quotes
     */
    public function quoteColumns($columns) {
        foreach ($columns as $index => $column) {
            $columns[$index] = "`" . str_replace("`", "``", $column) . "`";
        }
        return $columns;
    }


    /**
     * Get the column names for the specified table after ensuring it's whitelisted
     * @param string $table The table to check for in the whitelist and retrieve column names
     * @return array The names of the columns for the specified table
     */
    public function getColumns($table) {
        // check whitelist for $table
        $whitelisted_table = $this->validateTable($table);
        // $columnNames is declared here so an empty array is returned if validateTable($table) returns false
        $columnNames = [];
        // if the table is in the whitelist
        if ($whitelisted_table) {
            $stmt = $this->db->query("SHOW COLUMNS FROM $whitelisted_table");
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get just the field names for the columns
            foreach ($result as $column) {
                $columnNames[] = $column['Field'];
            }
        }
        return $columnNames;
    }


    /**
     * Given a table name and an array of columns, returns all selected rows from table
     * @param string $table Table name (will be validated)
     * @param array $columns Columns (will be validated)
     * @return array The resulting table selection
     */
    function getRows($table, $columns) {
        // validate table
        $whitelisted_table = $this->validateTable($table);
        // Validate column names
        $whitelisted_columns = $this->validateColumns($table, $columns);

        // array of rows where $rows[0] contains an array of column headers
        $rows = [];
        // field headers
        $rows[0] = $whitelisted_columns;
        // Handle quotation marks
        $whitelisted_columns = $this->quoteColumns($whitelisted_columns);
        // String of column names to select separated by commas
        $to_select = implode(',', $whitelisted_columns);
        $stmt = $this->db->prepare("SELECT $to_select FROM $whitelisted_table");
        $stmt->execute();
        // Push each row to $rows
        while($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $rows[] = $row;
        }
        return $rows;
    }
}