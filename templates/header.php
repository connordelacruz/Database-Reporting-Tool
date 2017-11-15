<?php
/**
 * Header template for web pages.
 *
 * If $pageTitle has been set in the script including this, then the title tag will be
 * set accordingly. Otherwise, it will default to Report Generator.
 * If $disableViewport has been set to true in the script including this, the viewport
 * meta tag will be omitted in order to enable horizontal scrolling.
 *
 * @author Connor de la Cruz
 */
?>
<head>
    <meta charset="UTF-8">
    <?php
    /* Omitting viewport tag enables horizontal scrolling, which is good in the event that a generated report is wider
     * than the screen. */
    if (!isset($disableViewport) || $disableViewport === false)
        echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
    ?>

    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="res/img/favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" href="res/img/favicon/favicon-32x32.png" sizes="32x32">
    <link rel="icon" type="image/png" href="res/img/favicon/favicon-16x16.png" sizes="16x16">
    <link rel="manifest" href="res/img/favicon/manifest.json">
    <link rel="mask-icon" href="res/img/favicon/safari-pinned-tab.svg" color="#5bbad5">
    <link rel="shortcut icon" href="res/img/favicon/favicon.ico">
    <meta name="msapplication-config" content="res/img/favicon/browserconfig.xml">
    <meta name="theme-color" content="#2196f3">

    <title><?php echo isset($pageTitle) ? $pageTitle : 'Report Generator' ?></title>

    <!-- Stylesheet includes Bootstrap.css + theme -->
    <link rel="stylesheet" href="res/css/global.css">

    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <!-- Bootstrap.js -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <!-- Ajax Functions -->
    <script src="res/js/ajax.js"></script>

    <?php
    // If there is a .js file for this page, include it
    $pageName = basename($_SERVER['SCRIPT_NAME'], '.php');
    $pageScript = "res/js/$pageName.js";
    if (file_exists($pageScript))
        echo "<script src='$pageScript'></script>";
    ?>

</head>
