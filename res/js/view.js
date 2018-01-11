/**
 * Functions for manipulating the UI and handling events
 */

// TODO: extract rest of view functions from index.js
// TODO: convert to object/module?


/* Variables */

// Spinning icon to display while loading
var loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle id="loader-circle" class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg></div>';


/* Functions */


/**
 * Generate markup for table select options
 * @param tables List of table names
 * @returns {string} Markup for table select options
 */
function buildTableOptions(tables) {
    var optionsString = '';
    for (var i = 0; i < tables.length; i++)
        optionsString += "<option value='" + tables[i] + "'>" + tables[i] + "</option>";
    return optionsString;
}


/**
 * Have a multi-step modal to the specified step
 * @param {string} modalId id of the multi-step modal
 * @param step The step to go to
 */
function modalStep(modalId, step) {
    $(modalId).trigger('next.m.' + step);
}


/**
 * Generate markup for join table order list
 * @param tables List of selected tables
 * @returns {string} Markup for join table order list
 */
function buildJoinTableOrderList(tables) {
    var listItemsString = '';
    $.each(tables, function (i, table) {
        listItemsString += '<li class="list-group-item table-order-item" data-table="' + table + '">' + table + '</li>';
    });
    return listItemsString;
}


/**
 * Update contents of join table order list
 * @param tables List of selected tables
 */
function updateJoinTableOrderList(tables) {
    var listItems = buildJoinTableOrderList(tables);
    $('#join-table-order').html(listItems);
    // Refresh sortable
    sortable('#join-table-order');
}


/**
 * Returns an array of tables to join in the order specified in the join table order list
 * @returns {Array} Array of TableDataObjects in the order they should be joined
 */
function getJoinTableOrder() {
    var orderedTables = [];
    $('#join-table-order').find('.table-order-item').each(function(i) {
        orderedTables[i] = new TableDataObject($(this).data('table'));
    });
    return orderedTables;
}


/**
 * Update contents of join table
 * @param tables List of TableDataObjects in the order they should be joined
 */
function updateJoinTable(tables) {
    var joinTableBody = $('#join-table-body');
    // Insert first row
    joinTableBody.html(buildInitialJoinTableRow(tables[0].name));

    // Keep track of optgroup markup for tables already joined
    var joinedTableColumnOptions = buildColumnOptions(tables[0]);
    // Build subsequent rows for the rest of the tables
    for (var i = 1; i < tables.length; i++) {
        var table = tables[i];
        var tableColumnOptions = buildColumnOptions(table);
        // Append row for this table
        joinTableBody.append(buildJoinTableRow(i, table.name, tableColumnOptions, joinedTableColumnOptions));
        // Add column options string to joinedTableColumnOptions
        joinedTableColumnOptions += tableColumnOptions;
    }
}


// TODO: document
function buildJoinTableRow(joinIndex, table, tableColumnOptions, joinedTableColumnOptions) {

    // Name attributes start with join[joinIndex]
    var namePrefix = 'join[' + joinIndex + ']';

    var row = $('<tr></tr>');

    // Join type select
    var joinCell = [
        '<td class="form-group">',
            '<label>Join Type:</label>',
            '<select class="form-control" name="' + namePrefix + '[type]" required>',
                '<option value="inner" selected>Inner Join</option>',
                '<option value="left">Left Join</option>',
                '<option value="right">Right Join</option>',
                '<option value="outer">Outer Join</option>',
            '</select>',
        '</td>'
    ].join('');
    row.append(joinCell);

    // TODO: add ids for form elements

    // Table being joined
    var tableCell = [
        '<td class="form-group">',
            '<label>Table:</label>',
            '<input type="text" class="form-control" name="' + namePrefix + '[0][table]" value="' + table + '" readonly required>',
        '</td>'
    ].join('');
    row.append(tableCell);
    // 'ON' cell
    row.append('<td class="text-center"><b>ON</b></td>');
    // Column select (for this table)
    var column0Cell = [
        '<td class="form-group">',
            '<label>Column:</label>',
            '<select class="form-control join-column-select" name="' + namePrefix + '[0][column]" required>',
                '<option class="placeholder" value="" disabled selected>Select a column</option>',
                tableColumnOptions,
            '</select>',
        '</td>'
    ].join('');
    row.append(column0Cell);
    // '=' cell
    row.append('<td class="text-center"><b>=</b></td>');
    // Column select (for one of the other tables)
    // Includes hidden input storing form data for the table containing the selected column
    var column1Cell = [
        '<td class="form-group">',
            '<label>Column:</label>',
            '<select class="form-control join-column-select" name="' + namePrefix + '[1][column]" required>',
                '<option class="placeholder" value="" disabled selected>Select a column</option>',
                joinedTableColumnOptions,
            '</select>',
            '<input type="hidden" name="' + namePrefix + '[1][table]" value="">',
        '</td>'
    ].join('');
    row.append(column1Cell);

    // When column from joined table is selected, update hidden input with table name
    row.find('select[name="' + namePrefix + '[1][column]"]').change(function () {
        var table1 = $(this).find(':selected').parent().data('table');
        $('input[name="' + namePrefix + '[1][table]"]').val(table);
    });

    return row;
}


/**
 * Generate markup for the first row in the join table
 * @param {string} table Name of the table
 * @returns {string} Markup for initial join table row
 */
function buildInitialJoinTableRow(table) {
    return [
        '<tr>',
            '<td class="form-group" colspan="6">',
                '<label>Table:</label>',
                '<input type="text" class="form-control" value="' + table + '" readonly required>',
            '</td>',
        '</tr>'
    ].join('');
}


