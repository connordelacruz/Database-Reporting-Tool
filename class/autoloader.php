<?php
/**
 * Used for autoloading classes
 * @author Connor de la Cruz
 */

/**
 * Autoloader function for report generator
 * @param string $class The class to load
 */
function autoloader($class) {
    // load from classes directory
    include $_SERVER['DOCUMENT_ROOT'] . "/reports/class/".$class.".class.php";
}

spl_autoload_register('autoloader');