<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Report Generator Setup</title>

    <!-- Stylesheet includes Bootstrap.css + theme -->
    <link rel="stylesheet" href="res/css/global.css">

    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <!-- Bootstrap.js -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

</head>
<body>

<div class="container">
    <h1>Report Generator Setup</h1>
    <div class="well">
        <form class="form-vertical" action="#" method="post">
    <?php
    // copy config_template.ini to config.ini if the file doesn't already exist
    if(!file_exists('config.ini')) {
        copy('config_template.ini', 'config.ini');
    }
    // iterate through ini settings and create text inputs for each one
    $ini = parse_ini_file('config.ini');
    foreach ($ini as $option => $value) {
        echo "<div class='form-group'><label class='control-label' for='$option'>$option:</label>";
        echo "<input type='text' class='form-control' name='$option' id='$option' value='$value'></div>";
    }
    ?>
        </form>
    </div>
</div>

</body>
</html>