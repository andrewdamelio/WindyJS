/*global paper:false,
         d3:false,
         Windy:false,
         topojson:false*/

'use strict';


/*

              WORK IN PROGRESS
                Experimental
                 ¯\_(ツ)_/¯

 */

// Globals
var MAPDATA = 'data/canada.json';
var WIDTH = 960;
var HEIGHT = 720;

var projection;
var windyDataBuilder;
var canvas;
var context;
var windyData;
var windJSON;


/**
 * [getNextCord]
 *
 * [returns the next (x, y) position given the current (x, y)
 * position and a wind direction value]
 *
 * @param  {[number]} currentX      [current x position]
 * @param  {[number]} currentY      [current y position]
 * @param  {[number]} windDirection [direction of wind 0-360]
 * @return {[array]} [new (x,y) after accounting for wind direction]
 */
function getNextCord(currentX, currentY, windDirection) {
  var WDIR = windDirection;
  var pointX = currentX;
  var pointY = currentY;
  if (WDIR >= 0 && WDIR <= 20 || WDIR >= 340 && WDIR <= 360) {
    //  TOP
    pointX += 0;
    pointY += 1;
  } else if (WDIR > 20 && WDIR < 70) {
    // TOP RIGHT
    pointX += -1;
    pointY += 1;
  } else if (WDIR >= 70 && WDIR <= 110) {
    // RIGHT
    pointX += -1;
    pointY += 0;
  } else if (WDIR > 110 && WDIR < 160) {
    // BOTTOM RIGHT
    pointX += -1;
    pointY += -1;
  } else if (WDIR >= 160 && WDIR <= 200) {
    // BOTTOM
    pointX += 0;
    pointY += -1;
  } else if (WDIR > 200 && WDIR < 250) {
    // BOTTOM LEFT
    pointX += 1;
    pointY += -1;
  } else if (WDIR >= 250 && WDIR <= 290) {
    //  LEFT
    pointX += 1;
    pointY += 0;
  } else if (WDIR > 290 && WDIR < 340) {
    //  TOP LEFT
    pointX += 1;
    pointY += 1;
  }
  return [pointX, pointY];
}

/**
 * [generateWindPath]
 *
 * [returns a 2D array of random generated wind paths. Generated
 * using a random (x, y) position, and a resolution value.
 * Resolution value determines how many 'steps' through the wind
 * data should we walk to generate these paths
 *
 * @param  {[number]} x          [random x starting point]
 * @param  {[number]} y          [random y starting point]
 * @param  {[number]} resolution [level of detail]
 * @return {[array]}             [2D array of path data]
 */
function generateWindPath(x, y, resolution) {
  var myArray = [];
  var pointX = x;
  var pointY = y;

  for (var i = 0; i < resolution; i++) {
    var cord = [pointX, pointY];
    var location = projection.invert(cord);
    var GPS = [location[0], location[1]];
    var WindData = windyDataBuilder;


    /**
       WindData.interpolate

      Passing a lat/lng into WindData.interpolate will return
      wind data at the coordinates. WindData.interpolate will
      return a object with the following properties,
      u, v and sqrt(u * u + v * v).

        u = (from west to east) in m/s
        v = (from south to north) in m/s
        sqrt(u * u + v * v) = Wind Speed

      To find wind direction, we can just apply the below
      to the returned u and v values

      (270 - Math.atan2(v, u) * 180 / Math.PI) % 360

     */

    var uvComp = WindData.interpolate(GPS[0], GPS[1]);
    var WDIR = (270 - Math.atan2(uvComp[1], uvComp[0]) * 180 / Math.PI) % 360;
    var SPEED = uvComp[2];

    var newCords = getNextCord(pointX, pointY, WDIR);
    pointX = newCords[0];
    pointY = newCords[1];
    myArray.push([pointX, pointY]);
  }
  return myArray;
}


/**
 * [createWindPaths]
 * @param  {[type]} drawPaths    [if true show paths, otherwise animate circles]
 * @param  {[type]} quantity   [the amount of paths to draw]
 * @param  {[type]} resolution [the total number of segments within a path]
 */
