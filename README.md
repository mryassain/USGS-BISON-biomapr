# USGS-BISON-Map Biomapr
Javascript API to generate a variety of mapping products for USGS BISON data sources.
# BBL Dataset
Bird banding is a universal and indispensable technique for studying the movement, survival and behavior of birds. The North American Bird Banding Program is jointly administered by the United States Geological Survey and the Canadian Wildlife Service. Their respective banding offices have similar functions and policies and use the same bands, reporting forms and data formats. Joint coordination of the program dates back to 1923.
# Building a grid based on aggregating data
Generating 10ʹ Block Record Count Aggregates for each Species and Year for BBL Dataset in BISON.Our proposal for a process to generate an aggregate record count layer by 10’ block for each species and year in the BBL dataset.
Since we didn’t have the BBL dataset handy, we used a PostgreSQL database 

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


### Retrieving the data fast
***

### Visualization mantra: Overview, filter & zoom, details on demand
***

### Building a tool instead of an app
***

### Use Cross-Origin Resource Sharing W3C Recommendation
***

