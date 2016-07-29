# USGS-BISON-Map Biomapr
Javascript API to generate a variety of mapping products for USGS BISON data sources.
# BISON
Biodiversity Information Serving Our Nation [BISON](http://bison.usgs.ornl.gov/) is committed to providing free and open access to species occurrence data. Data currently available through BISON are provided through the Global Biodiversity Information Facility (GBIF).

[BISON](http://bison.usgs.ornl.gov/) supports several data interchange formats to enable developers to write custom applications. The BISON and Solr search APIs support JavaScript Object Notation (JSON) and JSON with Padding (JSONP). The Web Mapping Services support Portable Network Graphics (PNG) . The web services APIs (OpenSearch & WMS) do not provide the ability to disambiguate species as does the BISON web based UI. When homonyms (names that map to multiple TSNs) exist for either a common name or scientific name OpenSearch or WMS search, a combined query is performed (e.g. Ficus maps to TSNs 73159 and 19081). The resulting combined web service query will return results that include either TSN. Example applications have been written using OpenLayers, and HTML 5 and we are working on mobile applications that will be available shortly.

[BISON](http://bison.usgs.ornl.gov/) has a Solr interface supporting Apache Solr 4.4 which can be accessed at this location.To retrieve the first ten occurrence records from Solr you would need to type this query like:

`http://bisonapi.usgs.ornl.gov/solr/occurrences/select/?q=*:* `


# BBL Dataset
Bird banding is a universal and indispensable technique for studying the movement, survival and behavior of birds. The North American Bird Banding Program is jointly administered by the United States Geological Survey and the Canadian Wildlife Service. Their respective banding offices have similar functions and policies and use the same bands, reporting forms and data formats. Joint coordination of the program dates back to 1923.

# Retrieving the data fast from BISON with PHP
First, we get the number of records.

```php
$url="http://bisonapi.usgs.ornl.gov/solr/occurrences/select/?q=resourceID:440,100033&start=0&rows=0&wt=json";
$str = file_get_contents($url);
$json = json_decode($str, true); // decode the JSON into an associative array
$rows = $json['response']['numFound'];
```
Second, we search for the records using BISON Solr index. 

```php
$file = fopen("http://bison.usgs.ornl.gov/solrstaging/occurrences/select/?q=resourceID:440,100033&start=0&rows=17539&wt=csv&fl=occurrenceID,providedScientificName,providedCommonName,year,stateProvince,countryCode,decimalLatitude,decimalLongitude,eventDate", "r");
$line = fgets($file, 1024);
```

Third, we loop through the '$file' and insert the data into our database.

```php
$line = fgets($file, 1024);
while (!feof($file)) {
  $line = fgets($file, 1024);
	$exploded_line = explode(',',$line);
	$sql = "insert into bbl_data (id,sci_name,common_name,lat,lon,eventdate,year,state_code,country_code) values ($1,$2,$3,$7,$8,$9,$4,$5,$6)";
	pg_query_params($db, $sql, $exploded_line);
	$number++;
}
```

# Building a grid based on aggregating data
Generating 10ʹ Block Record Count Aggregates for each Species and Year for BBL Dataset in BISON.Our solution for a process to generate an aggregate record count layer by 10’ block for each species and year in the BBL dataset. 

* First determine the bounding box for the grid area.

`select st_extent(geom) from adm0;`

This returns:

`box(73.557702 15.7800000000001,134.773925 53.560861)`
* Create a fishnet grid layer. We used one of the recipes from the web for generating a fishnet. 

```sql
-- Function: public.st_createfishnet(integer, integer, double precision, double precision, double precision, double precision)

-- DROP FUNCTION public.st_createfishnet(integer, integer, double precision, double precision, double precision, double precision);

CREATE OR REPLACE FUNCTION public.st_createfishnet(IN nrow integer, IN ncol integer, IN xsize double precision, IN ysize double precision, IN x0 double precision DEFAULT 0, IN y0 double precision DEFAULT 0, OUT "row" integer, OUT col integer, OUT geom geometry)
  RETURNS SETOF record AS
$BODY$
SELECT i + 1 AS row, j + 1 AS col, ST_Translate(cell, j * $3 + $5, i * $4 + $6) AS geom
FROM generate_series(0, $1 - 1) AS i,
     generate_series(0, $2 - 1) AS j,
(
SELECT ('POLYGON((0 0, 0 '||$4||', '||$3||' '||$4||', '||$3||' 0,0 0))')::geometry AS cell
) AS foo;
$BODY$
  LANGUAGE sql IMMUTABLE STRICT
  COST 100
  ROWS 1000;
ALTER FUNCTION public.st_createfishnet(integer, integer, double precision, double precision, double precision, double precision)
  OWNER TO postgres;
```
So set lon1=73, lat1=15, lon2=135, lat2=54 and then nrows = (54-15)*6 = 234; ncols = (135-73)*6 = 372 with each grid cell 1/6° = 0.16666666666667

```sql
create table grid10 as
select *
from st_createfishnet(234, 372, 0.16666666666667, 0.16666666666667, 73, 15);
```
Need to remember to set the SRID…
```sql
select UpdateGeometrySRID('grid10', 'geom', 4326);
```
…and create a spatial index.

```sql
create index c10gidx on grid10 using gist(geom);
```
Now the grid10 layer has three columns: row, col, geom.

* Create a new layer with the count aggregates, grouping by species (using serotypes here with BBL data) and year (using observation_dt here):

```sql
create table bbl10agg as select
  serotypes,
  extract(year from date(observation_dt)) as year,
  count(1) as ncount(1) as n,
  g.geom
from
  bbl_data o join
  grid10 g on st_intersects(o.geom, g.geom)
group by row, col, serotypes, year;
```
Now we can extract records from this layer for a particular species and year, and have the capability of extracting all years and doing interactive temporal animations and timelines.

Here is what the aggregate looks like for the BBL data:

![alt text](https://github.com/mryassain/USGS-BISON-biomapr/blob/master/images/01_country_boundary.png)
Detail of boundary layer.

![alt text](https://github.com/mryassain/USGS-BISON-biomapr/blob/master/images/02_superimposed%20grid.png)
Detail of 10’ grid block overlay.

![alt text](https://github.com/mryassain/USGS-BISON-biomapr/blob/master/images/03_aggregate_grid.png)
Aggregate layer added.

![alt text](https://github.com/mryassain/USGS-BISON-biomapr/blob/master/images/04_aggregate_without_grid.png)
Aggregate layer with grid layer removed.

# installing Biomapr
In order to install `Biomapr.js` library you need to include this simple line into your header javascript file.

`<script src="http://ec2-54-92-164-197.compute-1.amazonaws.com/biomapr_v1.js"></script>`

#Example Usage

To build your BBL-State-Map, you need first to create div-tag then call `biomapr()` function, and passing arguments:`div ID`, dataset name `bbl`, and state code `FL`.  

```html
	<div id="map1" style="width:700px;height:700px;"></div>
	<script>
		biomapr.blockmap("map1","bbl","FL","cn");
	</script>
```
	
This returns: 

![alt text](https://github.com/mryassain/USGS-BISON-biomapr/blob/master/images/florida.png)

#Visualization mantra and details on demand

![alt text](https://github.com/mryassain/USGS-BISON-biomapr/blob/master/images/florida_info.png)

We can also generate a BBL-State-Map with species common name or scientific name like:

```javascript
	biomapr.blockmap('your_div_id','bbl','MD','c','Acadian Flycatcher');
```
 And this returns:
 
![alt text](https://github.com/mryassain/USGS-BISON-biomapr/blob/master/images/maryland_flycatcher.png)
 
