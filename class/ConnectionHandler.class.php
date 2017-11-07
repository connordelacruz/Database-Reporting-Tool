<?php
/**
 * Handles database connections
 * @author Connor de la Cruz
 */

class ConnectionHandler {

    // PDO object used to connect to the database. Assigned at construction
    private $db;

    // When dbConnect is called to initialize the database, it sets this variable to an array of table names in
    private $table_whitelist = array();

    // List of valid select types
    const SELECT_TYPES = [
        'single',
        'join'
    ];
    
    // List of valid join types
    const JOIN_TYPES = [
        'inner',
        'left',
        'right',
        'outer'
    ];

    /**
     * ConnectionHandler constructor.
     * @param string $SQL_SERVER Server the database is on
     * @param string $SQL_PORT Port number of the database (can be left blank)
     * @param string $SQL_DATABASE Name of the database
     * @param string $SQL_USER Username used to connect to database
     * @param string $SQL_PASSWORD Password for above user
     * @throws Exception if config.ini doesn't exist or is missing necessary connection information
     */
    public function __construct($SQL_SERVER, $SQL_PORT, $SQL_DATABASE, $SQL_USER, $SQL_PASSWORD) {

        // Use the connection information to create PDO object
        $dsn = $this->dsn($SQL_SERVER, $SQL_DATABASE, $SQL_PORT);
        $this->db = new PDO($dsn, $SQL_USER, $SQL_PASSWORD, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

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
     * @return string The table name with proper quotation marks if it is whitelisted.
     * @throws Exception if $table isn't in the whitelist
     */
    public function validateTable($table) {
        // Check if the table is in the whitelist
        $whitelist_key = array_search($table, $this->table_whitelist);
        // If the search returns false, thrown an exception
        if ($whitelist_key === false)
            throw new Exception("$table does not appear to be a valid table. Please select a different table.");

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
     * @param string $table Whitelisted table name
     * @param array $columns Whitelisted column names
     * @return array The contents of $columns surrounded by quotes
     */
    public function quoteColumns($table, $columns) {
        // Prefix with quoted table name followed by a .
        $table_prefix = $table . '.';
        foreach ($columns as $index => $column) {
            $quoted_column = "`" . str_replace("`", "``", $column) . "`";
            $columns[$index] = $table_prefix . $quoted_column;
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
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get just the field names for the columns
            foreach ($result as $column) {
                $columnNames[] = $column['Field'];
            }
        }
        return $columnNames;
    }


    /**
     * Counts the rows in a given table (after ensuring it's whitelisted)
     * @param string $table Name of the table to check
     * @return int The number of rows in $table
     */
    function countRows($table) {
        // the count to return
        $row_count = 0;
        // check whitelist for $table
        $whitelisted_table = $this->validateTable($table);
        // if the table is in the whitelist, get its rows
        if ($whitelisted_table) {
            $stmt = $this->db->query("SELECT COUNT(*) FROM $whitelisted_table");
            $row_count = $stmt->fetch()[0];
        }
        return $row_count;
    }


    /**
     * Given a table name and an array of columns, returns all selected rows from table
     * @param array $tables Array of columns indexed by the name of the table containing them
     * @param string $select_type (Optional) 'single' for 1 table, 'join' for join statements. Defaults to 'single' if
     * not provided or an invalid value
     * @param int $row_count (Optional) the number of rows to display
     * @return array The resulting table selection
     */
    // TODO: instead of $select_type, have $join_query, which takes the data from $_POST['join'] and defaults to false
    public function getRows($tables, $select_type = 'single', $row_count = 0) {
        // If $select_type is invalid, set it to 'single'
        if (!in_array($select_type, self::SELECT_TYPES))
            $select_type = 'single';

        // validate tables and columns
        $quoted_columns = [];
        $quoted_tables = [];
        $column_headers = [];
        foreach ($tables as $table => $columns) {
            $whitelisted_table = $this->validateTable($table);
            $whitelisted_columns = $this->validateColumns($table, $columns);
            // Add list of unquoted column names to $column_headers
            $column_headers = array_merge($column_headers, $whitelisted_columns);
            // Quote columns and prefix them by quoted table name
            $whitelisted_columns = $this->quoteColumns($whitelisted_table, $whitelisted_columns);
            // Add validated table name and columns to their respective arrays
            $quoted_tables[] = $whitelisted_table;
            $quoted_columns = array_merge($quoted_columns, $whitelisted_columns);
        }

        // array of rows where $rows[0] contains an array of column headers
        $rows = [];
        $rows[0] = $column_headers;

        // String of column names to select separated by commas
        $columns_string = implode(',', $quoted_columns);
        // Table(s) to select from
        // TODO: if $select_type == 'join', build join statement
        $from_string = $quoted_tables[0];

        // Build SQL query string
        $sql = "SELECT $columns_string FROM $from_string";

        // If $row_count is 1 or greater, using it in a limit statement is valid.
        // If $row_count is greater than the total number of rows, it just returns all rows
        if ($row_count > 0)
            $sql .= " LIMIT :rowCount";

        $stmt = $this->db->prepare($sql);
        // If $row_count is set, fill placeholder in prepared statement
        if ($row_count > 0)
            $stmt->bindParam(':rowCount', $row_count, PDO::PARAM_INT);
        $stmt->execute();

        // Push each row to $rows
        while($row = $stmt->fetch(PDO::FETCH_NUM)) {
            $rows[] = $row;
        }

        return $rows;
    }

}