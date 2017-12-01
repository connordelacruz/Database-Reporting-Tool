/**
 * JavaScript for index page
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

// Array of TableDataObjects for the currently selected tables. Indexed by the id of the select element
var selectedTables = {};

// TODO: organize state variables (object prototype?)

// Current select-type (single or join)
var selectType;

// Keep track of # of joined tables for name attributes
var joinIndex = 0;

// For storing and restoring state when switching between select types
var maxRowCount = {
    'single' : 0,
    'join' : 0
};

/* Functions */

/**
 * Gets a list of accessible tables from database and calls populateTableSelects() on success
 */
function getTables() {
    // disable table inputs and show loader
    $('#table-fieldset').find(':input').prop('disabled', true);
    var tableLoaderDiv = $('#table-loader-div');
    tableLoaderDiv.html(loader);

    // Callback functions for ajax
    var callbacks = new AjaxCallbacks();
    callbacks.success = function (data) {
        // Check if a server-side error was thrown and stop execution if so
        if(data.error !== undefined) {
            displayError(data.error, true);
            tableLoaderDiv.html('');
        }
        else {
            tables = data.text;
            // Display these tables on the page
            populateTableSelects();
        }
    };
    callbacks.error = function (jqXHR) {
        // If an error occurred before the server could respond, display message and stop execution
        displayError(jqXHR.responseText, true);
    };
    callbacks.complete = function () {
        // Hide loader
        tableLoaderDiv.html('');
    };

    getTablesAjax(callbacks);
}


/**
 * Populates #table-select with options containing table names.
 * This function is called on success of getTables().
 */
function populateTableSelects() {
    // The table select elements
    var tableSelectInputs = $('.table-select-input');

    // Add tables to select inputs
    var optionsString = buildTableOptions(tables);
    tableSelectInputs.append(optionsString);

    // Add listener to single table select
    // TODO: extract to function
    $('#table-select').change(function () {
        var tableName = $(this).find(':selected').val();
        if (tableName !== '') {
            // clear any existing options and show loader
            clearColumnList(true);
            showColumnSelectPlaceholder(false);
            // clear any error messages previously displayed
            clearError();
            var selectIndex = $(this).attr('id');
            selectedTables[selectIndex] = new TableDataObject(tableName);

            // Populate column list once columns are retrieved
            var getColumnsCallback = function () {
                populateColumnList(selectIndex);
            };
            getColumns(selectIndex, getColumnsCallback);
        }
    });

    // Add listener to join table selects
    var table1Select = $('#join-table1-select');
    table1Select.change(joinTableSelectListener('#join-column1-select'));
    var table2Select = $('#join-table2-select');
    table2Select.change(joinTableSelectListener('#join-column2-select'));

    // Add listeners to join column selects
    $('.join-column-select').change(joinColumnSelectListener);

    // Enable radio buttons and select single table as default
    $('input[name="select-type"]').prop('disabled', false);
    $('#select-table-radio').prop('checked', true).change();
}


/**
 * Generates an onchange listener function for a join table select
 * @param columnSelectId id of the corresponding column select
 * @returns {Function} onchange listener for the table select
 */
function joinTableSelectListener(columnSelectId) {
    return function () {
        var tableName = $(this).find(':selected').val();
        var selectIndex = $(this).attr('id');
        selectedTables[selectIndex] = new TableDataObject(tableName);
        // Populate column select once columns are retrieved
        var getColumnsCallback = function () {
            var table = selectedTables[selectIndex];
            var optionsString = buildColumnOptions(table);
            $(columnSelectId).html(optionsString)
                .prop('disabled', false);
        };
        // Get columns for selected table
        getColumns(selectIndex, getColumnsCallback);
    }
}


/**
 * onchange listener function for join column selects.
 * Checks to see if all required fields for a join are filled. If they are,
 * populate column list
 */
// TODO: Use a submit button instead of ajax? it may get messy with 3+ tables
function joinColumnSelectListener() {
    // If all required fields for join are filled, populate column list
    var joinFields = $('#table-join-collapse').find('select:required');
    var fieldsValidated = true;
    joinFields.each(function () {
        if ($(this).find(':selected').val() === '') {
            return fieldsValidated = false;
        }
    });
    if (fieldsValidated) {
        // Retrieve an array of table select input ids (used as indices in selectedTables)
        var selectIndices = joinFields.filter('.table-select-input')
            .map(function() { return this.id }).get();
        // TODO: show loader
        populateTableJoinColumnList(selectIndices);
    }
    // else show placeholder in column list container
    else {
        showColumnSelectPlaceholder(true);
    }
}


/**
 * Increment joinIndex and append a row to the join table
 */
function addJoinTableRow() {
    // Increment joinIndex
    joinIndex++;
    // Build new join row and append
    var joinTableRow = buildJoinTableRow(joinIndex, tables);
    $('#join-table-body').append(joinTableRow);
    // Update submit button state
    refreshSubmitButtonState();
}


