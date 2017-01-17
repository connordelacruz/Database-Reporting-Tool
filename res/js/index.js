/**
 * Various ajax queries used to communicate with the database
 */

/* Variables */

// Array of table names from the database
var tables;
// Currently selected table
var currentTable;
// Columns in currently selected table
var columns;
// TODO: store array of columns by table for quicker access in same session?

// Spinning icon to display while loading
var loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle id="loader-circle" class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg></div>';

/* Functions */


function loadTableSelect() {
    $('#table-select-div').html(loader);
}


/**
 * Gets a list of accessible tables from database and calls populateTableSelect() on success
 */
function getTables() {
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
 * Populates #table-select with options containing table names. This function is called on success of getTables()
 */
function populateTableSelect() {
    // The div where all of these will be inserted
    var tableSelectDiv = $('#table-select-div');
    // the label for #table-select
    var tableSelectLabel = '<label class="control-label" for="table-select">Table:</label>';
    // The table select element
    // var tableSelect = $('#table-select');
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
        currentTable = $(this).find(':selected').val();
        getColumns(currentTable);
    });

    // tableSelect is disabled until populated with tables
    // tableSelect.prop('disabled', false);
    // Add the elements to the page
    tableSelectDiv.html(tableSelectLabel);
    tableSelectDiv.append(tableSelect);
}


/**
 * Gets a list of columns from the table and calls populateColumnSelect() on success
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
            columns = data.text;
            // display columns on the page
            populateColumnSelect();
        }
    });
}


/**
 * Populates #column-select with checkboxes containing column names. This function is called on success of getColumns()
 */
function populateColumnSelect() {
    // For each column, add an option to #column-select
    var columnSelect = $('#column-select');
    // Add select all button and clear out column names from previous table
    columnSelect.html('<div class="checkbox"><label><input type="checkbox" id="column-select-all">Select All</label></div>');
    for(var i = 0; i < columns.length; i++) {
        var option = '<div class="checkbox"><label><input type="checkbox" name="columns[]" class="column-option" value="' + columns[i] + '">' + columns[i] + '</label></div>';
        columnSelect.append(option);
    }
    // Add listener to column-select-all
    $('#column-select-all').change(function () {
        $('.column-option').prop('checked', $(this).prop('checked'));
    });
    // Add listeners to all .column-option checkboxes to uncheck #column-select-all if one of them is changed
    $('.column-option').change(function () {
       if ($(this).prop('checked') == false) {
           $('#column-select-all').prop('checked', false);
       }
       if ($('.column-option:checked').length == $('.column-option').length) {
           $('#column-select-all').prop('checked', true);
       }
    });

    // re-enable #generate-report
    $('#generate-report').prop('disabled', false);
}


/**
 * Removed column select options, display loader, and disables #generate-report. Used when a new table is selected
 */
function clearColumnSelect() {
    // disable report generator button
    $('#generate-report').prop('disabled', true);
    // clear column options and display loading icon
    $('#column-select').html(loader);
}


/* Executed on page load */

$(function () {
    // display loading icon while table select is populated
    loadTableSelect();
    // retrieve the table names and add them to #table-select
    getTables();

    // Add listener to #table-select
    /*var tableSelect = $('#table-select');
     tableSelect.change(function () {
     // expand column select div
     $('#column-select-div').collapse('show');
     // clear any existing options and show loader
     clearColumnSelect();
     currentTable = $(this).find(':selected').val();
     getColumns(currentTable);
     });*/
});