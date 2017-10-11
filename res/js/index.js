/**
 * Various ajax queries used to communicate with the database
 * @author Connor de la Cruz
 */

/* Objects */

/**
 * Object representing table data
 * @param name Name of the table
 * @param columns List of columns
 * @param rowCount Number of rows
 */
function TableDataObject(name, columns, rowCount) {
    this.name = name;
    this.columns = columns;
    this.rowCount = rowCount;
}

/* Variables */

// Array of table names from the database
var tables;

// TableDataObject for the currently selected table
// TODO: use selectedTables[0] instead
var selectedTable;

// Array of TableDataObjects for the currently selected tables for join statement. [0] = first table, [1] = second table
var selectedTables;

// Spinning icon to display while loading
var loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle id="loader-circle" class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg></div>';


/* Functions */

/**
 * Gets a list of accessible tables from database and calls populateTableSelect() on success
 */
function getTables() {
    // display loading icon while table select is populated
    var tableLoaderDiv = $('#table-loader-div');
    tableLoaderDiv.html(loader);
    $.ajax({
        type: "POST",
        url: "handler/connection_handler.php",
        data: {'function' : 'getTables'},
        dataType: "json",
        success: function (data) {
            // Check if a server-side error was thrown and stop execution if so
            if(data.error !== undefined) {
                displayError(data.error, true);
                tableLoaderDiv.html('');
            }
            else {
                tables = data.text;
                // Display these tables on the page
                populateTableSelect();
            }
        },
        error: function (jqXHR) {
            // If an error occurred before the server could respond, display message and stop execution
            displayError(jqXHR.responseText, true);
        },
        complete: function () {
            // Hide loader
            tableLoaderDiv.html('');
        }
    });
}


/**
 * Populates #table-select with options containing table names.
 * This function is called on success of getTables().
 */
function populateTableSelect() {
    // The table select elements
    var tableSelectInputs = $('.table-select-input');

    // Add tables to select inputs
    for (var i = 0; i < tables.length; i++) {
        var option = "<option name='table' value='" + tables[i] + "'>" + tables[i] + "</option>";
        tableSelectInputs.append(option);
    }

    // Add listener to single table select
    $('#table-select').change(function () {
        // clear any existing options and show loader
        clearColumnSelect();
        // clear any error messages previously displayed
        clearError();
        var tableName = $(this).find(':selected').val();
        selectedTable = new TableDataObject(tableName);
        // TODO: set join table 1 to match
        getColumns(tableName);
    });

    // TODO: add listener to join table selects
    var table1Select = $('#join-table1-select');
    var table2Select = $('#join-table2-select');
}


/**
 * Gets a list of columns from the table and calls populateColumnSelect() on success.
 * If the table is not valid, then connection_handler.php sets data.error. If data.error is defined, then an error
 * message is displayed and populateColumnSelect() is not called.
 * @param table The table to get columns from
 * @param selectIndex Index in selectedTables
 */
// TODO: extend to work with join feature
function getColumns(table, selectIndex) {
    $.ajax({
        type: "POST",
        url: "handler/connection_handler.php",
        data: {
            'table': table,
            'function': 'getColumns'
        },
        dataType: "json",
        success: function (data) {
            // if data.err is set, then display something in #error-div
            if (data.error !== undefined) {
                displayError(data.error);
                // clear loader from #column-select
                $('#column-select').html('');
            }
            else {
                selectedTable.columns = data.text;
                // get the total number of rows and set #row-limit max
                selectedTable.rowCount = data['rowCount'];
                $('#row-limit').attr({
                    'max': selectedTable.rowCount,
                    'placeholder': 'Number of rows to display (max ' + selectedTable.rowCount + ')'
                });
                // display columns on the page
                populateColumnSelect();
            }
        },
        error: function (jqXHR) {
            // If an error occurred before the server could respond, display message and stop execution
            displayError(jqXHR.responseText, true);
            // clear loader from #column-select
            $('#column-select').html('');
        }
    });
}


/**
 * Populates #column-select with checkboxes containing column names.
 * This function is called on success of getColumns().
 */
