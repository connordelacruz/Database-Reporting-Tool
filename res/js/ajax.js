/**
 * Ajax functions
 */

/* Objects */

/**
 * Object containing ajax callback functions
 * @param {function} success Success callback function. Takes data parameter
 * @param {function} error Error callback function. Takes jqXHR parameter
 * @param {function} complete Complete callback function. No parameters
 * @constructor
 */
function AjaxCallbacks(success, error, complete) {
    // Assigned when a callback isn't defined
    function noCallback() {
        return undefined;
    }
    this.success = typeof success === 'function' ? success : noCallback; 
    this.error = typeof error === 'function' ? error : noCallback; 
    this.complete = typeof complete === 'function' ? complete : noCallback; 
}


/* Functions */

/**
 * Gets a list of accessible tables from database and passes data to callback functions
 * @param {AjaxCallbacks} ajaxCallbacks An AjaxCallbacks object with callback functions
 */
function getTablesAjax(ajaxCallbacks) {
    $.ajax({
        type: "POST",
        url: "handler/connection_handler.php",
        data: {'function' : 'getTables'},
        dataType: "json",
        success: function (data) {
            ajaxCallbacks.success(data);
        },
        error: function (jqXHR) {
            ajaxCallbacks.error(jqXHR);
        },
        complete: function () {
            ajaxCallbacks.complete();
        }
    });
}