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

// If the generate report button was clicked

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
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="res/img/icon/apple-touch-icon.png">
    <link rel="icon" type="image/png" href="res/img/icon/favicon-32x32.png" sizes="32x32">
    <link rel="icon" type="image/png" href="res/img/icon/favicon-16x16.png" sizes="16x16">
    <link rel="manifest" href="res/img/icon/manifest.json">
    <link rel="mask-icon" href="res/img/icon/safari-pinned-tab.svg" color="#5bbad5">
    <link rel="shortcut icon" href="res/img/icon/favicon.ico">
    <meta name="msapplication-config" content="res/img/icon/browserconfig.xml">
    <meta name="theme-color" content="#2196f3">

    <title><?php echo $table ?></title>

    <!-- Stylesheet includes Bootstrap.css + theme -->
    <link rel="stylesheet" href="res/css/global.css">

    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <!-- Bootstrap.js -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

</head>
<body>
<div class="container">
    <h1><?php echo $table ?></h1>
    <div class="table-responsive">
        <table class="table table-striped table-bordered">
            <?php echo $tableString ?>
        </table>
    </div>
</div>
</body>

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