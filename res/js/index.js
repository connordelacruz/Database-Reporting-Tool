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
    // TODO: remove commented code. populateTableSelect() is called when getTables() finishes
    // If the ajax query in getTables() hasn't received the data yet, try again in 1000ms
    /*if (tables === undefined) {
        setTimeout(populateTableSelect, 1000);
        return;
    }*/

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
    // TODO: expand #column-select-div and show loading spinner?

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
    var columnSelect = $('#column-select'); // TODO: display issues, wrap in a clearfix div?
    for(var i = 0; i < columns.length; i++) {
        //var option = "<option name='column' value='" + columns[i] + "'>" + columns[i] + "</option>";
        var option = '<div class="checkbox"><label><input type="checkbox" value="' + columns[i] + '">' + columns[i] + '</label></div>';
        columnSelect.append(option);
    }
    // To fix issues with the content extending outside the div
    columnSelect.append('<div class="clearfix"></div>');
    // columnSelect is disabled until populated with column names
    // columnSelect.prop('disabled', false); TODO: no longer an input object, remove disable/enable stuff
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
});