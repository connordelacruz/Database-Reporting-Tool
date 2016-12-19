<?php
/**
 * Processes the information from config.php and handles connecting to the database
 */

class ConnectionHandler {

    // variables with connection settings from config.ini
    private $SQL_SERVER, $SQL_DATABASE, $SQL_PORT, $SQL_USER, $SQL_PASSWORD,
        $SAVED_REPORTS_SQL_SERVER, $SAVED_REPORTS_SQL_USER, $SAVED_REPORTS_SQL_PASSWORD,
        $SAVED_REPORTS_SQL_DATABASE, $SAVED_REPORTS_SQL_PORT;

    // PDO object used to connect to the database. Assigned at construction
    private $db;

    // When dbConnect is called to initialize the database, it sets this variable to an array of table names in
    private $table_whitelist = array();

    public function __construct() {
        // Parse config.ini and retrieve configuration settings
        if (file_exists('config.ini')) {
            $ini = parse_ini_file('config.ini');

            /*
            // Iterate through each key in the ini file and assign it to a PHP variable of the same name
            foreach ($ini as $key => $value) {
                // Config property names match their corresponding private vars in this class
                $this->{$key} = $value;
            }
            */

            // For clarity, using static variable assignment instead of dynamic
            $this->SQL_SERVER = $ini['SQL_SERVER'];
            $this->SQL_DATABASE = $ini['SQL_DATABASE'];
            $this->SQL_PORT = $ini['SQL_PORT'];
            $this->SQL_USER = $ini['SQL_USER'];
            $this->SQL_PASSWORD = $ini['SQL_PASSWORD'];

            $this->SAVED_REPORTS_SQL_SERVER = $ini['SAVED_REPORTS_SQL_SERVER'];
            $this->SAVED_REPORTS_SQL_DATABASE = $ini['SAVED_REPORTS_SQL_DATABASE'];
            $this->SAVED_REPORTS_SQL_PORT = $ini['SAVED_REPORTS_SQL_PORT'];
            $this->SAVED_REPORTS_SQL_USER = $ini['SAVED_REPORTS_SQL_USER'];
            $this->SAVED_REPORTS_SQL_PASSWORD = $ini['SAVED_REPORTS_SQL_PASSWORD'];
        }
        // If config.ini doesn't exist, then the connection will fail because the connection info wasn't specified
        else {
            error_log('config.ini does not exist. Create a copy of config_template.ini named config.ini and fill out connection information there.');
        }

        // TODO: try-catch block?
        // Use the connection information to create PDO object
        $dsn = $this->dsn($this->SQL_SERVER, $this->SQL_DATABASE, $this->SQL_PORT);
        $this->db = new PDO($dsn, $this->SQL_USER, $this->SQL_PASSWORD, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

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
}