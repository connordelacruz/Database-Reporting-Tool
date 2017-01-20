/**
 * Various ajax queries used to communicate with the database
 * @author Connor de la Cruz
 */

/* Variables */

// Array of table names from the database
var tables;
// Currently selected table
var currentTable;
// Columns in currently selected table
var columns;

// Spinning icon to display while loading
var loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle id="loader-circle" class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg></div>';


/* Functions */

/**
 * clears #table-select-div contents and displays loader. Called on page load before retrieving tables.
 */
function loadTableSelect() {
    $('#table-select-div').html(loader);
}


/**
 * Gets a list of accessible tables from database and calls populateTableSelect() on success
 */
function getTables() {
    // display loading icon while table select is populated
    loadTableSelect();
    $.ajax({
        type: "POST",
        url: "connection_handler.php",
        data: {'function' : 'getTables'},
        dataType: "json",
        success: function (data) {
            tables = data.text;
            // Display these tables on the page
            populateTableSelect();
        }
    });
}


/**
 * Populates #table-select with options containing table names.
 * This function is called on success of getTables().
 */
function populateTableSelect() {
    // The div where all of these will be inserted
    var tableSelectDiv = $('#table-select-div');
    // the label for #table-select
    var tableSelectLabel = '<label class="control-label" for="table-select">Table:</label>';
    // The table select element
    var tableSelect = $('<select class="form-control" id="table-select" name="table-select" required></select>');

    // add placeholder text
    tableSelect.append('<option id="placeholder" value="" disabled selected>Select a table</option>');

    for (var i = 0; i < tables.length; i++) {
        var option = "<option name='table' value='" + tables[i] + "'>" + tables[i] + "</option>";
        tableSelect.append(option);
    }
    // Add listener to table select
    tableSelect.change(function () {
        // expand column select div
        $('#column-select-div').collapse('show');
        // clear any existing options and show loader
        clearColumnSelect();
        // clear any error messages previously displayed
        clearError();
        currentTable = $(this).find(':selected').val();
        getColumns(currentTable);
    });

    // Add the elements to the page
    tableSelectDiv.html(tableSelectLabel);
    tableSelectDiv.append(tableSelect);
}


/**
 * Gets a list of columns from the table and calls populateColumnSelect() on success.
 * If the table is not valid, then connection_handler.php sets data.error. If data.error is defined, then an error
 * message is displayed and populateColumnSelect() is not called.
 * @param table The table to get columns from
 */
function getColumns(table) {
    $.ajax({
        type: "POST",
        url: "connection_handler.php",
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
            columns = data.text;
            // display columns on the page
            populateColumnSelect();
            }
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
    for(var i = 0; i < columns.length; i++) {
        var option = '<div class="checkbox"><label><input type="checkbox" name="columns[]" class="column-option" value="' + columns[i] + '" checked>' + columns[i] + '</label></div>';
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
        if ($(this).prop('checked') == false) {
            $('#column-select-all').prop('checked', false);
            // Disable submit buttons if nothing is checked
            if ($('.column-option:checked').length == 0) {
                $('button[type=submit]').prop('disabled', true);
            }
        }
        // if this was checked, re-enable submit buttons
        else {
            $('button[type=submit]').prop('disabled', false);
            // if everything else is checked, then set select all to checked
            if ($('.column-option:checked').length == $('.column-option').length) {
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
 */
function displayError(message) {
    var alertString = '<div class="alert alert-danger alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>' + message + '</div>';
    $('#error-div').html(alertString);
}


/**
 * clears out #error-div
 */
function clearError() {
    $('#error-div').html('');
}


/* Executed on page load */

$(function () {
    // retrieve the table names and add them to #table-select
    getTables();
});