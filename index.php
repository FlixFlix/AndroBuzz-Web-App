<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>Androbuzz!</title>
    <meta name="theme-color" content="#ffffff">

    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <!-- <link rel="stylesheet" href="https://bootswatch.com/superhero/bootstrap.min.css"> -->
    <link rel="stylesheet" href="style.css?v=816327">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700">

    <link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16x16.png">
    <link rel="manifest" href="icons/manifest.json">
    <link rel="mask-icon" href="icons/safari-pinned-tab.svg" color="#5bbad5">
    <link rel="shortcut icon" href="icons/favicon.ico">
    <meta name="msapplication-config" content="icons/browserconfig.xml">

    <script src="https://www.gstatic.com/firebasejs/4.2.0/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/4.2.0/firebase-database.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

    <script src="scripts.js"></script>

</head>
<body>

<div class="container-fluid">
    <div id="main-wrapper" class="row">
        <div id="main-view" class="col-md-12">
            <div class="panel panel-primary">
                <div class="panel-heading">
                    <div class="dropdown">
                        <button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                            Select Device
                            <span class="caret"></span>
                        </button>
                        <ul data-label="registered-phones" class="registered-phones dropdown-menu" aria-labelledby="dropdownMenu1">
                        </ul>
                    </div>
                    <div class="signal-strength good" data-bars="1">
                        <div class="bar-1 bar"></div>
                        <div class="bar-2 bar"></div>
                        <div class="bar-3 bar"></div>
                        <div class="bar-4 bar"></div>
                    </div>
                    <div class="panel-title" data-title="">
                        <h3 class="panel-title" data-label="device-name" data-title="device-details"></h3>
                        <h4 class="panel-title panel-status" data-label="status"></h4>
                    </div>
                    </h3>
                    <div class=battery-container><span data-label="battery-level">%</span><div class="battery"><div class="level"></div></div></div>
                </div>
                <div class="panel-body">
                    <div class="info-list">
                        <div class="info-row">
                            <div>Last message</div>
                            <div data-label="last-message" data-title="message_id"></div>
                            <div id="timer">0s</div>
                        </div>
                        <div class="info-row">
                            <div>Ping</div>
                            <div data-label="ping"></div>
                        </div>
                        <div class="info-row">
                            <div>Segment</div>
                            <div class="segment">
                                <div class="btn-group">
                                    <button name="basic" type="button" class="btn btn-lg btn-default">
                                        <span>Basic</span>
                                    </button>
                                    <button name="general" type="button" class="btn btn-lg btn-default active">
                                        <span>General</span>
                                    </button>
                                    <button name="general" type="button" class="btn btn-lg btn-default">
                                        <span>Combo</span>
                                    </button>
                                    <button name="general" type="button" class="btn btn-lg btn-default">
                                        <span>Air</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        </tbody>
                    </div>
                </div>
                <div class="panel-footer">
                    <progress class="current-segment-progress"></progress>
                    <div class="error" data-label="error"></div>
                    <div id="consoleDiv"></div>
                </div>
            </div>
            <div class=abc>
                <button name="1" type="button" class="action btn btn-block btn-lg btn-disabled">A</button>
                <button name="2" type="button" class="action btn btn-block btn-lg btn-disabled">B</button>
                <button name="3" type="button" class="action btn btn-block btn-lg btn-disabled">C</button>
            </div>
            <div class="float-bottom btn-group btn-group-justified">
                    <button name="4" type="button" class="action btn btn-lg btn-default">
                        <span style="font-size: 20px;">D</span>
                    </button>
                    <button name="7" type="button" class="action btn btn-lg  btn-default">
                        <i class="glyphicon glyphicon glyphicon-repeat"></i>
                    </button>
                    <button name="6" type="button" class="action btn btn-lg  btn-default">
                        <i style="font-size: 21px; line-height: 15px;"
                           class="glyphicon glyphicon glyphicon-volume-up"></i>
                    </button>
                    <button id="NOP" name="0" type="button" class="action btn btn-lg btn-default">
                        <i class="glyphicon glyphicon-transfer"></i>
                    </button>
                    <button name="5" type="button" class="action btn btn-lg  btn-default">
                        <i class="glyphicon glyphicon glyphicon-forward"></i>
                    </button>
            </div>
        </div>
    </div>
</div>

</body>
</html>
