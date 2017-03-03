<?php
/**
 * Page that is loaded when report is generated
 * @author Connor de la Cruz
 */

include_once $_SERVER['DOCUMENT_ROOT'] . '/reports/class/autoloader.php';

// get selected table and columns from POST
$table = $_POST['table-select'];
$columns = $_POST['columns'];
// true if the generate button was clicked, false if the export CSV button was clicked
$reportType = array_key_exists('generate-report', $_POST);

$conn = new ConnectionHandler();

$selection = $conn->getRows($table, $columns);

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
    $pageTitle = $table;
    include_once 'templates/header.php';
    ?>
<body>
<div class="container">
    <h1><?php echo $table ?></h1>
    <div class="table-responsive">
        <table class="table table-striped table-bordered">
            <?php
            // TODO: ensure that horizontal scrolling is enabled for wide tables
            echo $tableString;
            ?>
        </table>
    </div>
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