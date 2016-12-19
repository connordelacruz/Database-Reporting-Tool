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

    <!-- Contains js for this page and functions to get data from the database -->
    <script src="res/js/index.js"></script>

</head>
<body>

<div class="container">
    <h1>Report Generator</h1>

    <!-- TODO: show which database is currently being used for clarity -->

    <div class="well">
    <form class="form-vertical">
        <fieldset>
            <legend>Table</legend>
            <div class="form-group">
                <label class="control-label sr-only" for="table-select">Table:</label>
                <!-- TODO: disable this until populated with results (and give some indication that it's loading -->
                <select class="form-control" id="table-select" name="table-select" required>
                    <option id="placeholder" value="" disabled selected>Select a Table</option>
                </select>
            </div>
            <button class="btn btn-primary" type="submit" name="submit">Continue</button>
        </fieldset>
    </form>
    </div>

    <div class="well">
        <form class="form-horizontal" id="column-select">
            <fieldset>
                <legend>Columns</legend>
                <label class="control-label">Select which columns to display:</label>
                <div class="well well-sm">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-success" id="column-selectall">Select All</button>
                        <button class="btn btn-sm btn-danger" id="column-deselectall">Deselect All</button>
                    </div>
                </div>
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
            </fieldset>
        </form>
    </div>
</div>

</body>
</html>