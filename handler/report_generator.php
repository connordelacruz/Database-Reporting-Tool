<?php
/**
 * Page that is loaded when report is generated
 * @author Connor de la Cruz
 */

try {
    $siteRoot = $_SERVER['DOCUMENT_ROOT'] . '/reports';
    include_once "$siteRoot/class/autoloader.php";
    // Ensure config file exists before including it
    if (!file_exists("$siteRoot/config/config.php"))
        throw new Exception('Configuration file config/config.php does not exist and will need to be set up before using this tool.');
    include_once "$siteRoot/config/config.php";


    // TODO: DEBUGGING, REMOVE
    echo "<pre>" . print_r($_POST, true) . "</pre>";

    // get POST data
    $select_type = $_POST['select-type'];
    $single_select = $select_type == 'single';
    $tables = $_POST['tables'];
    $join_data = array_key_exists('join', $_POST) ? $_POST['join'] : false;

    // Use table name as page title for single selects, otherwise use generic title
    $title = ($single_select && array_key_exists('table-select', $_POST)) ? $_POST['table-select'] : 'Report';

    // Advanced options (set to a default if not toggled or set)
    $row_count = (isset($_POST['toggle-row-limit']) && isset($_POST['row-limit'])) ? intval($_POST['row-limit']) : 0;

    // true if the generate button was clicked, false if the export CSV button was clicked
    $reportType = array_key_exists('generate-report', $_POST);

    $conn = new ConnectionHandler($SQL_SERVER, $SQL_PORT, $SQL_DATABASE, $SQL_USER, $SQL_PASSWORD);

    $selection = $conn->getRows($tables, $join_data, $row_count);

    // If the generate report button was clicked, then the report is generated as a webpage
    if ($reportType) {

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
        $pageTitle = $title;
        include_once 'templates/header.php';
        ?>
        <body>
        <div class="container">
            <?php
            // Add a heading with the table name if this is a single table
            if ($single_select)
                echo "<h1>$title</h1>"
            ?>
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
        // if this is a single table select, remove special characters from table name so it can be used as a valid filename
        // if this is a join statement, use a timestamp instead of table name
        $saveas = ($single_select) ?
            preg_replace('/[^\w\-. ]/', '', $title) :
            date('m-d-y-Hi');
        header('Content-Disposition: attachment; filename="' . $saveas . '-report.csv"');
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
}
catch (Exception $e) {
    $error = $e->getMessage();
    echo "<div class='alert alert-danger'>$error</div>";
    exit();
}