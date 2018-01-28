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

// Current select-type (single or join)
var selectType;

// TableDataObject for currently selected table
var selectedTable;

// Array of TableDataObjects for the currently selected tables to be joined
var joinTables = {};

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
            tables = data['tables'];
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
 * Populates #single-table-select with options containing table names.
 * This function is called on success of getTables().
 */
function populateTableSelects() {
    // The table select elements
    var tableSelectInputs = $('.table-select-input');

    // Add tables to select inputs
    var optionsString = buildTableOptions(tables);
    tableSelectInputs.append(optionsString);

    // Add listener to single table select
    $('#single-table-select').change(singleTableSelectListener);

    // Refresh dual listbox for joins
    $('#join-table-duallist').bootstrapDualListbox('refresh');

    // Enable radio buttons and select single table as default
    $('input[name="select-type"]').prop('disabled', false);
    $('#single-table-radio').prop('checked', true).change();
}


/**
 * onchange event listener function for the single table select
 */
function singleTableSelectListener() {
    var tableName = $(this).find(':selected').val();
    if (tableName !== '') {
        // clear any existing options and show loader
        clearColumnList(true);
        showColumnSelectPlaceholder(false);
        // clear any error messages previously displayed
        clearError();
        selectedTable = new TableDataObject(tableName);

        // Populate column list once columns are retrieved
        var getColumnsCallback = function () {
            populateColumnList();
        };
        getColumns(getColumnsCallback);
    }
}


/**
 * onchange listener function for join column selects.
 * Checks to see if all required fields for a join are filled. If they are,
 * populate column list
 */
function joinColumnSelectListener() {
    // If all required fields for join are filled, populate column list
    var joinFields = $('#join-table-body').find('select:required');
    var fieldsValidated = true;
    joinFields.each(function () {
        if ($(this).find(':selected').val() === '') {
            return fieldsValidated = false;
        }
    });
    if (fieldsValidated) {
        disableJoinModalSubmit(false);
    }
    // else show placeholder in column list container
    else {
        showColumnSelectPlaceholder(true);
    }
}


/**
 * Gets a list of columns from the table and calls callbackFunction on success.
 * If the table is not valid, then connection_handler.php sets data.error. If data.error is defined, then an error
 * message is displayed and populateColumnList() is not called.
 * @param callbackFunction Function to call on success (i.e. function to populate column list)
 */
function getColumns(callbackFunction) {
    var table = selectedTable.name;

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
            selectedTable.columns = data[selectedTable.name]['columns'];
            // get the total number of rows and set #row-limit max
            selectedTable.rowCount = data[selectedTable.name]['rowCount'];

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

    getColumnsAjax([table], callbacks);
}




/**
 * Gets a list of columns and row counts for each table in joinTables and calls callbackFunction on success
 * @param callbackFunction Function to call on success (i.e. function to populate column list)
 */
function getColumnsBatch(callbackFunction) {
    var tableNames = [];
    $.each(joinTables, function (i, table) {
        tableNames[i] = table.name;
    });

    // Callback functions for ajax
    var callbacks = new AjaxCallbacks();
    callbacks.success = function (data) {
        // if data.err is set, then display something in #error-div
        if (data.error !== undefined) {
            displayError(data.error);
        }
        else {
            $.each(joinTables, function (i, table) {
                joinTables[i].columns = data[table.name]['columns'];
                joinTables[i].rowCount = data[table.name]['rowCount'];
            });

            // Execute callback function if defined
            if (callbackFunction !== undefined)
                callbackFunction();
        }
    };
    callbacks.error = function (jqXHR) {
        // If an error occurred before the server could respond, display message and stop execution
        displayError(jqXHR.responseText, true);
    };

    getColumnsAjax(tableNames, callbacks);
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
 */
function populateColumnList() {
    var columnListContainer = buildColumnList(selectedTable);
    $('#single-column-list-container').html(columnListContainer);

    setRowLimitMax(selectedTable.rowCount);

    refreshFormState();
}


/**
 * Populate column list container with checkboxes containing columns for each table in the join. Additionally, keeps
 * track of the row count of the joined table with the greatest row count and sets the max row limit accordingly.
 */
function populateTableJoinColumnList() {
    // For each table select index, build a column list
    var columnListContainer = $('<div></div>');
    // Keep track of the row limit
    var joinMaxRows = 0;
    $.each(joinTables, function (i, table) {
        if (table.rowCount > joinMaxRows)
            joinMaxRows = table.rowCount;
        var columnList = buildColumnList(table, true);
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
    $('#single-table-collapse').collapse(isSelect ? 'show' : 'hide')
        .find(':input').prop('disabled', !isSelect);
    $('#join-table-collapse').collapse(isJoin ? 'show' : 'hide')
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

    // Add listeners to multi-step modal buttons
    var joinModal = $('#join-table-modal');
    joinModal.find('button.step').each(function () {
        $(this).click(function () {
            modalStep(joinModal, $(this).data('step'));
        });
    });
    joinModal.on('show.bs.modal', function () {
        // Refresh disabled state of step 1 next button
        $('#join-table-modal-next-1').prop('disabled', $('#join-table-duallist').change());
    });

    // Initialize dual listbox
    $('#join-table-duallist').bootstrapDualListbox({
        selectedListLabel: 'Selected:',
        nonSelectedListLabel: 'Table List:',
        hideMoveAll: true,
        selectorMinimalHeight: 200,
        infoText: '',
        infoTextEmpty: ''
    }).change(function () {
        $('#join-table-modal-next-1').prop('disabled', $(this).val().length < 2);
    });

    // Initialize sortable
    sortable('#join-table-order', {
        placeholder: '<li class="list-group-item sortable-placeholder"></li>',
        forcePlaceholderSize: true
    });

    // Add listeners and initial configurations to join modal buttons
    // First Next button
    $('#join-table-modal-next-1').click(function () {
        updateJoinTableOrderList($('#join-table-duallist').val());
    });
    // Second Next button
    $('#join-table-modal-next-2').click(function () {
        event.preventDefault();
        disableJoinModalButtons(true);
        // Update global variable with table order and get columns
        joinTables = getJoinTableOrder();
        // Update join table on success
        var getColumnsBatchCallback = function () {
            updateJoinTable(joinTables);
            disableJoinModalButtons(false);
            // Fields will need to be filled after this, so submit should be disabled
            disableJoinModalSubmit(true);
            modalStep('#join-table-modal', 3);
        };
        getColumnsBatch(getColumnsBatchCallback);
    });
    // Submit button
    $('#join-table-modal-submit').click(function () {
        $('#join-table-modal').modal('hide');
        updateJoinTableDetails(joinTables);

        populateTableJoinColumnList();
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