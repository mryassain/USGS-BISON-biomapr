# USGS-BISON-Map Biomapr
Javascript API to generate a variety of mapping products for USGS BISON data sources.
### BBL Dataset
***
Bird banding is a universal and indispensable technique for studying the movement, survival and behavior of birds. The North American Bird Banding Program is jointly administered by the United States Geological Survey and the Canadian Wildlife Service. Their respective banding offices have similar functions and policies and use the same bands, reporting forms and data formats. Joint coordination of the program dates back to 1923.
### Building a grid based on aggregating data
***
Generating 10ʹ Block Record Count Aggregates for each Species and Year for BBL Dataset in BISON.Our proposal for a process to generate an aggregate record count layer by 10’ block for each species and year in the BBL dataset.
Since we didn’t have the BBL dataset handy, we used a PostgreSQL database 

1. First determine the bounding box for the grid area.

`select st_extent(geom) from adm0;`

This returns:

`box(73.557702 15.7800000000001,134.773925 53.560861)`

2.Create a fishnet grid layer. We used one of the recipes from the web for generating a fishnet. 


### Retrieving the data fast
***

### Visualization mantra: Overview, filter & zoom, details on demand
***

### Building a tool instead of an app
***

### Use Cross-Origin Resource Sharing W3C Recommendation
***

