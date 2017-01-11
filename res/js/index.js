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

    // Add onsubmit listener to table select form
    var tableSelectForm = $('#table-select-form');

    tableSelectForm.submit(function (event) {
        event.preventDefault();

        var tableSelect = $('#table-select');

        // hide submit button and disable the select field
        $('#table-submit-div').collapse('hide');
        tableSelect.prop('disabled', true);

        // get the selected table name
        currentTable = tableSelect.find(':selected').text();

        // get the columns for this table
        getColumns(currentTable);
    });

    // Add onsubmit listener to column select form
    var columnSelectForm = $('#column-select-form');

    /*columnSelectForm.submit(function (event) {
        event.preventDefault();

        // get the checked fields
        var checked = [];
        $('.column-option:checked').each(function () {
            checked.push($(this).val());
        });

        // TODO: generate report
    });*/
});