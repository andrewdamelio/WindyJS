'use strict';

var express = require('express');
var app = express();
var path = require('path');
var cron = require('cron');
var shjs = require('shelljs');

var windData = require('./public/data/wind.json');

app.set('port', process.env.PORT || 8080);

app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res) {
  res.sendFile('./index.html');
});

app.get('/current-wind', function (req, res) {
  res.json(windData);
});

// 2AM  get fs.2015042906
var cronJob1 = cron.job('00 00 06 * * 1-7', function () {
  // perform operation e.g. GET request http.get() etc.
  shjs.exec('bash ./scripts/getWind.sh 06');
  windData = require('./public/data/wind.json');
  console.info('cron job completed', new Date());
});

// 8AM  get fs.2015042912
var cronJob2 = cron.job('00 00 12 * * 1-7', function () {
  // perform operation e.g. GET request http.get() etc.
  shjs.exec('bash ./scripts/getWind.sh 12');
  windData = require('./public/data/wind.json');
  console.info('cron job completed', new Date());
});

// 2PM  get fs.2015042914
var cronJob3 = cron.job('00 00 18 * * 1-7', function () {
  // perform operation e.g. GET request http.get() etc.
  shjs.exec('bash ./scripts/getWind.sh 18');
  windData = require('./public/data/wind.json');
  console.info('cron job completed', new Date());
});

// 8PM  get fs.2015042900
var cronJob4 = cron.job('00 00 00 * * 1-7', function () {
  // perform operation e.g. GET request http.get() etc.
  shjs.exec('bash ./scripts/getWind.sh 00');
  windData = require('./public/data/wind.json');
  console.info('cron job completed', new Date());
});

cronJob1.start();
cronJob2.start();
cronJob3.start();
cronJob4.start();

var server = app.listen(process.env.PORT || 8080, function () {
  console.log('Listening on port %d', server.address().port);
});