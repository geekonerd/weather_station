jQuery(function () {
    var socket = io();
    showLoader();
    socket.emit('start');

    var step = 0.5; // graph time frame in days (a day)
    var range_start = step; // day to start (a week ago at this time)
    var range_end = 0; // day to end (now)

    var labels = [];
    var datasets = [{
            label: 'Humidity',
            fill: false,
            borderColor: 'rgb(255, 205, 86)',
            data: []
        }, {
            label: 'Temperature',
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            data: []
        }];

    var graph_config = {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets,
            options: {
                responsive: true,
                title: {
                    display: false,
                },
                tooltips: {
                    mode: 'index',
                    intersect: true
                }
            }
        }
    };

    // find data
    function find() {
        showLoader();
        var start = Math.floor((Date.now() - (range_start * 86400000)) / 1000);
        var end = Math.floor((Date.now() - (range_end * 86400000)) / 1000);
        var data = {
            range_start: start,
            range_end: end
        };
        jQuery("#range_start").html("start: " + moment(start*1000).locale("IT").format('llll'));
        jQuery("#range_end").html("end: " + moment(end*1000).locale("IT").format('llll'));
        socket.emit('find', data);
    }

    jQuery("#btn_reset").click(function () {
        range_start = step;
        range_end = 0;
        find();
    });

    jQuery("#btn_previous").click(function () {
        range_start += step;
        range_end += step;
        find();
    });
    jQuery("#btn_next").click(function () {
        range_start -= step;
        range_end -= step;
        find();
    });

    // server started
    socket.on('started', function (data) {
        if (validate(data)) {
            var ctx = document.getElementById("canvas").getContext("2d");
            window.weather_graph = new Chart(ctx, graph_config);
            jQuery("#btn_reset").click();
        } else {
            loadPage("#error");
        }
    });

    // a new measure is ready, reset graph on real-time
    socket.on('inserted', function (data) {
        if (validate(data) && jQuery("#ckb_realtime").prop("checked")) {
            jQuery("#btn_reset").click();
        }
    });

    // found data to show
    socket.on('found', function (data) {
        if (validate(data)) {
            loadPage("#graph");
            graph_config.data.labels = [];
            datasets[0].data = [];
            datasets[1].data = [];
            data.values.forEach(function (measure) {
                var day = moment(measure.time*1000).locale("IT").format('llll');
                if (-1 === graph_config.data.labels.indexOf(day)) {
                    graph_config.data.labels.push(day);
                }
                if ('humidity' === measure.type) {
                    datasets[0].data.push(parseFloat(measure.value));
                } else if ('temperature' === measure.type) {
                    datasets[1].data.push(parseFloat(measure.value));
                }
            });
            window.weather_graph.update();
        } else {
            loadPage("#error");
        }
    });

});

// check response validity
function validate(data) {
    return null !== data && 0 === data.code;
}

// show loader
function showLoader() {
    $("#progress").removeClass("hidden");
}

// hide loader
function loadPage(page) {
    $("#progress").addClass("hidden");
    $(".app-panel").addClass("hidden");
    $(page).removeClass("hidden");
}

// show alert message
function showMessage(msg, status) {
    $("#message").html(msg).removeClass("hidden").addClass(status);
    setTimeout(hideMessage, 6000);
}

// hide alert message
function hideMessage() {
    $("#message").html("").removeClass().addClass("alert hidden");
}
