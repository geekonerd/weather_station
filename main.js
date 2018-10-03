// create app
const express = require("express");
var app = require('express')(),
        server = require('http').createServer(app),
        io = require('socket.io').listen(server),
        ent = require('ent');
// public files
app.use(express.static('public'));
app.use('/chart', express.static(__dirname + '/node_modules/chart.js/dist')); // redirect Chart.JS
app.use('/moment', express.static(__dirname + '/node_modules/moment/min')); // redirect moment
app.use('/bootstrap/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/bootstrap/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap



// DB
var MongoClient = require('mongodb').MongoClient;
var database_url = "mongodb://localhost:27017/";
var database_name = "weather_station";
var collection = "measurements";
var temperature_key = "temperature";
var humidity_key = "humidity";

var db_error = false;

// create db and collection
MongoClient.connect(database_url)
        .then(db => {
            var dbo = db.db(database_name);
            dbo.createCollection(collection)
                    .then(() => db.close());
        })
        .catch(err => {
            db_error = err;
            console.log(err);
        });


// socket.io
io.sockets.on('connection', function (socket) {

    // start
    socket.on('start', function () {
        var response = {code: 0};
        if (db_error) {
            response.code = -1;
            response.error = db_error;
        }
        socket.emit('started', response);
    });

    // insert measurements into db
    socket.on('insert', function (data) {
        // {time: <time>, type: <humidity|temperature>, value: <value>}
        var response = {code: 0};
        MongoClient.connect(database_url)
                .then(db => {
                    var dbo = db.db(database_name);
                    dbo.collection(collection).insertOne(data)
                            .then(() => {
                                console.log("A new measure was inserted!");
                                socket.emit('inserted', response);
                                socket.broadcast.emit('inserted', response);
                            }).then(() => db.close());
                })
                .catch(err => {
                    console.log(err);
                    response.code = -1;
                    response.error = err;
                    socket.emit('inserted', response);
                });
    });

    // find measurements
    socket.on('find', function (search) {
        var response = {code: 0};
        MongoClient.connect(database_url)
                .then(db => {
                    var dbo = db.db(database_name);
                    var query = {time: {$gte: search.range_start, $lt: search.range_end}};
                    var sort = {time: 1};
                    dbo.collection(collection).find(query).sort(sort).toArray()
                            .then(data => {
                                response.values = data;
                                socket.emit('found', response);
                            }).then(() => db.close());
                })
                .catch(err => {
                    console.log(err);
                    response.code = -1;
                    response.error = err;
                    socket.emit('found', response);
                });
    });

});

// start server
server.listen(8080);
