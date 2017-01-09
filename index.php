
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

    <div class="well-sm text-muted">Database: <?php echo parse_ini_file('config.ini')['SQL_DATABASE']; ?></div>

    <div class="well" id="table-select-div">
        <form class="form-vertical" id="table-select-form">
            <fieldset>
                <legend>Table</legend>
                <div class="form-group">
                    <label class="control-label sr-only" for="table-select">Table:</label>
                    <!-- TODO: give some indication that it's loading -->
                    <select class="form-control" id="table-select" name="table-select" required disabled>
                        <option id="placeholder" value="" disabled selected>Select a table</option>
                    </select>
                </div>
                <div class="collapse in" id="table-submit-div">
                    <button class="btn btn-primary" type="submit" name="table-submit" id="table-submit">Continue</button>
                </div>
            </fieldset>
        </form>
    </div>

    <!-- TODO: un-collapse this when columns are loaded -->
    <div class="well collapse" id="column-select-div">
        <form class="form-vertical" id="column-select-form">
            <fieldset>
                <legend>Columns</legend>
                <div class="form-group">
                    <label class="control-label sr-only" for="column-select">Columns to display:</label>
                    <select multiple class="form-control" id="column-select" name="column-select" required disabled>
                        <option id="placeholder" value="" disabled selected>Select columns to display</option>
                    </select>
                </div>
            </fieldset>
        </form>
    </div>
</div>

</body>
</html>