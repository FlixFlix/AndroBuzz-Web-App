<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>Androbuzz!</title>
    <meta name="theme-color" content="#ffffff">

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>

    <link rel="stylesheet" href="//cdn.jsdelivr.net/chartist.js/latest/chartist.min.css">
    <script src="//cdn.jsdelivr.net/chartist.js/latest/chartist.min.js"></script>

    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Condensed:300,400,700">
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css"
          integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">

    <link rel="stylesheet" href="style.css?v=<?php echo filemtime(__DIR__.'/style.css')?>">

    <link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png">
    <link rel="shortcut icon" href="icons/favicon.ico">
    <link rel="icon" type="image/x-icon" sizes="32x32" href="favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16x16.png">
    <link rel="manifest" href="icons/manifest.json">
    <link rel="mask-icon" href="icons/safari-pinned-tab.svg" color="#5bbad5">
    <meta name="msapplication-config" content="icons/browserconfig.xml">

    <script src="https://www.gstatic.com/firebasejs/5.4.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/5.4.1/firebase-database.js"></script>

    <script src="js/jquery-dateformat.min.js"></script>

</head>
<body>

<div class="container-fluid">
    <div id="main-wrapper" class="row">
        <div id="main-view" class="col-md-12">
            <div class="panel panel-primary">
                <div class="panel-heading">
                    <div class="dropdown">
                        <button style="display: none" class="btn btn-default dropdown-toggle" type="button"
                                id="dropdownMenu1"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Select Device
                            <span class="caret"></span>
                        </button>
                        <ul data-info="registered-phones" class="registered-phones dropdown-menu"
                            aria-labelledby="dropdownMenu1">
                            <li><a class="dropDownItem" href="javascript:void(null);">Retrieving registered
                                    devices...</a></li>
                        </ul>
                    </div>
                    <div class="signal-container" data-title="signal-info">
                        <div class="signal-strength good" data-bars="1">
                            <div class="bar-1 bar"></div>
                            <div class="bar-2 bar"></div>
                            <div class="bar-3 bar"></div>
                            <div class="bar-4 bar"></div>
                        </div>
                        <!--                        <div class="signal-dbm" data-info="signal-dbm">-99</div>-->
                        <!--                        <div class="signal-type" data-info="signal-type"></div>-->
                    </div>
                    <div class="panel-title" data-title="">
                        <h3 class="panel-title" data-info="signal-dbm"></h3>
                        <h3 class="panel-title small" data-info="carrier"></h3>
                    </div>
                    <div class="panel-title panel-status">
                        <h3 class="panel-title">
                            <span data-info="device-name">Loading devices...</span>
                        </h3>
                        <h3 class="panel-title small">
                            <span data-info="device-details"></span>
                        </h3>
                    </div>
                    </h3>
                    <div class=bluetooth-container>
                        <i title="notoncall" data-title="call-active" class="fas fa-phone"></i>
                        <a class="action bluetooth-icon" name="9" data-info="command-9" title="disconnected"
                           data-title="bluetooth-icon">
                            <i class="action fab fa-bluetooth"></i>
                        </a>
                        <!--                        <span class="bluetooth-name" data-info="bluetooth-name">bluetooth</span>-->
                    </div>
                    <div class=battery-container data-title="battery-level">
                        <span class="battery__percentage" data-info="battery-level">0%</span>
                        <div class="battery">
                            <div class="level"></div>
                        </div>
                    </div>
                </div>
                <div class="panel-body">
                    <div class="info-list">
                        <div class="info-row status">
                            <div class="status__status"><span data-info="status">Ready</span>&nbsp;<span
                                        id="timer">0s</span></div>
                            <div class="action_pill_container" data-title="message_id">
                                <span class="action_pill" data-info="last-message"></span>
                            </div>
                        </div>
                        <div class="info-row">
                            <div>Ping (ms)</div>
                            <div class="ct-chart ct-golden-section"></div>
                            <div data-info="ping"></div>
                        </div>
                        <div class="info-row">
                            <div class="options">
                                <div class="btn-group">
                                    <button name="fullscreen" type="button" class="fullscreen btn btn-lg btn-default">
                                        <i class="fas fa-expand"></i>
                                    </button>
                                </div>
                            </div>
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
                    <div class="progress-container">
                        <progress class="current-segment-progress"></progress>
                        <div class="progress-info" data-info="progress-info"></div>
                    </div>
                    <div class="error" data-info="error"></div>
                    <div class="console-container">
                        <div id="console">
                            <div class="positioner"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="abc">
                <button name="1" data-info="command-1" type="button" class="action btn btn-block btn-lg btn-disabled">A</button>
                <button name="2" data-info="command-2" type="button" class="action btn btn-block btn-lg btn-disabled">B</button>
                <button name="3" data-info="command-3" type="button" class="action btn btn-block btn-lg btn-disabled">C</button>
            </div>
            <div class="float-bottom btn-group btn-group-justified">
                <button name="4" data-info="command-4" type="button" class="action btn btn-lg btn-default btn-disabled">
                    <span style="font-size: 20px;">D</span>
                </button>
                <button name="7" data-info="command-7" type="button" class="action btn btn-lg  btn-default btn-disabled">
                    <i class="fas fa-redo-alt"></i>
                </button>
                <button name="6" data-info="command-6" type="button" class="action btn btn-lg  btn-default btn-disabled">
                    <i class="fas fa-volume-up"></i>
                </button>
                <button name="0" data-info="command-0" type="button" class="action btn btn-lg btn-default btn-disabled">
                    <i class="fas fa-exchange-alt"></i>
                </button>
                <button name="5" data-info="command-5" type="button" class="action btn btn-lg btn-default btn-disabled">
                    <i class="fas fa-forward"></i></i>
                </button>
            </div>
        </div>
    </div>
</div>
<script src="js/scripts.js?v=<?php echo filemtime(__DIR__.'/js/scripts.js')?>"></script>
</body>
</html>
