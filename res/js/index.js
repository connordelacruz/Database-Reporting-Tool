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


/* Functions */

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


function populateTableSelect() {
    // For each table, add an option to #table-select
    var tableSelect = $('#table-select');
    for (var i = 0; i < tables.length; i++) {
        var option = "<option name='table' value='" + tables[i] + "'>" + tables[i] + "</option>";
        tableSelect.append(option);
    }
    // tableSelect is disabled until populated with tables
    tableSelect.prop('disabled', false);
}


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


function populateColumnSelect() {
    // For each column, add an option to #column-select
    var columnSelect = $('#column-select');
    // Add select all button and clear out column names from previous table
    columnSelect.html('<div class="checkbox"><label><input type="checkbox" id="column-select-all">Select All</label></div>');
    for(var i = 0; i < columns.length; i++) {
        var option = '<div class="checkbox"><label><input type="checkbox" name="column-option[]" class="column-option" value="' + columns[i] + '">' + columns[i] + '</label></div>';
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

    // expand column select div
    $('#column-select-div').collapse('show');
}


/* Executed on page load */

$(function () {
    // retrieve the table names and add them to #table-select
    getTables();

    // Add listener to #table-select
    var tableSelect = $('#table-select');
    tableSelect.change(function () {
        currentTable = $(this).find(':selected').val();
        getColumns(currentTable);
    });
});