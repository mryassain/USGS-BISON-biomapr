<!DOCTYPE html>
<meta charset="utf-8">
<title>Testing</title>

<body>
<select id="select"></select>
<div id="map" style="width:600px;height:600px;margin:0 auto;"></div>
<div id="map2" style="width:600px;height:600px;margin:0 auto;"></div>
<script src="d3.min.js"></script>
<script src="queue.min.js"></script>
<script src="topojson.js"></script>
<script src="biomapr.js"></script>
<script>
biomapr.fill_state_species_select("select","01");
biomapr.blockmap("map","bison_datasource_id","01","Agelaius phoeniceus");
biomapr.blockmap("map2","bison_datasource_id","CT");
</script>
</body>
