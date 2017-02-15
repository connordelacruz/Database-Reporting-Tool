
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

    <div class="well-sm text-muted">Database: <?php echo parse_ini_file('config/config.ini')['SQL_DATABASE']; ?></div>

    <div class="well">
        <form class="form-vertical" id="report-options" action="report.php" method="post" target="_blank">
            <fieldset>
                <legend>Table</legend>
                <div class="form-group" id="table-select-div"></div>
            </fieldset>

            <div class="collapse" id="column-select-div">
                <fieldset>
                    <legend>Columns</legend>
                    <div class="form-group">
                        <label class="control-label" for="column-select">Columns to display:</label>
                        <div id="column-select"></div>
                        <div id="generate-report-div">
                            <button class="btn btn-primary" type="submit" name="generate-report" id="generate-report" disabled>Generate Report</button>
                            <button class="btn btn-success" type="submit" name="export-csv" id="export-csv" disabled>Download Report as CSV</button>
                        </div>
                    </div>
                </fieldset>
            </div>
            <div id="error-div"></div>
        </form>
    </div>

</div>

</body>
</html>