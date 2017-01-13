<?php
/**
 * Used for autoloading classes
 */

/**
 * Autoloader function for report generator
 * @param string $class The class to load
 */
function autoloader($class) {
    // load from classes directory
    include "class/".$class.".class.php";
}

spl_autoload_register('autoloader');