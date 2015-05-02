#!/bin/bash

DATE=$(date +'%Y%m%d'$1)
echo  "Pulling latest data for "$DATE



curl "http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?dir=%2Fgfs."$DATE"&file=gfs.t"$1"z.pgrb2.1p00.f000&lev_10_m_above_ground=on&var_UGRD=on&var_VGRD=o" -o gfs.pgrb2.1p00.f000

echo "Running grib2json..."

bash ./grib2json/bin/grib2json -d -n -o wind.json gfs.pgrb2.1p00.f000

if [ ! -f wind.json ]; then
    echo "No Wind data to download for" $DATE
else
  rm ./public/data/wind.json
  cp  wind.json  ./public/data
  rm gfs.pgrb2.1p00.f000
  rm wind.json
  echo "Wind data json file created @" $(date)
fi
