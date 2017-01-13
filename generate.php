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


</body>