function createWindPaths(drawPaths, quantity, resolution) {

  for (var i = 0; i < quantity; i++) {
    drawWindPaths(drawPaths, resolution);
  }
  paper.view.draw();
  handleUnSelection()


  function drawWindPaths(drawPaths, resolution) {

    var path = new paper.Path();

    // Trail of circles (7) - sizes
    var circleSizes = [
      2,
      0.5,
      0.5,
      0.5,
      0.5,
      0.5,
      0.5
    ];

    // Trail of circle (7) - opacity
    var circleOpacity = [
      1,
      0.75,
      0.75,
      0.5,
      0.5,
      0.25,
      0.25
    ];

    // Trail of circles (7) - color
    var circleColors = [
      '#000080',
      '#000080',
      '#0044FF',
      '#0044FF',
      '#009CFF',
      '#009CFF',
      '#009CFF'
    ];

    // Trail of circles (7) - distance from eachother
    var circleOffset = [
      0,
      10,
      30,
      50,
      70,
      90,
      110
    ];

    // random start location of a wind plot path
    var randX = Math.floor(Math.random() * 750) + 75;
    var randY = Math.floor(Math.random() * 650) + 50;

    // generate the wind path and add it as a segment
    path.addSegments(generateWindPath(randX, randY, resolution));

    path.smooth();

    // if drawPaths mode draw only the paths generated above;
    if (drawPaths) {
      path.strokeColor = '#333333';
    }
    // otherwises step through the paths drawing wind spheres along the wind paths
    else {

      var circles = [];
      for (var i = 0; i < circleSizes.length; i++) {
        var index = circles.push(new paper.Path.Circle(20, 20, circleSizes[i]));
        circles[index - 1].strokeColor = circleColors[i];
        circles[index - 1].opacity = circleOpacity[i];
      }
      var offset = 0;

      circles[0].onFrame = function (event) {
        if (offset < path.length) { //(path.length)
          for (var i = 0; i < circleSizes.length; i++) {
            circles[i].position = path.getPointAt(offset - circleOffset[i]);
          }
          offset += 3;
        } else {
          offset = 0;
        }
      };
    }
  }
}

// D3 - Draw map of Canada along with cities
(function generateMap() {

  projection = d3.geo.albers()
    .center([5, 62])
    .parallels([50, 60])
    .scale(1000 * 1)
    .translate([WIDTH / 2, HEIGHT / 2]);

  var path = d3.geo.path()
    .projection(projection);

  var svg = d3.select('#map_SVG')
    .attr('width', WIDTH)
    .attr('height', HEIGHT);

  d3.json(MAPDATA, function (error, canada) {
    console.log('Canada JSON', canada);
    svg.selectAll('.subunit')
      .data(topojson.feature(canada, canada.objects.subunits).features)
      .enter().append('path')
      .attr('class', function (d) {
        return 'subunit ' + d.id;
      })
      .attr('d', path);

    var scale = d3.scale.linear()
      .domain([0, 10000000])
      .range([0.5, 5]);

    svg.selectAll('circle')
      .data(topojson.feature(canada, canada.objects.places).features)
      .enter().append('circle')
      .attr('transform', function (d) {
        return 'translate(' + projection(d.geometry.coordinates) + ')';
      })
      .attr('r', function (d) {
        return scale(d.properties.pop);
      });

  });
})();


function handleUnSelection() {
  $('#wind-path .button').removeClass('is-disabled');
  $('#wind-path .options').removeClass('is-disabled');
  $('#wind-flow .button').removeClass('is-disabled');
  $('#wind-flow .options').removeClass('is-disabled');
}

function handleSelection() {
  $('#wind-path .button').addClass('is-disabled', true);
  $('#wind-path .options').addClass('is-disabled', true);
  $('#wind-flow .button').addClass('is-disabled', true);
  $('#wind-flow .options').addClass('is-disabled', true);
}

// Main
$(document).ready(function () {



  // Change color of map when clicked
  $('#canvas').on('click', function () {
    if ($('.subunit.CAN').css('fill') === 'rgb(220, 220, 220)') {
      $('.subunit.CAN').css('fill', '#FA8072');
    } else {
      $('.subunit.CAN').css('fill', '#DCDCDC');
    }
  });

  canvas = document.getElementById('canvas');
  $(canvas).attr('width', WIDTH).attr('height', HEIGHT);
  context = canvas.getContext('2d');

  // Make ajax call to get wind data being served by our backend api
  d3.json('/current-wind', function (error, data) {
    console.log('windJSON', data);

    windJSON = data;

    $('.wind-date').text(moment(data[0].header.refTime).format('MMMM Do YYYY, h:mm:ss a'));

    windyData = new Windy({
      canvas: canvas,
      data: windJSON
    });

    windyDataBuilder = windyData.buildGrid(windJSON);


    $('#wind-path .button').on('click', function () {
      var option = $('#wind-path-value')[0].value || 1000;
      if (isNaN(option)) {
        option = 1000;
      }
      $('#wind-path')[0].value = option;
      paper.clear()

      paper.setup(canvas);

      handleSelection();
      setTimeout(function () {
        createWindPaths(true, option, 500);
      }, 1000);

    });

    $('#wind-flow .button').on('click', function () {
      var option = $('#wind-flow-value')[0].value || 175;
      if (isNaN(option)) {
        option = 175;
      }
      $('#wind-flow')[0].value = option;
      paper.clear()

      paper.setup(canvas);

      handleSelection();
      setTimeout(function () {
        createWindPaths(false, option, 150);
      }, 1000);
    });
  });
});
