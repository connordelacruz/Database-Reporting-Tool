<?php
/**
 * Page that is loaded when report is generated
 * @author Connor de la Cruz
 */

$siteRoot = $_SERVER['DOCUMENT_ROOT'] . '/reports';
include_once "$siteRoot/class/autoloader.php";
// Ensure config file exists before including it
if (!file_exists("$siteRoot/config/config.php"))
    throw new Exception('Configuration file config/config.php does not exist and will need to be set up before using this tool.');
include_once "$siteRoot/config/config.php";

// get POST data
$select_type = $_POST['select-type'];
$tables = $_POST['tables'];
$join_data = array_key_exists('join', $_POST) ? $_POST['join'] : false;

// TODO: This is used for the page header/filename. Figure out convention for naming these for 1 or more tables and get rid of this variable
$table = $_POST['table-select'][0];

// Advanced options (set to a default if not toggled or set)
$row_count = (isset($_POST['toggle-row-limit']) && isset($_POST['row-limit'])) ? intval($_POST['row-limit']) : 0;

// true if the generate button was clicked, false if the export CSV button was clicked
$reportType = array_key_exists('generate-report', $_POST);

$conn = new ConnectionHandler($SQL_SERVER, $SQL_PORT, $SQL_DATABASE, $SQL_USER, $SQL_PASSWORD);

$selection = $conn->getRows($tables, $join_data, $row_count);

// If the generate report button was clicked, then the report is generated as a webpage
if ($reportType) {

    // TODO: DEBUGGING, REMOVE
    //echo "<pre>" . print_r($_POST, true) . "</pre>";

    // create string with <table> element for report generation
    $tableString = "<thead><tr>";
    // handle the column headers first
    foreach ($selection[0] as $item) {
        $tableString .= "<th>$item</th>";
    }
    $tableString .= "</tr></thead><tbody>";
    // Table body
    for ($i = 1; $i < count($selection); $i++) {
        $tableString .= "<tr>";
        // Iterate through elements in row
        $row = $selection[$i];
        foreach ($row as $item) {
            $tableString .= "<td>$item</td>";
        }
        $tableString .= "</tr>";
    }
    $tableString .= "</tbody>";

    ?>

<!DOCTYPE html>
<html lang="en">
    <?php
    // disable viewport to enable horizontal scrolling
    $disableViewport = true;
    $pageTitle = $table;
    include_once 'templates/header.php';
    ?>
<body>
<div class="container">
    <h1><?php echo $table ?></h1>
    <table class="table table-striped table-bordered">
        <?php
        echo $tableString;
        ?>
    </table>
</div>
</body>
</html>
<?php
}

// else if we are supposed to generate a CSV
else {
    // set header to indicate that this is a CSV file download
    header('Content-Type: application/csv');
    // remove special characters from table name so it can be used as a valid filename
    $saveas = preg_replace('/[^A-Za-z0-9\-]/', '', $table);
    header('Content-Disposition: attachment; filename="' . $table . '-report.csv"');
    header('Pragma: no-cache');
    // open output as file pointer and write results of $selection
    $out = fopen('php://output', 'w');
    foreach ($selection as $row) {
        fputcsv($out, $row);
    }
    fclose($out);
}

// ensure that database connection is closed
$conn->closeConnection();