<?php
/**
 * Header template for web pages.
 * If the variable $pageTitle has been set in the script including this, then the title tag will be
 * set accordingly. Otherwise, it will default to Report Generator.
 * @author Connor de la Cruz
 */
?>
<head>
    <meta charset="UTF-8">
    <?php
    // TODO:
    ?>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Favicon -->
    <link rel="apple-touch-icon" sizes="180x180" href="res/img/icon/apple-touch-icon.png">
    <link rel="icon" type="image/png" href="res/img/icon/favicon-32x32.png" sizes="32x32">
    <link rel="icon" type="image/png" href="res/img/icon/favicon-16x16.png" sizes="16x16">
    <link rel="manifest" href="res/img/icon/manifest.json">
    <link rel="mask-icon" href="res/img/icon/safari-pinned-tab.svg" color="#5bbad5">
    <link rel="shortcut icon" href="res/img/icon/favicon.ico">
    <meta name="msapplication-config" content="res/img/icon/browserconfig.xml">
    <meta name="theme-color" content="#2196f3">

    <title><?php echo isset($pageTitle) ? $pageTitle : 'Report Generator' ?></title>

    <!-- Stylesheet includes Bootstrap.css + theme -->
    <link rel="stylesheet" href="res/css/global.css">

    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <!-- Bootstrap.js -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

    <?php
    // If there is a .js file for this page, include it
    $pageName = basename($_SERVER['SCRIPT_NAME'], '.php');
    $pageScript = "res/js/$pageName.js";
    if (file_exists($pageScript))
        echo "<script src='$pageScript'></script>";
    ?>

</head>
