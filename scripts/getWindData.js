'use strict';

var shjs = require('shelljs');


var currentdate = new Date();
var hour = currentdate.getHours();
if (hour >= 0 && hour < 6) {
  shjs.exec('bash ./scripts/getWind.sh 00');
} else if (hour >= 6 && hour < 12) {
  shjs.exec('bash ./scripts/getWind.sh 06');
} else if (hour >= 12 && hour < 18) {
  shjs.exec('bash ./scripts/getWind.sh 12');
} else if (hour >= 18 && hour < 24) {
  shjs.exec('bash ./scripts/getWind.sh 18');
}
