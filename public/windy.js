/*

    credit: All the credit for this work goes to: https://github.com/Esri/wind-js/blob/master/windy.js
*/

var Windy = function( params ){

  // interpolation for vectors like wind (u,v,m)
  var bilinearInterpolateVector = function(x, y, g00, g10, g01, g11) {
      var rx = (1 - x);
      var ry = (1 - y);
      var a = rx * ry,  b = x * ry,  c = rx * y,  d = x * y;
      var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d;
      var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d;
      return [u, v, Math.sqrt(u * u + v * v)];
  };

  var createWindBuilder = function(uComp, vComp) {
      var uData = uComp.data, vData = vComp.data;
      return {
          header: uComp.header,
          //recipe: recipeFor("wind-" + uComp.header.surface1Value),
          data: function(i) {
              return [uData[i], vData[i]];
          },
          interpolate: bilinearInterpolateVector
      }
  };

  var createBuilder = function(data) {
      var uComp = null, vComp = null, scalar = null;
      // /console.log(data);
      data.forEach(function(record) {
        //console.log(record);
          switch (record.header.parameterCategory + "," + record.header.parameterNumber) {
              case "2,2": uComp = record; break;
              case "2,3": vComp = record; break;
              default:
                scalar = record;
          }
          // console.log("uComp", uComp);
          // console.log("vComp", vComp);
          // console.log("scalar", scalar);
      });

      return createWindBuilder(uComp, vComp);
  };

  var buildGrid = function(data, callback) {
      var builder = createBuilder(data);

      var header = builder.header;
      var λ0 = header.lo1, φ0 = header.la1;  // the grid's origin (e.g., 0.0E, 90.0N)
      var Δλ = header.dx, Δφ = header.dy;    // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
      var ni = header.nx, nj = header.ny;    // number of grid points W-E and N-S (e.g., 144 x 73)
      var date = new Date(header.refTime);
      date.setHours(date.getHours() + header.forecastTime);

      // Scan mode 0 assumed. Longitude increases from λ0, and latitude decreases from φ0.
      // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
      var grid = [], p = 0;
      var isContinuous = Math.floor(ni * Δλ) >= 360;
      for (var j = 0; j < nj; j++) {
          var row = [];
          for (var i = 0; i < ni; i++, p++) {
              row[i] = builder.data(p);
          }
          if (isContinuous) {
              // For wrapped grids, duplicate first column as last column to simplify interpolation logic
              row.push(row[0]);
          }
          grid[j] = row;
      }

      function interpolate(λ, φ) {  // long, lat
          var i = floorMod(λ - λ0, 360) / Δλ;  // calculate longitude index in wrapped range [0, 360)
          var j = (φ0 - φ) / Δφ;                 // calculate latitude index in direction +90 to -90

          var fi = Math.floor(i), ci = fi + 1;
          var fj = Math.floor(j), cj = fj + 1;

          var row;
          if ((row = grid[fj])) {
              var g00 = row[fi];
              var g10 = row[ci];
              if (isValue(g00) && isValue(g10) && (row = grid[cj])) {
                  var g01 = row[fi];
                  var g11 = row[ci];
                  if (isValue(g01) && isValue(g11)) {
                      // All four points found, so interpolate the value.
                      return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11);
                  }
              }
          }
          return null;
      }
      return {
          date: date,
          interpolate: interpolate
      };
  };


  /**
   * @returns {Boolean} true if the specified value is not null and not undefined.
   */
  var isValue = function(x) {
      return x !== null && x !== undefined;
  }

  /**
   * @returns {Number} returns remainder of floored division, i.e., floor(a / n). Useful for consistent modulo
   *          of negative numbers. See http://en.wikipedia.org/wiki/Modulo_operation.
   */
  var floorMod = function(a, n) {
      return a - n * Math.floor(a / n);
  }

  var windy = {
    params: params,
    createBuilder: createBuilder,
    buildGrid : buildGrid
  };

  return windy;
}


