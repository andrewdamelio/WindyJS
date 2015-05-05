# WindyJS
Attemping to build a Wind Map  - Work in progress
![wind map](http://i.imgur.com/EB9kRoA.png?1)

[Demo](http://wind.graphics)


building and launching
----------------------

    git clone https://github.com/andrewdamelio/WindyJS.git
    cd WindyJS

    bower install
    npm install


Next, launch the development web server:

    forever -w --watchDirectory ./public/data/ server.js


Finally, point your browser to:

    http://localhost:8080

getting map data
----------------

See this amazing D3 map [tutorial](http://bost.ocks.org/mike/map/)


getting wind weather data
--------------------

Weather data is produced by the Global Forecast System (GFS), operated by the
US National Weather Service. Forecasts are produced four times daily and made
available for download from NOMADS. The node server.js fires a cron job 4 times
a day to download and build the wind data (see /scripts/). The files are in GRIB2 format and need to
be converted to JSON format using the grib2json utility.

[NCEP GFS Forecasts](http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl)


converting weather data to geoJSON
--------------------

Before GFS data can be used with this code it has to be converted into JSON.
To do this we use a tool created by @cambecc [https://github.com/cambecc/grib2json](https://github.com/cambecc/grib2json).
This tool converts GRIB2 files to JSON. The resulting JSON file can be found at /public/data/wind.json.

Please see below for details on how to clone and build grib2json.

[grib2json](https://github.com/cambecc/grib2json)


inspiration
-----------

[hint.fm](http://hint.fm/wind/), [Cameron Beccario](https://github.com/cambecc) and [WindJS](https://github.com/Esri/wind-js)
