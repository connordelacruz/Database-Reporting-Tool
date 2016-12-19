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

// TODO: set variable above this to tables
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


/* Executed on page load */

$(function () {
    getTables();
    populateTableSelect();


});