/**
 * Generate markup for column select options. Contains data-table attribute containing the name of the table
 * @param {TableDataObject} table The table to generate column options for
 * @returns {string} Markup for column select options
 */
function buildColumnOptions(table) {
    var columnOptionsString = '<optgroup label="'+ table.name + '" data-table="'+ table.name + '">';
    columnOptionsString += '<option class="placeholder" value="" disabled selected>Select a column</option>';
    $.each(table.columns, function (i, column) {
        columnOptionsString += '<option value="' + column + '">' + column + '</option>';
    });
    columnOptionsString += '</optgroup>';
    return columnOptionsString;
}


/**
 * Generate markup for column checkbox list
 * @param {TableDataObject} table The table to generate a column list for
 * @param {boolean} [tableJoin] If true, include the name of the table and a horizontal rule at the top
 * @returns jQuery object for the column list
 */
function buildColumnList(table, tableJoin) {
    // TODO: no longer needed once joins and single selects are merged
    var idPrefix = table.name + (tableJoin ? '-join' : '-single');
    var containerId = idPrefix + '-column-options-container';
    var columnOptionsContainerString = '<div id="' + containerId + '">';

    // Include table name if this is a join list
    if (tableJoin) {
        columnOptionsContainerString += '<b class="text-primary">' + table.name + '</b><br>';
    }

    // Add select all checkbox
    var selectAllId = idPrefix + '-column-select-all';
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
            refreshSubmitButtonState();
        }
    };
    columnOptionsContainer.find('#' + selectAllId).change(selectAllListener('#' + containerId));

    // Add listeners to column checkboxes to uncheck select all if not all are selected
    var columnOptionListener = function (containerId, selectAllId) {
        return function () {
            // Check select all button if all column-options in this container are checked. Otherwise, uncheck it
            $(selectAllId).prop('checked',
                $(this).prop('checked') && $(containerId).find('.column-option:checked').length === $(containerId).find('.column-option').length);
            refreshSubmitButtonState();
        }
    };
    columnOptionsContainer.find('.column-option').change(columnOptionListener('#' + containerId, '#' + selectAllId));

    return columnOptionsContainer;
}


/**
 * Removed column list checkboxes, display loader, and disables #generate-report. Used when a new table is selected
 * @param {boolean} [showLoader] If true, display loading icon
 */
function clearColumnList(showLoader) {
    disableSubmit(true);
    // clear column options and display loading icon
    // TODO: view functions shouldn't need to know about selectType, make param?
    var containerId = '#' + selectType + '-column-list-container';
    $(containerId).html(showLoader ? loader : '');
}


/**
 * Toggle visibility of column select placeholder text
 * @param {boolean} visible If true, show placeholder text. If false, hide it
 */
function showColumnSelectPlaceholder(visible) {
    $('#column-select-placeholder').toggleClass('hidden', !visible);
}


/**
 * Check if column list for current select type is empty
 * @returns {boolean} True if no columns are present
 */
function columnListIsEmpty() {
    // TODO: view functions shouldn't need to know about selectType, make param?
    var containerId = '#' + selectType + '-column-list-container';
    return !$.trim($(containerId).html()).length;
}


/**
 * Checks if column list is empty and shows placeholder if true
 */
function refreshPlaceholderState() {
    showColumnSelectPlaceholder(columnListIsEmpty());
}


/**
 * Set the max value and placeholder text of the row limit input
 * @param maxRows Max number of rows for the row limit field. If maxRows < 1 evaluates to true, remove the max
 * attribute and set a generic placeholder.
 */
function setRowLimitInputMax(maxRows) {
    var rowLimitInput = $('#row-limit');
    var attributes = {'placeholder' : 'Number of rows to display'};

    if (maxRows < 1) {
        rowLimitInput.removeAttr('max');
    }
    else {
        attributes['max'] = maxRows;
        attributes['placeholder'] += ' (max ' + maxRows + ')';
    }
    rowLimitInput.attr(attributes);
}

/**
 * Set the disabled property of the submit buttons
 * @param setDisabled Value to set the disabled property to
 */
function disableSubmit(setDisabled) {
    $('button[type=submit]').prop('disabled', setDisabled);
}


/**
 * Determine if the form requirements are met
 * @returns {boolean} True if the form is valid, false if not
 */
function formIsValid() {
    return requiredInputsFilled() && columnsSelected();
}


/**
 * Determine if all required (and enabled) inputs are filled
 * @returns {boolean} True if required inputs are all filled, false if 1 or more needs to be filled
 */
function requiredInputsFilled() {
    var isValid = true;
    // Check enabled required fields
    $(':input[required]:enabled').each(function() {
        // If val is null or an empty string, set isValid to false and break
        if ($(this).val() === null || $(this).val().length === 0)
            return isValid = false;
    });
    return isValid;
}


/**
 * Check if 1 or more column checkboxes are selected
 * @returns {boolean} True if 1+ columns are selected, false if none are
 */
function columnsSelected() {
    return $('.column-option:enabled:checked').length > 0;
}


/**
 * Disable/enable submit button based on form validity
 */
function refreshSubmitButtonState() {
    disableSubmit(!formIsValid());
}


// TODO: make similar refresh state function for add table button


/**
 * Shorthand function for calling all state refresh functions
 */
function refreshFormState() {
    refreshPlaceholderState();
    refreshSubmitButtonState();
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