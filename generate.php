<?php
/**
 * Page that is loaded when report is generated
 */

include_once 'autoloader.php';

// get selected table and columns from POST
$table = $_POST['table-select'];
$columns = $_POST['columns'];

$conn = new ConnectionHandler();

$selection = $conn->getRows($table, $columns);

// create string with <table> element for report generation
$tableString = "<thead><tr>";
// handle the column headers first
foreach ($selection[0] as $item) {
    $tableString .= "<th>$item</th>";
}
$tableString .= "</tr></thead><tbody>";
// Table body
for($i = 1; $i < count($selection); $i++) {
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

    <title>Report</title>

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
        <table class="table table-striped">
            <?php echo $tableString ?>
        </table>
    </div>
</div>
</body>