function populateColumnSelect() {
    // For each column, add an option to #column-select
    var columnSelect = $('#column-select');
    // Add select all button and clear out column names from previous table
    columnSelect.html('<div class="checkbox"><label><input type="checkbox" id="column-select-all" checked><b>Select All</b></label></div>');
    for(var i = 0; i < selectedTable.columns.length; i++) {
        var option = '<div class="checkbox"><label><input type="checkbox" name="columns[]" class="column-option" value="' + selectedTable.columns[i] + '" checked>' + selectedTable.columns[i] + '</label></div>';
        columnSelect.append(option);
    }
    // Add listener to column-select-all
    $('#column-select-all').change(function () {
        // set all options to match the check property of the select all button
        $('.column-option').prop('checked', $(this).prop('checked'));
        // if nothing is checked, submit buttons should be disabled
        $('button[type=submit]').prop('disabled', !$(this).prop('checked'));
    });

    // Add listeners to all .column-option checkboxes to uncheck #column-select-all if one of them is changed
    $('.column-option').change(function () {
        // uncheck select all if this gets unchecked
        if ($(this).prop('checked') === false) {
            $('#column-select-all').prop('checked', false);
            // Disable submit buttons if nothing is checked
            if ($('.column-option:checked').length === 0) {
                $('button[type=submit]').prop('disabled', true);
            }
        }
        // if this was checked, re-enable submit buttons
        else {
            $('button[type=submit]').prop('disabled', false);
            // if everything else is checked, then set select all to checked
            if ($('.column-option:checked').length === $('.column-option').length) {
                $('#column-select-all').prop('checked', true);
            }
        }
    });

    // re-enable generate and export buttons
    $('#generate-report').prop('disabled', false);
    $('#export-csv').prop('disabled',false);
}


/**
 * Removed column select options, display loader, and disables #generate-report. Used when a new table is selected
 */
function clearColumnSelect() {
    // disable report generator button
    $('#generate-report').prop('disabled', true);
    $('#export-csv').prop('disabled',true);
    // clear column options and display loading icon
    $('#column-select').html(loader);
}


/**
 * Displays an alert in #error-div
 * @param message The message to display
 * @param isUndismissable Optional boolean. If true, no dismiss button will be appended to error. This is for instances
 *         where no action can be taken by the user (e.g. can't populate table list).
 */
function displayError(message, isUndismissable) {
    var alertDiv = $('<div class="alert alert-danger alert-dismissable fade in"></div>');
    if (!isUndismissable) {
        alertDiv.append('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
    }
    alertDiv.append(message);
    $('#error-div').html(alertDiv);
}


/**
 * clears out #error-div
 */
function clearError() {
    $('#error-div').html('');
}


/* Executed on page load */

$(function () {

    // Add listener that toggles collapse state depending on which radio is selected
    $('input[name="select-type"]').change(
        function () {
            // Determine which radio is checked (select or join)
            var isSelect = $('input[name="select-type"]:checked').val() === 'select';
            // (don't need this variable, but using it for readability's sake)
            var isJoin = !isSelect;
            $('#table-select-collapse').collapse(isSelect ? 'show' : 'hide')
                .find(':input').prop('disabled', !isSelect);
            $('#table-join-collapse').collapse(isJoin ? 'show' : 'hide')
                .find(':input').prop('disabled', !isJoin);

            // TODO: update select fields/columns section on expanding
        });

    // Disable radio buttons while collapsing
    $('.table-collapse')
        .on('show.bs.collapse hide.bs.collapse',
            function (e) {
                e.stopPropagation();
                $('input[name="select-type"]').prop('disabled', true);
            }
        )
        .on('shown.bs.collapse hidden.bs.collapse',
            function () {
                $('input[name="select-type"]').prop('disabled', false);
            }
        );

    // Add listener to expand/collapse advanced options
    var advOptLegend = $('#legend-advanced-options');
    var advOptCollapse = $('#collapse-advanced-options');

    advOptLegend.click(function () {
        advOptCollapse.collapse('toggle');
    });

    // Rotate chevron when div is collapsing/expanding
    advOptCollapse.on('show.bs.collapse hide.bs.collapse', function () {
        advOptLegend.toggleClass('expanded');
    });

    // Add listener to toggles for advanced options to enable/disable and clear their respective fields
    var rowToggle = $('#toggle-row-limit');
    var rowCollapse = $('#collapse-row-limit');
    var rowLimitInput = $('#row-limit');

    rowToggle.change(function () {
        var action = $(this).prop('checked') ? 'show' : 'hide';
        rowCollapse.collapse(action);
        rowLimitInput.prop('disabled', !$(this).prop('checked'));
        rowLimitInput.val('');
    });

    // Disable the toggle until collapse div is fully collapsed or expanded
    rowCollapse.on('show.bs.collapse hide.bs.collapse', function (e) {
        e.stopPropagation();
        rowToggle.prop('disabled', true);
    });
    rowCollapse.on('shown.bs.collapse hidden.bs.collapse', function () {
        rowToggle.prop('disabled', false);
    });

    // retrieve the table names and add them to #table-select
    getTables();
});