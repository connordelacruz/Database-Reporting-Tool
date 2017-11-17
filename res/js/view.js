/**
 * Functions for manipulating the UI and handling events
 */

// TODO: extract rest of view functions from index.js


/* Variables */

// Spinning icon to display while loading
var loader = '<div class="loader"><svg class="circular" viewBox="25 25 50 50"><circle id="loader-circle" class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/></svg></div>';


/* Functions */

/**
 * Removed column select options, display loader, and disables #generate-report. Used when a new table is selected
 * @param {boolean} [showLoader] If true, display loading icon
 */
function clearColumnSelect(showLoader) {
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