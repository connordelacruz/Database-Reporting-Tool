
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
                <?php // Single table select ?>
                <div class="form-group" id="single-table-div">
                    <div class="radio">
                        <label class="control-label radio-label" id="single-table-label">
                            <input type="radio" id="single-table-radio" name="select-type" value="single">
                            Single Table<span class="toggle--on">:</span>
                        </label>
                    </div>
                    <div class="table-collapse collapse" id="single-table-collapse">
                        <label class="sr-only" for="single-table-select">Select a Table:</label>
                        <select class="form-control table-select-input" id="single-table-select" name="single-table-select" required>
                            <option class="placeholder" value="" disabled selected>Select a table</option>
                        </select>
                    </div>
                </div>
                <?php // Join table select ?>
                <div class="form-group" id="join-table-div">
                    <div class="radio">
                        <label class="control-label radio-label" id="join-table-label">
                            <input type="radio" id="join-table-radio" name="select-type" value="join">
                            Join Tables<span class="toggle--on">:</span>
                        </label>
                    </div>
                    <div class="table-collapse collapse" id="join-table-collapse">
                        <div>
                            <span class="text-muted" id="join-table-details-placeholder">
                                No tables selected.
                            </span>
                            <span id="join-table-details-container"></span>
                        </div>
                        <button type="button" class="btn btn-block btn-default" id="join-table-modal-button" data-toggle="modal" data-target="#join-table-modal">
                            <span class="text-primary">Select Tables to Join</span>
                        </button>
                        <?php // Join table modal ?>
                        <div class="modal multi-step fade" id="join-table-modal" role="dialog" data-backdrop="static" data-keyboard="false">
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
                                                Click and drag the tables or use the <span class="glyphicon glyphicon-triangle-top"></span> and <span class="glyphicon glyphicon-triangle-bottom"></span> buttons to arrange them in the order they'll be joined:
                                            </label>
                                            <ul class="list-group sortable" id="join-table-order"></ul>
                                        </fieldset>
                                    </div>
                                    <div class="modal-body step step-3" data-step="3">
                                        <fieldset>
                                            <legend>3. Select Fields to Join On</legend>
                                            <label class="control-label">Select the fields to join on and join types:</label>
                                            <div class="panel panel-default join-table-panel">
                                                <div class="panel-body">
                                                    <table class="table table-condensed join-table">
                                                        <tbody id="join-table-body"></tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </fieldset>
                                    </div>
                                    <div class="modal-footer" id="join-table-modal-footer">
                                        <!-- TODO: add listener that reverts changes? -->
                                        <button type="button" class="btn btn-default pull-left" id="join-table-modal-cancel" data-dismiss="modal">
                                            <span class="glyphicon glyphicon-remove"></span> Cancel
                                        </button>
                                        <?php // Step 1 ?>
                                        <button type="button" class="btn btn-primary step step-1" id="join-table-modal-next-1" data-step="2">
                                            Next <span class="glyphicon glyphicon-menu-right"></span>
                                        </button>
                                        <?php // Step 2 ?>
                                        <button type="button" class="btn btn-default step step-2" id="join-table-modal-back-2" data-step="1">
                                            <span class="glyphicon glyphicon-menu-left"></span> Back
                                        </button>
                                        <button type="button" class="btn btn-primary step step-2" id="join-table-modal-next-2" data-step="3">
                                            Next <span class="glyphicon glyphicon-menu-right"></span>
                                        </button>
                                        <?php // Step 3 ?>
                                        <button type="button" class="btn btn-default step step-3" id="join-table-modal-back-3" data-step="2">
                                            <span class="glyphicon glyphicon-menu-left"></span> Back
                                        </button>
                                        <button type="button" class="btn btn-success step step-3" id="join-table-modal-submit">
                                            Submit <span class="glyphicon glyphicon-ok"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </fieldset>

            <?php // Column select ?>
            <?php // TODO: rename column-select* to column-list* for clarity/consistency? ?>
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