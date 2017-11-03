
<!DOCTYPE html>
<html lang="en">
<?php
include_once 'templates/header.php';
include_once 'config/config.php';
?>
<body>

<div class="container">
    <h1>Report Generator</h1>

    <div class="well-sm text-muted">Database: <?php echo $SQL_DATABASE; ?></div>

    <div class="well">
        <form class="form-vertical" id="report-options" action="report.php" method="post" target="_blank">
            <fieldset id="table-fieldset">
                <legend>Table</legend>
                <div id="table-loader-div"></div>
                <!-- TODO: rename table-select* to single-table* for clarity? -->
                <div class="form-group" id="table-select-div">
                    <div class="radio">
                        <label class="control-label radio-label" id="table-select-label">
                            <input type="radio" id="select-table-radio" name="select-type" value="select">
                            Single Table<span class="toggle--on">:</span>
                        </label>
                    </div>
                    <div class="table-collapse collapse" id="table-select-collapse">
                        <label class="sr-only" for="table-select">Select a Table:</label>
                        <select class="form-control table-select-input" id="table-select" name="table-select[]" required>
                            <option id="placeholder" value="" disabled selected>Select a table</option>
                        </select>
                    </div>
                </div>
                <div class="form-group" id="table-join-div">
                    <div class="radio">
                        <label class="control-label radio-label" id="table-join-label">
                            <input type="radio" id="table-join-radio" name="select-type" value="join">
                            Join Tables<span class="toggle--on">:</span>
                        </label>
                    </div>
                    <div class="table-collapse collapse" id="table-join-collapse">
                        <?php // TODO: re-work markup join field markup (table is just for prototyping) ?>
                        <table class="table table-condensed join-table">
                            <tbody>
                            <tr>
                                <td class="form-group">
                                    <label for="join-table1-select">Table 1:</label>
                                    <select class="form-control table-select-input" id="join-table1-select" name="table-select[]" required>
                                        <option id="placeholder" value="" disabled selected>Select a table</option>
                                    </select>
                                </td>
                                <td class="form-group">
                                    <label for="join-type-select">Join Type:</label>
                                    <select class="form-control" id="join-type-select" name="join[type]" required>
                                        <option value="inner" selected>Inner Join</option>
                                        <option value="left">Left Join</option>
                                        <option value="right">Right Join</option>
                                        <option value="outer">Outer Join</option>
                                    </select>
                                </td>
                                <td class="form-group">
                                    <label for="join-table2-select">Table 2:</label>
                                    <select class="form-control table-select-input" id="join-table2-select" name="table-select[]" required>
                                        <option id="placeholder" value="" disabled selected>Select a table</option>
                                    </select>
                                </td>
                                <td><b>ON</b></td>
                                <td class="form-group">
                                    <label for="join-column1-select">Table 1 Column:</label>
                                    <select class="form-control join-column-select" id="join-column1-select" name="join[columns][0]" required>
                                        <option class="placeholder" value="" disabled selected>Select a column</option>
                                    </select>
                                </td>
                                <td><b>=</b></td>
                                <td class="form-group">
                                    <label for="join-column2-select">Table 2 Column:</label>
                                    <select class="form-control join-column-select" id="join-column2-select" name="join[columns][1]" required>
                                        <option class="placeholder" value="" disabled selected>Select a column</option>
                                    </select>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </fieldset>

            <div id="column-select-div">
                <fieldset>
                    <legend>Columns</legend>
                    <div class="form-group">
                        <label class="control-label" for="column-list-container">Columns to display:</label>
                        <div class="text-muted" id="column-select-placeholder">
                            Select a table to continue.
                        </div>
                        <div id="column-list-container"></div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend class="collapse-toggle" id="legend-advanced-options">
                        Advanced Options
                    </legend>
                    <div class="collapse" id="collapse-advanced-options">
                        <div class="form-group">
                            <input type="checkbox" class="switch-input"
                                   id="toggle-row-limit" name="toggle-row-limit" value="row-limit">
                            <label for="toggle-row-limit" class="switch-label">
                                Limit number of rows<span class="toggle--on">:</span>
                            </label>
                            <div class="collapse" id="collapse-row-limit">
                                <input class="form-control" type="number" disabled autocomplete="off"
                                       name="row-limit" id="row-limit" placeholder="Number of rows to display">
                            </div>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <div class="form-group">
                        <div id="generate-report-div">
                            <button class="btn btn-primary" type="submit"
                                    name="generate-report" id="generate-report" disabled>
                                Generate Report
                            </button>
                            <button class="btn btn-success" type="submit"
                                    name="export-csv" id="export-csv" disabled>
                                Download Report as CSV
                            </button>
                        </div>
                    </div>
                </fieldset>
            </div>
            <div id="error-div"></div>
        </form>
    </div>

    <footer class="well-lg"></footer>
</div>

</body>
</html>