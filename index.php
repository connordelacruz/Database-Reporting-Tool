<?php



?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Report Generator</title>

    <!-- Stylesheet includes Bootstrap.css + theme -->
    <link rel="stylesheet" href="res/css/global.css">

    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <!-- Bootstrap.js -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
    <!-- bootstrap-select plugin -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.1/js/bootstrap-select.min.js"></script>

</head>
<body>

<div class="container">
    <h1>Report Generator</h1>

    <!-- TODO: show which database is currently being used for clarity -->

    <div class="panel panel-default">
        <div class="panel-heading">
            <b>Table</b>
        </div>
        <div class="panel-body">
        <form class="form-horizontal" id="table-select">
            <select class="selectpicker show-tick" name="table" title="Select a Table" required>
                <!-- TODO: dynamically populate with table names -->
                <option>placeholder</option>
                <option>placeholder</option>
                <option>placeholder</option>
            </select>
            <button class="btn btn-primary" type="submit" name="submit">Continue</button>
        </form>
        </div>
    </div>

    <div class="panel panel-default">
        <div class="panel-heading">
            <b>Columns</b>
        </div>
        <div class="panel-body">
            Select which columns to display:
        </div>
        <div class="panel-body no-pad-top-bottom">
            <div class="btn-group">
                <button class="btn btn-sm btn-success" id="column-selectall">Select All</button>
                <button class="btn btn-sm btn-danger" id="column-deselectall">Deselect All</button>
            </div>
        </div>
        <div class="panel-body">
            <form class="form-horizontal" id="column-select">
                <div class="btn-group" data-toggle="buttons">
                    <label class="btn btn-primary">
                        <input type="checkbox" autocomplete="off" name="columns" value="">placeholder
                    </label>
                    <label class="btn btn-primary">
                        <input type="checkbox" autocomplete="off" name="columns" value="">placeholder
                    </label>
                    <label class="btn btn-primary">
                        <input type="checkbox" autocomplete="off" name="columns" value="">placeholder
                    </label>
                    <label class="btn btn-primary">
                        <input type="checkbox" autocomplete="off" name="columns" value="">placeholder
                    </label>
                    <label class="btn btn-primary">
                        <input type="checkbox" autocomplete="off" name="columns" value="">placeholder
                    </label>
                    <label class="btn btn-primary">
                        <input type="checkbox" autocomplete="off" name="columns" value="">placeholder
                    </label>
                </div>
            </form>
        </div>
    </div>
</div>

</body>
</html>