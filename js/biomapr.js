!function() {
	var biomapr = {
		version: "0.5.2"
	};
	
	var server_url = "https://ec2-50-17-240-81.compute-1.amazonaws.com/";
	
	biomapr.fill_state_species_select = function(select_id, state_code, spe_type) {
		var select = d3.select("#" + select_id);
		if (!select) {console.log(select_id + " not found."); return;}
		var state_item = this.get_state(state_code);
		if (!state_item) {console.log(state_code + " not found."); return;}
		select.selectAll("option").remove();
		d3.json(server_url + "getSpeciesBaseState_v2.php?state_code=" + state_item.name + ((!spe_type) ? "" : ("&spe_type=" + spe_type)), function(error, species_json) {
			if (error) {console.log(error); return;}
			select.selectAll("option")
					.data(species_json)
				.enter().append("option").attr({value:function(d) {return d.sci_name;}}).text(function(d) {return d.sci_name;});
		});
	} // end fill_state_species_select

	var state_list = [
		{name:"Alabama",code:"01",abbrev:"AB"},
		{name:"Alaska",code:"02",abbrev:"AL"},
		{name:"Arizona",code:"04",abbrev:"AZ"},
		{name:"Arkansas",code:"05",abbrev:"AK"},
		{name:"California",code:"06",abbrev:"CA"},
		{name:"Colorado",code:"08",abbrev:"CO"},
		{name:"Connecticut",code:"09",abbrev:"CT"},
		{name:"Delaware",code:"10",abbrev:"DL"},
		{name:"District of Columbia",code:"11",abbrev:"DC"},
		{name:"Florida",code:"12",abbrev:"FL"},
		{name:"Georgia",code:"13",abbrev:"GA"},
		{name:"Hawaii",code:"15",abbrev:"HI"},
		{name:"Idaho",code:"16",abbrev:"ID"},
		{name:"Illinois",code:"17",abbrev:"IL"},
		{name:"Indiana",code:"18",abbrev:""},
		{name:"Iowa",code:"19",abbrev:"IA"},
		{name:"Kansas",code:"20",abbrev:"KS"},
		{name:"Kentucky",code:"21",abbrev:"KY"},
		{name:"Louisiana",code:"22",abbrev:"LA"},
		{name:"Maine",code:"23",abbrev:"ME"},
		{name:"Maryland",code:"24",abbrev:"MD"},
		{name:"Massachusetts",code:"25",abbrev:"MA"},
		{name:"Michigan",code:"26",abbrev:"MI"},
		{name:"Minnesota",code:"27",abbrev:"MN"},
		{name:"Mississippi",code:"28",abbrev:"MS"},
		{name:"Missouri",code:"29",abbrev:"MO"},
		{name:"Montana",code:"30",abbrev:"MT"},
		{name:"Nebraska",code:"31",abbrev:"NE"},
		{name:"Nevada",code:"32",abbrev:"NV"},
		{name:"New Hampshire",code:"33",abbrev:"NH"},
		{name:"New Jersey",code:"34",abbrev:"NJ"},
		{name:"New Mexico",code:"35",abbrev:"NM"},
		{name:"New York",code:"36",abbrev:"NY"},
		{name:"North Carolina",code:"37",abbrev:"NC"},
		{name:"North Dakota",code:"38",abbrev:"ND"},
		{name:"Ohio",code:"39",abbrev:"OH"},
		{name:"Oklahoma",code:"40",abbrev:"OK"},
		{name:"Oregon",code:"41",abbrev:"OR"},
		{name:"Pennsylvania",code:"42",abbrev:"PA"},
		{name:"Rhode Island",code:"44",abbrev:"RI"},
		{name:"South Carolina",code:"45",abbrev:"SC"},
		{name:"South Dakota",code:"46",abbrev:"SD"},
		{name:"Tennessee",code:"47",abbrev:"TN"},
		{name:"Texas",code:"48",abbrev:"TX"},
		{name:"Utah",code:"49",abbrev:"UT"},
		{name:"Vermont",code:"50",abbrev:"VT"},
		{name:"Virginia",code:"51",abbrev:"VA"},
		{name:"Washington",code:"53",abbrev:"WA"},
		{name:"West Virginia",code:"54",abbrev:"WV"},
		{name:"Wisconsin",code:"55",abbrev:"WI"},
		{name:"Wyoming",code:"56",abbrev:"WY"},
		{name:"Puerto Rico",code:"72",abbrev:"PR"},
		{name:"U.S. Virgin Islands",code:"78",abbrev:"VI"}
	];

	biomapr.fill_state_select = function(select_id) {
		var select = d3.select("#" + select_id);
		if (!select) {console.log(select_id + " not found."); return;}
		select.selectAll("option").remove();
		select.selectAll("option")
				.data(state_list)
			.enter().append("option").attr("value", function(d) {return d.code;}).text(function(d) {return d.name;});
	}
	
	biomapr.get_state = function(str) {
		for (var i = 0; i < state_list.length; i++) {
			if (str.toUpperCase() === state_list[i].name.toUpperCase() || str === state_list[i].code || str.toUpperCase() === state_list[i].abbrev.toUpperCase()) {
				return state_list[i];
			}
		}
		return null;
	}
	
	var threeDigit = d3.format("03d"); // Format numbers like 077, 005, and 101
	var purples = ['#e6e6fa','#d4caeb','#c1aedc','#ae92cd','#9b77be','#895daf','#7542a0','#602791','#4b0082'];

	biomapr.generate_block_id = function(lat, lon) {
		var latabs = Math.abs(lat),
				latdeg = Math.floor(latabs),
				latmin = Math.floor((latabs - latdeg) * 6.0),
				lonabs = Math.abs(lon),
				londeg = Math.floor(lonabs),
				lonmin = Math.floor((lonabs - londeg) * 6.0);						
		return latdeg + "." + latmin + "-" + threeDigit(londeg)+ "." + lonmin;
	} // end generate_block_id
	
	var geojson_polygon_template =
		JSON.stringify({"type":"Feature", "geometry":{"type":"Polygon", "coordinates":[[[0,0],[0,1],[1,1],[1,0],[0,0]]]},"properties":{"id": ""}});
	biomapr.generate_block_geojson = function(lat, lon, blocksize) {
		var geojson = JSON.parse(geojson_polygon_template),
				halfblock = blocksize/2/60,
				latmin = lat - halfblock,
				latmax = lat + halfblock,
				lonmin = lon - halfblock,
				lonmax = lon + halfblock;
		geojson.geometry.coordinates[0][0][0] = lonmin;
		geojson.geometry.coordinates[0][0][1] = latmin;
		geojson.geometry.coordinates[0][1][0] = lonmin;
		geojson.geometry.coordinates[0][1][1] = latmax;
		geojson.geometry.coordinates[0][2][0] = lonmax;
		geojson.geometry.coordinates[0][2][1] = latmax;
		geojson.geometry.coordinates[0][3][0] = lonmax;
		geojson.geometry.coordinates[0][3][1] = latmin;
		geojson.geometry.coordinates[0][4][0] = lonmin;
		geojson.geometry.coordinates[0][4][1] = latmin;
		return geojson;
	} // end generate_block_geojson
	
	biomapr.blockmap = function(map_element_id, bison_datasource_id, state_code, spe_type, species_sci_name) {
		var map_element = d3.select("#" + map_element_id);
		if (!map_element) {console.log(map_element_id + " not found."); return;}
		map_element.selectAll("*").remove();
		//console.log(map_element.property("clientHeight"));
		var state_item = this.get_state(state_code);
		if (!state_item) {console.log(state_code + " not found."); return;}
		var states,
			counties,
			bool_rich =  (!species_sci_name),
			block_data = [],
			legend_height = 80,
			map_svg_dim = (map_element.property("clientHeight") == 0) ? 600 : map_element.property("clientHeight") - legend_height,
			map_svg = map_element.append("svg").attr({"class":"biomap-map-svg", width:map_svg_dim, height:map_svg_dim}),
			infobox = map_element.append("div").attr("class","loc-infobox"),
			projection = d3.geo.albers().scale(12000).translate([-3400, 1190]),
			path = d3.geo.path().projection(projection);
				
		var formatNumber = d3.format(",d"); // Format numbers like 12,287
		
		d3.json(server_url + "state_county_base20150114.topojson", function(error, map_json) {
			if (error) {console.log(error); return;}
			queue()
				.defer(d3.json, server_url + "get_Data_v2.php?state_code=" + state_item.name + ((bool_rich) ? "" : ("&sci_name=" + species_sci_name))+((!spe_type) ? "" : ("&spe_type=" + spe_type)))
				.await(data_ready);
			states = topojson.feature(map_json, map_json.objects.state).features,
			counties = topojson.feature(map_json, map_json.objects.county).features;
			draw_state(state_item.code);
		});

		function draw_state(fips) {
			
			var state = states.filter(function(d) {return (d.properties.state_fips === fips) && (d.properties.type === "Land"); })[0],
					state_counties = counties.filter(function(d) {return d.properties.state_fips === fips});
					state_name = state.properties.name;

			projection .scale(1) .translate([0, 0]);

			var b = path.bounds(state),
					s = .95 / Math.max((b[1][0] - b[0][0]) / map_svg_dim, (b[1][1] - b[0][1]) / map_svg_dim),
					t = [(map_svg_dim - s * (b[1][0] + b[0][0])) / 2, (map_svg_dim - s * (b[1][1] + b[0][1])) / 2];

			projection.scale(s).translate(t);

			map_svg.selectAll(".state-poly").remove();
			map_svg.selectAll(".state-line").remove();
			map_svg.selectAll(".county-line").remove();
			map_svg.append("path").datum(state).attr({"class": "state-poly", "d": path, "fill": "#f2efed", "stroke": "none"});
			map_svg.selectAll(".county-line").data(state_counties).enter().append("path").attr({"class": "county-line", "d": path,
				"fill": "none", "stroke": "#BFC0BF" , "stroke-dasharray": "4,4,1,4"}).append("title").text(function(d){return d.properties.name;});
			map_svg.append("path").datum(state).attr({"class": "state-line", "d": path, "fill": "none", "stroke": "#BFC0BF"});
		}	// end of function draw_state
		
		var block;
		var colors = d3.scale.threshold().range(purples);
		var mySetExtent;
		function data_ready(error, data_json) {	
			if (error) {console.log(error);return;}
			block = d3.nest()
				.key(function(d) {return biomapr.generate_block_id(d.lat10, d.lon10);})
				.key(function(d) {return d.sci_name;}).sortKeys(d3.ascending)
				.rollup(function(d) {
					return {
						"geojson": biomapr.generate_block_geojson(d[0].lat10, d[0].lon10, 10), // 10minute blocks
						"n": d3.sum(d, function(v) {return v.n;}), // total number of bandings for this species in this block
						"por": d3.extent(d, function(v) {return v.year;}), // period of record
						"bhdata": d.map(function(v) { return {"year": v.year, "n":v.n};}) // year-by-year banding history
					};
				})
				.entries(data_json);
			if (bool_rich) {
				block.forEach(function(d) {
					d.species_list = d.values.sort(function(a,b){return b.values.n-a.values.n;}).map(function(v){return v.key+"("+formatNumber(v.values.n)+")";}).slice(0,50).join(", ");
					d.n = d.values.length;// number of species?? or number of bandings?
					d.geojson = d.values[0].values.geojson;
					d.sum = d3.sum(d.values,function(v){return v.values.n;});
					delete d.values;
				});
			} else {
				block.forEach(function(d) {
					// add species_sci_name
					d.n = d.values[0].values.n;
					d.por = d.values[0].values.por;
					d.bhdata = d.values[0].values.bhdata;
					d.geojson = d.values[0].values.geojson;
					delete d.values;
				});
			}
			var mySet = block.map(function(d) {return d.n;});
				mySetExtent = d3.extent(mySet);
			var nclasses = d3.min([mySet.unique().length, purples.length]);
			colors.domain((nclasses >= purples.length)? biomapr.fish(mySet, nclasses) : mySet.unique().sort(function(a,b) {return a - b;}));
			colors.range(purples.slice(-(nclasses+1)));//to fix As a negative index, begin indicates an offset from the end
			draw_boxes ();
			draw_legend();
				
		} // end of function data_ready
	
		function draw_boxes (){
			//console.log(block);
			var boxes = map_svg.selectAll(".box").data(block, function(d) {return d.key;});
			boxes.exit().transition().duration(750).style("opacity", 0).remove();
			boxes.enter().append("path")
				.attr({
					"class": "box",
					"d": function(d) {return path(d.geojson);},
					"stroke": "#DCD9D6",
					"fill": function(d) {return colors(d.n);},"opacity":0.6
			});
			boxes.attr("fill", function(d) {return colors(d.n);});
			boxes.on("mouseover", function(d) {
				var  w = 150, h = 20;
				var x = d3.scale.linear().range([17, w-17]),y = d3.scale.linear().range([h-7, 7]);
				var line = d3.svg.line().defined(function(d) {return d.n != null;}).x(function(d) { return x(d.year); }).y(function(d) { return y(d.n); });
				infobox.style({
					"position":"absolute",
					"width":"400px",
					"padding":"4px",
					"font":"12px sans-serif",
					"border":"solid 1px #aaa",
					"border-radius":"8px",
					"background-color":"rgba(245,245,245,0.8)",
					"z-index":"999",
					"pointer-events":"none",
					"display":"none"
					});
				infobox.selectAll("*").remove();
				infobox.append("style")
					.text(".info-header {font-weight: bold;font-size: smaller;}.info-detail-italic{font-style:italic;}");
				if(!bool_rich){
					infobox.style("width", "238px");
					infobox.append("span").attr("class","info-header").text("Block ID: ");								
					infobox.append("span").attr("class","info-detail").text(d.key);
					infobox.append("br");
					infobox.append("span").style("class","info-header").text("Species: ");
					infobox.append("span").attr("class","info-detail-italic").text(species_sci_name);// was species_sci_name
					infobox.append("br");
					infobox.append("span").attr("class","info-header").text("# Bandings: ");
					infobox.append("span").attr("class","info-detail").text(formatNumber(d.n));
					infobox.append("br");
					infobox.append("span").attr("class","info-header").text("Period of Record: ");
					infobox.append("span").attr("class","info-detail").text(d.por[0]+"-"+d.por[1]);
					infobox.append("br");
					infobox.append("span").attr("class","info-header").text("History of Banding:");
					var sparkline_svg = infobox.append("svg").datum(d.bhdata).attr({class: "sparkline-svg", width: w, height: h});
					x.domain(d3.extent(d.bhdata, function(d) {return d.year;}));
					y.domain(d3.extent(d.bhdata, function(d) {return d.n;}));
					for (var iYear = x.domain()[0]; iYear < x.domain()[1]; iYear++) {
						if (d.bhdata.map(function(e) { return e.year; }).indexOf(iYear) == -1) {
							d.bhdata.push({year: iYear, n: null});
						}
					}
					d.bhdata.sort(function(a, b) {return (a.year - b.year);});
					sparkline_svg.append("rect").attr({class: "spark-bg", x: 0, y: 0, width: w, height: h, fill: "#DFDFDF", stroke: "none"});
					sparkline_svg.append("path").attr({class: "spark-line", d: line, fill: "none", stroke: "black", "stroke-width": 1.5});
					sparkline_svg.selectAll(".spark-dot").data(d.bhdata.filter(function(d) {return d.n != null;})).enter().append("circle")
						.attr({class: "spark-dot", cx: function(d) {return x(d.year);}, cy: function(d) {return y(d.n);}, r: 2,
							fill: function(d) {return (d.n == y.domain()[0]) ? "red" : ((d.n == y.domain()[1]) ? "blue" : "white");},
							stroke: function(d) {return (d.n == y.domain()[0]) ? "red" : ((d.n == y.domain()[1]) ? "blue" : "black");},
							"stroke-width": 0.5})
						.append("title").attr({class: "spark-tip"}).text(function(d) {return d.year + ": " + d.n;});
					sparkline_svg.append("text")
						.attr({class: "spark-first-year", x: 0, y: 9, "text-anchor": "middle",
							transform: "rotate(-90) translate(-10)", "font-size": 9,
							fill: "black", stroke: "none"})
						.text(x.domain()[0]);
					sparkline_svg.append("text")
						.attr({class: "spark-last-year", x: 0, y: w-2, "text-anchor": "middle",
							transform: "rotate(-90) translate(-10)", "font-size": 9,
							fill: "black", stroke: "none"})
						.text(x.domain()[1]);
					var infoboxtable = infobox.append("table").style({"width":"72px",
						"display":"inline-block",
						"border-spacing":0,
						"border-collapse":"collapse",
						"font_family":"sans-serif",
						"font-size":"11.5px",
						"line-height":"0.9em"});
					var tr = infoboxtable.append("tr").style({"color":"blue","padding":6,"margin":0});
					tr.append("td").style({"text-align":"left","padding":6,"margin":0}).text("High");
					tr.append("td").style({"text-align":"right","padding":6,"margin":0}).text(formatNumber(y.domain()[1]));
					tr = infoboxtable.append("tr").style("color","red");
					tr.append("td").style({"text-align":"left","padding":6,"margin":0}).text("Low");
					tr.append("td").style({"text-align":"right","padding":6,"margin":0}).text(formatNumber(y.domain()[0]));
				} else {
					infobox.append("span").attr("class","info-header").text("Number of species: ");
					infobox.append("span").attr("class","info-detail").text(formatNumber(d.n) + ".");
					infobox.append("br");
					infobox.append("span").attr("class","info-header").text("Total number of bandings: ");
					infobox.append("span").attr("class","info-detail").text(formatNumber(d.sum) + ".");
					infobox.append("br");
					infobox.append("span").attr("class","info-header").text("Block ID: ");
					infobox.append("span").attr("class","info-detail").text(d.key + ".");
					infobox.append("br");
					infobox.append("span").attr("class","info-header").text("Species list: ");
					infobox.append("span").attr("class","info-detail").text(d.species_list + ".");
					
					
						
				}
				infobox
						.style("left", (d3.event.pageX +5) + "px")
						.style("top", (d3.event.pageY -5) + "px")
						.transition().duration(300)
						.style("opacity", 1.0)
						.style("display", "block")
				}) // end on mouseover
			.on("mouseout", function(d) {infobox.transition().duration(300).style("opacity", 0.0);});
		}// end of the function draw_boxes

		function draw_legend(){
			var h1 = legend_height * (map_svg_dim/600);
			var px = 10;// was 10*(map_svg_dim/600);
			var rgh = 14*(map_svg_dim/600);
			var y = rgh + 15;
			var legendScale = d3.scale.ordinal().domain(colors.range()).rangeBands([0, map_svg_dim], 0.2, 0.2);
			map_element.selectAll(".legend").remove();
			var legend = map_element.append("svg").attr({"class": "legend", "width": map_svg_dim, "height": h1});
			legend.selectAll("rect").data(legendScale.domain()).enter().append("rect").attr("height", rgh)
				.attr("x", function(d){return legendScale(d);})
				.attr("width", legendScale.rangeBand())
				.style("fill",function(d,i) {return colors.range()[i];});
			legend.selectAll("text").data(legendScale.domain()).enter().append("text").attr({
				"x":function(d){ return legendScale(d)+legendScale.rangeBand()/2;},
				"y":y,
				"fill":"blank",
				"strocke":"none",
				"text-anchor":"middle",
				"font-family": "sans-serif",
				"font-size": px+"px"
				})
				.text(function(color){ 
					var extent = colors.invertExtent(color);
					if(extent[0]==null) extent[0] = mySetExtent[0];
					if(extent[1]==null) {
						extent[1] = mySetExtent[1];
					} else {
						extent[1] = --extent[1];
					}
					if(extent[0] > extent[1]){
						var tmp = extent[0];
							extent[0] = extent[1];
							extent[1] = tmp;		
					}
					return (extent[0] + "-" + extent[1]);
				})
		}// end of function draw_legend 

		
	} // end of function blockmap
	biomapr.fish = function (x, k) {
		var ẋ = [NaN].concat(x.sort(function(a,b) {return a - b;}));
		var m = x.length; // Number of data elements in x.

		var iwork = [],
				work = [];

		for (var i = 1; i <= m; i++) {
			var  iworkrow = [],
					workrow = [];
			for (var j = 1; j <= k; j++) {
				iworkrow[j] = 1;
				workrow[j] = Infinity;
			}
			iwork[i] = iworkrow;
			work[i] = workrow;
		}

		for (var i = 1; i <= m; i++) {
			var ss = 0,
					s = 0;
			for (var ii = 1; ii <= i; ii++) {
				var iii = i - ii + 1;
				ss = ss + Math.pow(ẋ[iii], 2);
				s = s + ẋ[iii];
				var sn = ii;
				var v = ss - Math.pow(s, 2)/sn;
				var ik = iii - 1;
				if (ik !== 0) {
					for (var j = 2; j <= k; j++) {
						if (work[i][j] >= v + work[ik][j - 1]) {
							iwork[i][j] = iii;
							work[i][j] = v + work[ik][j - 1];
						}
					}
				}
			}
			work[i][1] = v;
			iwork[i][1] = 1;
		}
		
		var il = m + 1,
				pe = ẋ.length,
				arr = [];
		for (var l = 1; l < k; l++) {
			var ll = k - l + 1,
					iu = il - 1;
			il = iwork[iu][ll];
			var sn = iu - il + 1;
			//console.log(ll + "	" + sn + " [" + ẋ.slice(pe-sn, pe) + "]");
			arr.push(ẋ[pe-sn]);
			pe = pe - sn;
		}
		return arr = arr.reverse();
	} // end biomapr.fish
	
	this.biomapr = biomapr;
}(); // end biomapr
Array.prototype.unique = function(a){return function(){ return this.filter(a) }}(function(a,b,c){ return c.indexOf(a,b+1) < 0 });
