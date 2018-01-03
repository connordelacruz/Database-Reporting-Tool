
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
                <!-- TODO: rename table-select* to single-table* for clarity -->
                <div class="form-group" id="table-select-div">
                    <div class="radio">
                        <label class="control-label radio-label" id="table-select-label">
                            <input type="radio" id="select-table-radio" name="select-type" value="single">
                            Single Table<span class="toggle--on">:</span>
                        </label>
                    </div>
                    <div class="table-collapse collapse" id="table-select-collapse">
                        <label class="sr-only" for="table-select">Select a Table:</label>
                        <select class="form-control table-select-input" id="table-select" name="table-select" required>
                            <option class="placeholder" value="" disabled selected>Select a table</option>
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

                        <?php // TODO: Implement new join ui ?>
                        <div id="join-details-container">
                            <!-- TODO: display current join or placeholder -->
                        </div>
                        <button type="button" class="btn btn-block btn-info" id="join-modal-button" data-toggle="modal" data-target="#join-modal">
                            Join Tables
                        </button>
                        <div class="modal multi-step fade" id="join-modal" role="dialog" data-backdrop="static" data-keyboard="false">
                            <div class="modal-dialog modal-lg">
                                <div class="modal-content">
                                    <div class="modal-body step step-1" data-step="1">
                                        <fieldset>
                                            <legend>1. Select Tables to Join</legend>
                                            <label for="join-table-duallist" class="control-label">Select 2 or more tables to continue:</label>
                                            <select multiple class="table-select-input" id="join-table-duallist" name="join-table-duallist[]"></select>
                                        </fieldset>
                                    </div>
                                    <div class="modal-body step step-2" data-step="2">
                                        <fieldset>
                                            <legend>2. Order Tables</legend>
                                            <label class="control-label" for="join-table-order">
                                                Click and drag the tables to arrange them in the order they'll be joined:
                                            </label>
                                            <ul class="list-group sortable" id="join-table-order">
                                                <li class="list-group-item">Select 2 or more tables to continue.</li>
                                            </ul>
                                        </fieldset>
                                    </div>
                                    <div class="modal-body step step-3" data-step="3">
                                        <fieldset>
                                            <!-- TODO: implement (and come up with a more eloquent title?) -->
                                            <legend>3. Select Fields to Join On</legend>
                                            <label class="control-label">Select the fields to join on and join types:</label>
                                            <div class="panel panel-default join-table-panel">
                                                <div class="panel-body">
                                                    <table class="table table-condensed join-table">
                                                        <tbody id="join-table-body">
                                                        <tr>
                                                            <td class="form-group" colspan="6">
                                                                <input type="text" class="form-control" name="join[0][0][table]" value="table0" readonly required/>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td class="form-group">
                                                                <select class="form-control" id="join-type-select" name="join[0][type]" required>
                                                                    <option value="inner" selected>Inner Join</option>
                                                                    <option value="left">Left Join</option>
                                                                    <option value="right">Right Join</option>
                                                                    <option value="outer">Outer Join</option>
                                                                </select>
                                                            </td>
                                                            <td class="form-group">
                                                                <input type="text" class="form-control" name="join[0][1][table]" value="table1" readonly required/>
                                                            </td>
                                                            <td class="text-center"><b>ON</b></td>
                                                            <td class="form-group">
                                                                <select class="form-control join-column-select" name="join[0][0][column]" required>
                                                                    <option class="placeholder" value="" disabled selected>Select a column</option>
                                                                </select>
                                                            </td>
                                                            <td class="text-center"><b>=</b></td>
                                                            <td class="form-group">
                                                                <select class="form-control join-column-select" name="join[0][1][column]" required>
                                                                    <option class="placeholder" value="" disabled selected>Select a column</option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </fieldset>
                                    </div>
                                    <div class="modal-footer">
                                        <!-- TODO: add listener that reverts changes -->
                                        <button type="button" class="btn btn-default pull-left" id="join-modal-cancel" data-dismiss="modal">
                                            <span class="glyphicon glyphicon-remove"></span> Cancel
                                        </button>
                                        <?php // Step 1 ?>
                                        <button type="button" class="btn btn-primary step step-1" id="join-modal-next-1" data-step="2">
                                            Next <span class="glyphicon glyphicon-menu-right"></span>
                                        </button>
                                        <?php // Step 2 ?>
                                        <button type="button" class="btn btn-default step step-2" id="join-modal-back-2" data-step="1">
                                            <span class="glyphicon glyphicon-menu-left"></span> Back
                                        </button>
                                        <button type="button" class="btn btn-primary step step-2" id="join-modal-next-2" data-step="3">
                                            Next <span class="glyphicon glyphicon-menu-right"></span>
                                        </button>
                                        <?php // Step 3 ?>
                                        <button type="button" class="btn btn-default step step-3" id="join-modal-back-3" data-step="2">
                                            <span class="glyphicon glyphicon-menu-left"></span> Back
                                        </button>
                                        <button type="button" class="btn btn-success step step-3" id="join-modal-submit">
                                            Submit <span class="glyphicon glyphicon-ok"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </fieldset>

            <div id="column-select-div">
                <fieldset>
                    <legend>Columns</legend>
                    <div class="form-group">
                        <label class="control-label" for="column-list-container">Columns to display:</label>
                        <div class="text-muted" id="column-select-placeholder">
                            <span class="single-select">Select a table to continue.</span>
                            <span class="join-select hidden">Select tables and columns to continue.</span>
                        </div>
                        <div id="column-list-container">
                            <div class="single-select" id="single-column-list-container"></div>
                            <div class="join-select hidden" id="join-column-list-container"></div>
                        </div>
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

<?php // Import page-specific js libraries ?>
<script src="res/js/lib/multi-step-modal.js"></script>
<script src="res/js/lib/jquery.bootstrap-duallistbox.js"></script>
<script src="res/js/lib/html.sortable.js"></script>
</body>
</html>