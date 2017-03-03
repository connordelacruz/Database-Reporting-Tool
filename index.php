
<!DOCTYPE html>
<html lang="en">
<?php include_once 'templates/header.php'; ?>
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