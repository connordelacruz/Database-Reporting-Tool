
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Report Generator</title>

    <!-- Stylesheet includes Bootstrap.css + theme -->
    <link rel="stylesheet" href="res/css/global.css">

    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <!-- Bootstrap.js -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

    <!-- Contains js for this page and functions to get data from the database -->
    <script src="res/js/index.js"></script>

</head>
<body>

<div class="container">
    <h1>Report Generator</h1>

    <div class="well-sm text-muted">Database: <?php echo parse_ini_file('config.ini')['SQL_DATABASE']; ?></div>

    <div class="well" id="table-select-div">
        <form class="form-vertical" id="report-options" action="generate.php" method="post" target="_blank">
            <fieldset>
                <legend>Table</legend>
                <div class="form-group">
                    <label class="control-label" for="table-select">Table:</label>
                    <select class="form-control" id="table-select" name="table-select" required disabled>
                        <option id="placeholder" value="" disabled selected>Select a table</option>
                    </select>
                </div>
            </fieldset>

            <div class="collapse" id="column-select-div">
                <fieldset>
                    <legend>Columns</legend>
                    <div class="form-group">
                        <label class="control-label" for="column-select">Columns to display:</label>
                        <div id="column-select"></div>
                        <div id="generate-report-div">
                            <button class="btn btn-primary" type="submit" name="generate-report" id="generate-report" disabled>Generate Report</button>
                        </div>
                    </div>
                </fieldset>
            </div>
        </form>
    </div>

</div>

</body>
</html>