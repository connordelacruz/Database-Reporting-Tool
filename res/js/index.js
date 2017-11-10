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

// Array of TableDataObjects for the currently selected tables. Indexed by the id of the select element
var selectedTables = {};

// Spinning icon to display while loading
var loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle id="loader-circle" class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg></div>';


/* Functions */

/**
 * Gets a list of accessible tables from database and calls populateTableSelects() on success
 */
function getTables() {
    // disable table inputs and show loader
    $('#table-fieldset').find(':input').prop('disabled', true);
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
                populateTableSelects();
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
function populateTableSelects() {
    // The table select elements
    var tableSelectInputs = $('.table-select-input');

    // Add tables to select inputs
    for (var i = 0; i < tables.length; i++) {
        var option = "<option value='" + tables[i] + "'>" + tables[i] + "</option>";
        tableSelectInputs.append(option);
    }

    // Add listener to single table select
    $('#table-select').change(function () {
        var tableName = $(this).find(':selected').val();
        if (tableName !== '') {
            // clear any existing options and show loader
            clearColumnSelect(true);
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
            var optionsString = buildColumnOptions(selectIndex);
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
// TODO: Use a submit button instead of ajax, it will get messy with 3+ tables
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
 * Gets a list of columns from the table and calls populateColumnList() on success.
 * If the table is not valid, then connection_handler.php sets data.error. If data.error is defined, then an error
 * message is displayed and populateColumnList() is not called.
 * @param selectIndex Index in selectedTables
 * @param callbackFunction Function to call on success (i.e. function to populate column list)
 */
function getColumns(selectIndex, callbackFunction) {
    var table = selectedTables[selectIndex].name;
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
                // clear loader from #column-list-container
                clearColumnSelect(false);
            }
            else {
                selectedTables[selectIndex].columns = data.text;
                // get the total number of rows and set #row-limit max
                selectedTables[selectIndex].rowCount = data['rowCount'];
                // TODO: extract this to callback?
                $('#row-limit').attr({
                    'max': selectedTables[selectIndex].rowCount,
                    'placeholder': 'Number of rows to display (max ' + selectedTables[selectIndex].rowCount + ')'
                });
                // Execute callback function if defined
                if (callbackFunction !== undefined)
                    callbackFunction();
            }
        },
        error: function (jqXHR) {
            // If an error occurred before the server could respond, display message and stop execution
            displayError(jqXHR.responseText, true);
            // clear loader from #column-list-container
            clearColumnSelect(false);
        }
    });
}


/**
 * Populates #column-list-container with checkboxes containing column names.
 * This function is called on success of getColumns().
 * @param selectIndex Index in selectedTables
 */
function populateColumnList(selectIndex) {
    var columnListContainer = buildColumnList(selectIndex);
    $('#column-list-container').html(columnListContainer);
    showColumnSelectPlaceholder(false);
    disableSubmit(false);
}


/**
 * Populate #column-list-container with checkboxes containing columns for each table in the join
 * @param selectIndices Array of indices into selectedTables
 */
function populateTableJoinColumnList(selectIndices) {
    // For each table select index, build a column list
    var columnListContainer = $('<div></div>');
    $.each(selectIndices, function (i, selectIndex) {
        var columnList = buildColumnList(selectIndex, true);
        columnListContainer.append(columnList);
    });
    $('#column-list-container').html(columnListContainer);
    showColumnSelectPlaceholder(false);
    disableSubmit(false);
}


/**
 * Generate markup for column checkbox list
 * @param selectIndex The index into selectedTables for the table
 * @param {boolean} [tableJoin] If true, include the name of the table and a horizontal rule at the top
 * @returns jQuery object for the column list
 */
function buildColumnList(selectIndex, tableJoin) {
    var table = selectedTables[selectIndex];
    var containerId = table.name + '-column-options-container';
    var columnOptionsContainerString = '<div id="' + containerId + '">';

    // Include table name if this is a join list
    if (tableJoin) {
        columnOptionsContainerString += '<b class="text-primary">' + table.name + '</b><br>';
    }

    // Add select all checkbox
    var selectAllId = table.name + '-column-select-all';
    var selectAllHeading = 'Select All';
    if (tableJoin)
        selectAllHeading += ' From ' + table.name;
    columnOptionsContainerString += [
        '<div class="checkbox">',
        '<label><input type="checkbox" id="' + selectAllId + '" checked><b>' + selectAllHeading + '</b></label>',
        '</div>'
    ].join('');

    // Build options list
    $.each(table.columns, function (i, column) {
        columnOptionsContainerString += '<div class="checkbox"><label><input type="checkbox" name="tables[' + table.name + '][]" class="column-option" value="' + column + '" checked>' + column + '</label></div>';
    });
    columnOptionsContainerString += '</div>';
    var columnOptionsContainer = $(columnOptionsContainerString);

    // Add listener to table select all button
    var selectAllListener = function (containerId) {
        return function () {
            $(containerId).find('.column-option').prop('checked', $(this).prop('checked'));
            // if nothing is checked, submit buttons should be disabled
            disableSubmit(!$(this).prop('checked'));
        }
    };
    columnOptionsContainer.find('#' + selectAllId).change(selectAllListener('#' + containerId));

    // Add listeners to column checkboxes to uncheck select all if not all are selected
    var columnOptionListener = function (containerId, selectAllId) {
        return function () {
            // uncheck select all if this gets unchecked
            if ($(this).prop('checked') === false) {
                $(selectAllId).prop('checked', false);
                // Disable submit buttons if nothing is checked
                if ($(containerId).find('.column-option:checked').length === 0) {
                    disableSubmit(true);
                }
            }
            // if this was checked, re-enable submit buttons
            else {
                disableSubmit(false);
                // if everything else is checked, then set select all to checked
                if ($(containerId).find('.column-option:checked').length === $(containerId).find('.column-option').length) {
                    $(selectAllId).prop('checked', true);
                }
            }
        }
    };
    columnOptionsContainer.find('.column-option').change(columnOptionListener('#' + containerId, '#' + selectAllId));

    return columnOptionsContainer;
}


/**
 * Generate markup for column select options
 * @param selectIndex The index into selectedTables for the table
 * @returns {string} Markup for column select options
 */
function buildColumnOptions(selectIndex) {
    var table = selectedTables[selectIndex];
    var columnOptionsString = '<option class="placeholder" value="" disabled selected>Select a column</option>';
    $.each(table.columns, function (i, column) {
        columnOptionsString += '<option value="' + column + '">' + column + '</option>';
    });
    return columnOptionsString;
}


/**
 * Removed column select options, display loader, and disables #generate-report. Used when a new table is selected
 * @param {boolean} [showLoader] If true, display loading icon
 */
function clearColumnSelect(showLoader) {
    disableSubmit(true);
    // clear column options and display loading icon
    $('#column-list-container').html(showLoader ? loader : '');
}


/**
 * Toggle visibility of column select placeholder text
 * @param {boolean} visible If true, show placeholder text. If false, hide it
 */
function showColumnSelectPlaceholder(visible) {
    $('#column-select-placeholder').toggleClass('hidden', !visible);
}


/**
 * Set the disabled property of the submit buttons
 * @param setDisabled Value to set the disabled property to
 */
function disableSubmit(setDisabled) {
    $('button[type=submit]').prop('disabled', setDisabled);
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
            // TODO: toggle visibility of these instead based on state
            clearColumnSelect(false);
            showColumnSelectPlaceholder(true);
            // Determine which radio is checked (select or join)
            var isSelect = $('input[name="select-type"]:checked').val() === 'single';
            // (don't need this variable, but using it for readability's sake)
            var isJoin = !isSelect;
            $('#table-select-collapse').collapse(isSelect ? 'show' : 'hide')
                .find(':input').prop('disabled', !isSelect);
            $('#table-join-collapse').collapse(isJoin ? 'show' : 'hide')
                .find(':input').prop('disabled', !isJoin);

            // Toggle visibility of elements specific to radio state
            $('.join-select').toggleClass('hidden', !isJoin)
                .find(':input').prop('disabled', !isJoin);
            $('.single-select').toggleClass('hidden', !isSelect)
                .find(':input').prop('disabled', !isSelect);

            // TODO: update select fields/columns section on expanding if corresponded key in selectedTables
            // TODO: make sure to update row limit, too
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