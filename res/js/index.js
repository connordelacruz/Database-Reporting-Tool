/**
 * Various ajax queries used to communicate with the database
 */

/* Variables */

// Array of table names from the database
var tables;


/* Functions */

function getTables() {
    $.ajax({
        type: "POST",
        url: "connection_handler.php",
        data: {'function' : 'getTables'},
        dataType: "json",
        success: function (data) {
            tables = data.text;
        }
    });
}


function populateTableSelect() {
    // If the ajax query in getTables() hasn't received the data yet, try again in 1000ms
    if (tables === undefined) {
        setTimeout(populateTableSelect, 1000);
        return;
    }

    // For each table, add an option to #table-select
    var tableSelect = $('#table-select');
    for (var i = 0; i < tables.length; i++) {
        var option = "<option name='table' value='" + tables[i] + "'>" + tables[i] + "</option>";
        tableSelect.append(option);
    }
}


function getColumns(table) {
    // TODO: expand #column-select-div and show loading spinner?

    $.post("connection_handler.php", 
        {
            table: table,
            function: 'getColumns'
        },
        function (data) {
            // TODO: columns should be returned in data

        });
}

/* Executed on page load */

$(function () {
    // retrieve the table names and add them to #table-select
    getTables();
    populateTableSelect();

    // Add onsubmit listener to table select form
    var tableSelectForm = $('#table-select-form');

    tableSelectForm.submit(function (event) {
        event.preventDefault();

        var tableSelect = $('#table-select');

        // hide submit button and disable the select field
        $('#table-submit-div').collapse('hide');
        tableSelect.prop('disabled', true);

        // get the selected table name
        var table = tableSelect.find(':selected').text();

        // get the columns for this table
        getColumns(table);

    });
});