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


// TODO: document
function buildJoinTableRow(joinIndex, tables) {
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

    // Table select
    // TODO: use a more efficient way of doing this
    var tableOptions = buildTableOptions(tables);
    var tableCell = [
        '<td class="form-group">',
            '<label>Table:</label>',
            '<select class="form-control table-select-input" name="' + namePrefix + '[0][table]" required>',
                '<option class="placeholder" value="" disabled selected>Select a table</option>',
                tableOptions,
            '</select>',
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
            '</select>',
        '</td>'
    ].join('');
    row.append(column0Cell);
    // '=' cell
    row.append('<td class="text-center"><b>=</b></td>');
    // Column select (for one of the other tables)
    // TODO: have a select w/ tables used in the join?
    var column1Cell = [
        '<td class="form-group">',
            '<label>Column:</label>',
            '<select class="form-control join-column-select" name="' + namePrefix + '[1][column]" required>',
                '<option class="placeholder" value="" disabled selected>Select a column</option>',
            '</select>',
        '</td>'
    ].join('');
    row.append(column1Cell);

    // TODO: remove button

    // TODO: add listeners

    return row;
}


/**
 * Generate markup for column select options
 * @param {TableDataObject} table The table to generate column options for
 * @returns {string} Markup for column select options
 */
function buildColumnOptions(table) {
    var columnOptionsString = '<optgroup label="'+ table.name + '">';
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
    // TODO: ids can conflict if table is selected in more than one field
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
            // TODO: factor in other column lists
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
                // TODO: factor in other column lists
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