/**
 * Gets a list of columns from the table and calls populateColumnList() on success.
 * If the table is not valid, then connection_handler.php sets data.error. If data.error is defined, then an error
 * message is displayed and populateColumnList() is not called.
 * @param selectIndex Index in selectedTables
 * @param callbackFunction Function to call on success (i.e. function to populate column list)
 */
function getColumns(selectIndex, callbackFunction) {
    var table = selectedTables[selectIndex].name;

    // Callback functions for ajax
    var callbacks = new AjaxCallbacks();
    callbacks.success = function (data) {
        // if data.err is set, then display something in #error-div
        if (data.error !== undefined) {
            displayError(data.error);
            // clear loader from column list container
            clearColumnList(false);
        }
        else {
            selectedTables[selectIndex].columns = data.text;
            // get the total number of rows and set #row-limit max
            selectedTables[selectIndex].rowCount = data['rowCount'];

            // Execute callback function if defined
            if (callbackFunction !== undefined)
                callbackFunction();
        }
    };
    callbacks.error = function (jqXHR) {
        // If an error occurred before the server could respond, display message and stop execution
        displayError(jqXHR.responseText, true);
        // clear loader from column list container
        clearColumnList(false);
    };

    getColumnsAjax(table, callbacks);
}


/**
 * Set the max value for the row limit input and update maxRowCount
 * @param maxRows Max number of rows for the row limit field. If maxRows < 1 evaluates to true, remove the max
 * attribute and set a generic placeholder.
 */
function setRowLimitMax(maxRows) {
    // Update input
    setRowLimitInputMax(maxRows);
    // Set global variable for restoring state
    maxRowCount[selectType] = maxRows;
}


/**
 * Populates column list container with checkboxes containing column names. Additionally, sets the max row limit to the
 * row count of the selected table.
 * This function is called on success of getColumns().
 * @param selectIndex Index in selectedTables
 */
function populateColumnList(selectIndex) {
    var columnListContainer = buildColumnList(selectedTables[selectIndex]);
    $('#single-column-list-container').html(columnListContainer);

    setRowLimitMax(selectedTables[selectIndex].rowCount);

    refreshFormState();
}


/**
 * Populate column list container with checkboxes containing columns for each table in the join. Additionally, keeps
 * track of the row count of the joined table with the greatest row count and sets the max row limit accordingly.
 * @param selectIndices Array of indices into selectedTables
 */
function populateTableJoinColumnList(selectIndices) {
    // For each table select index, build a column list
    var columnListContainer = $('<div></div>');
    // Keep track of the row limit
    var joinMaxRows = 0;
    $.each(selectIndices, function (i, selectIndex) {
        if (selectedTables[selectIndex].rowCount > joinMaxRows)
            joinMaxRows = selectedTables[selectIndex].rowCount;
        var columnList = buildColumnList(selectedTables[selectIndex], true);
        columnListContainer.append(columnList);
    });
    $('#join-column-list-container').html(columnListContainer);
    setRowLimitMax(joinMaxRows);

    refreshFormState();
}


/**
 * Set the selectType global variable and update UI accordingly
 * @param {string} type The select type to set it to (i.e. value of the radio button)
 */
function setSelectType(type) {
    // Update global variable
    selectType = type;

    var isSelect = selectType === 'single';
    // (don't need this variable, but using it for readability's sake)
    var isJoin = !isSelect;

    // Toggle collapsed state of select container and disabled state of its form elements
    $('#table-select-collapse').collapse(isSelect ? 'show' : 'hide')
        .find(':input').prop('disabled', !isSelect);
    $('#table-join-collapse').collapse(isJoin ? 'show' : 'hide')
        .find(':input').prop('disabled', !isJoin);

    // Toggle visibility of elements specific to radio state
    $('.join-select').toggleClass('hidden', !isJoin)
        .find(':input').prop('disabled', !isJoin);
    $('.single-select').toggleClass('hidden', !isSelect)
        .find(':input').prop('disabled', !isSelect);

    // Update state of form elements
    refreshPlaceholderState();
    refreshSubmitButtonState();

    // Set row limit max
    setRowLimitMax(maxRowCount[selectType]);
}


/* Executed on page load */

$(function () {

    // Add listener that toggles collapse state depending on which radio is selected
    $('input[name="select-type"]').change(
        function () {
            // Set select type to
            setSelectType($('input[name="select-type"]:checked').val());
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

    // TODO: style <select>s differently if placeholder option is selected
    /*$('select').each(function () {
        // Set the placeholder class on selects where the currently selected value is an empty string
        $(this).toggleClass('placeholder', $(this).find(':selected').val() === '');
        // TODO: add listener to remove placeholder class on change
    });*/

    // Add listeners to multi-step modal buttons
    var joinModal = $('#join-modal');
    joinModal.find('button.step').each(function () {
        $(this).click(function () {
            modalStep(joinModal, $(this).data('step'));
        });
    });

    // Add listener to the add table button
    $('#join-add-table').click(function () {
        event.preventDefault();
        addJoinTableRow();
    });

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

    getTables();
});