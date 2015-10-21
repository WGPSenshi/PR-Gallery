function loadMap(mapname) {
	xmlDoc = loadXMLDoc('tiles/' + mapname + '/tilemapresource.xml');

	x = xmlDoc.getElementsByTagName('BoundingBox');

	var factorx = Math.abs(parseInt(x[0].getAttribute('minx'))) / 4096;
	var factory = Math.abs(parseInt(x[0].getAttribute('maxy'))) / 4096;
	mapwidth = Math.abs(parseInt(x[0].getAttribute('minx'))) / factorx;
	mapheight = Math.abs(parseInt(x[0].getAttribute('maxy'))) / factory;

	var sw = MAP.unproject([0, mapheight], 4);
	var ne = MAP.unproject([mapwidth, 0], 4);
	var bounds = new L.LatLngBounds(sw, ne);
	var mapimage = L.tileLayer('tiles/' + mapname + '/{z}/{x}/{y}.jpg', {
		minZoom : 0,
		maxZoom : 5,
		bounds : bounds,
		noWrap : true,
		attribution : '<a href="http://tournament.realitymod.com/showthread.php?t=34254">Project Reality Tournament</a>'
	});
	/*
	 for ( i = 0; i < gmlayers.length; i++) {
	 MAP.removeLayer(gmlayers[i]);
	 GMcontrol.removeLayer(gmlayers[i]);
	 }
	 for ( i = 0; i < routelayers.length; i++) {
	 MAP.removeLayer(routelayers[i]);
	 routecontrol.removeLayer(routelayers[i]);
	 }
	 */
	GMLIST = [];
	GMROUTES = [];
	GMLAYERS = [];
	GMNAMES = [];
	LAYER_ASSETS.clearLayers();
	LAYER_FLAGS.clearLayers();
	LAYER_FLAGRADIUS.clearLayers();
	LAYER_GRID.clearLayers();
	LAYER_ROUTES.clearLayers();
	LAYER_MAPTILES.clearLayers();
	LAYER_GRID.addLayer(L.simpleGraticule({
		interval : 256 / 41,
		offset : 256 / 41,
		showOriginLabel : false,
		showLabels : false,
		redraw : 'move',
		clickable : false,
		className : "simple-grid-line",
		lineStyle : {
			stroke : true,
			color : '#000',
			opacity : 0.5,
			weight : 0.2,
			clickable : false,
			className : "simple-grid-line"
		}
	}));
	LAYER_GRID.addLayer(L.simpleGraticule({
		interval : 256 / 41 * 3,
		offset : 256 / 41,
		showOriginLabel : false,
		showLabels : false,
		redraw : 'move',
		lineStyle : {
			stroke : true,
			color : '#000',
			opacity : 0.5,
			weight : 0.7,
			clickable : false,
			className : "simple-grid-line"
		}
	}));
	layercontrol.addOverlay(LAYER_GRID, "Grid Overlay");
	layercontrol.addOverlay(LAYER_FLAGS, "Flags");
	layercontrol.addOverlay(LAYER_FLAGRADIUS, "Flag Radius");
	LAYER_MAPTILES.addLayer(mapimage);
	layercontrol.addBaseLayer(LAYER_MAPTILES, "Satellite");
	MAP.setMaxBounds(bounds);
	MAP.addLayer(LAYER_MAPTILES);

	$.getJSON("map_json/" + mapname + "/listgm.json", function(d) {
		var list_gm = d;

		for ( i = 0; i < list_gm.length; i++) {
			var modename = "";
			if (list_gm[i].search("gpm_insurgency") != -1) {
				modename = "Insurgency";
			}
			if (list_gm[i].search("gpm_coop") != -1) {
				modename = "Coop";
			}
			if (list_gm[i].search("gpm_cq") != -1) {
				modename = "Assault and Secure";
			}
			if (list_gm[i].search("gpm_vehicles") != -1) {
				modename = "Vehicle Warfare";
			}
			if (list_gm[i].search("gpm_cnc") != -1) {
				modename = "Command and Control";
			}
			if (list_gm[i].search("gpm_skirmish") != -1) {
				modename = "Skirmish";
			}
			if (list_gm[i].search("16") != -1) {
				modename += " Infantry";
			}
			if (list_gm[i].search("32") != -1) {
				modename += " Alternative";
			}
			if (list_gm[i].search("64") != -1) {
				modename += " Standard";
			}
			if (list_gm[i].search("128") != -1) {
				modename += " Large";
			}
			GMLIST.push({
				"file" : list_gm[i],
				"name" : modename
			});
		}

		function compareGM(a, b) {
			if (a.name < b.name)
				return -1;
			if (a.name > b.name)
				return 1;
			return 0;
		}


		GMLIST.sort(compareGM);
		document.getElementById('SubTitle-title').innerHTML = "Choose a gamemode <div style='float:right'>&#x25bc;</div>";
		document.getElementById('SubTitle-list').innerHTML = "";
		for ( i = 0; i < GMLIST.length; i++) {
			document.getElementById('SubTitle-list').innerHTML += "<div class='gmselection hide' data-index='" + i + "'>" + GMLIST[i].name + "</div>";
		}
		MAP.setView([0, 0], 2);
		// Reset view
		MAP._onResize();
		// Ensure map is "refreshed" even if view doesn't change (updates grid, for example)

	}).fail(function(d, textStatus, error) {
		console.error(d);
		console.error("getJSON failed, status: " + textStatus + ", error: " + error);
	});
};

function loadGM(gamemode) {
	var gmfile = gamemode.file;
	var gmname = gamemode.name;
	document.getElementById('SubTitle-title').innerHTML = gmname + " <div style='float:right'>&#x25bc;</div>";
	CURRENTGM = {
		"objects" : [],
		"routes" : [],
		"flags" : []
	};
	$.getJSON(gmfile, function(data) {
		CURRENTGM.mapname = gmname;
		CURRENTGM.gm = gamemode;
		CURRENTGM.flags = [];
		CURRENTGM.flagradius = [];
		CURRENTGM.objects = [];
		CURRENTGM.routes = data.routes;
		CURRENTGM.team1name = data.team1;
		CURRENTGM.team1tickets = data.team1tickets;
		CURRENTGM.team2name = data.team2;
		CURRENTGM.team2tickets = data.team2tickets;
		CURRENTGM.mapsize = data.mapsize;
		CURRENTGM.viewdistance = data.viewdistance;
		// We don't actually use the Leaflet geojson layer, instead we use the function to access all individual features and sort them into their proper array with all the info we need. Actual loading will come later.
		L.geoJson(data, {
			pointToLayer : function(feature, latlng) {
				var iconurl = feature.properties.iconurl;
				var os_uid = 0;
				var cp_uid = 0;
				if (iconurl == '' || iconurl == 'null') {
					console.error("WARNING: BF2Object has no icon: " + feature.bf2props.name_object + ". Consider adding an exception.");
					iconurl = "icons/flags_map/minimap_uncappable.png";
				}
				if (feature.geometry.size) {
					var newmarker = L.marker(latlng, {
						icon : L.divIcon({
							iconSize : new L.Point(feature.geometry.size[0], feature.geometry.size[1]),
							className : 'icon',
							html : '<img style="width:100%" class="rotated" src=' + iconurl + ' data-rotate="' + feature.properties.iconrotate + '">'
						})
					});
				} else {
					var newmarker = L.marker(latlng, {
						icon : L.divIcon({
							iconSize : new L.Point(20, 20),
							className : 'icon',
							html : '<img style="width:100%" class="rotated" src=' + iconurl + ' data-rotate="' + feature.properties.iconrotate + ' data-code="' + feature.bf2props.name + '">'
						})
					});
				}
				if (feature.bf2props.class == "ObjectSpawner") {
					var popupContent = "";
					if (feature.properties) {
						var minspawn = parseInt(feature.bf2props.minspawn);
						var maxspawn = parseInt(feature.bf2props.maxspawn);

						popupContent += "<table><tr><td colspan='2'>" + feature.bf2props.name_object + "</td></tr>";
						if (minspawn < 0 || maxspawn < 0 || minspawn > 9999 || maxspawn > 9999 || (minspawn == 0 && maxspawn == 0)) {
							popupContent += "<tr><td>Respawn Time:</td><td> Never</td></tr>";
						} else {
							if (minspawn == minspawn) {
								popupContent += "<tr><td>Respawn Time:</td><td> " + minspawn + " s" + "</td></tr>";
							} else {
								popupContent += "<tr><td>Respawn Time:</td><td> " + minspawn + " to " + maxspawn + " s" + "</td></tr>";
							}
						}
						if (feature.bf2props.spawndelay == "true") {
							popupContent += "<tr><td>SpawnDelay:</td><td> Yes" + "</td></tr>";
						} else {
							popupContent += "<tr><td>SpawnDelay:</td><td> No" + "</td></tr>";
						}
						popupContent += "<tr><td>Team:</td><td>" + feature.bf2props.team + "</td></tr>";

						popupContent += "</table>";
					}
					newmarker.data = {};
					os_uid++;
					newmarker.data.uid = os_uid;
					newmarker.data.code = feature.bf2props.name;
					newmarker.data.name = feature.bf2props.name_object;
					newmarker.data.team = feature.bf2props.team;
					newmarker.data.minspawn = feature.bf2props.minspawn;
					newmarker.data.maxspawn = feature.bf2props.maxspawn;
					newmarker.data.iconurl = feature.properties.iconurl;
					newmarker.data.iconrotate = feature.properties.iconrotate;
					newmarker.bindPopup(popupContent);
					newmarker.on('mouseover', function(e) {
						// document.getElementById('RightPane').innerHTML = this.getPopup().getContent();
					});

					CURRENTGM.objects.push(newmarker);
					return null;
				} else if (feature.bf2props.class == "ControlPoint") {
					var flaglayer = new L.FeatureGroup();
					flaglayer.data = {};
					cp_uid++;
					flaglayer.data.uid = cp_uid;
					flaglayer.data.code = feature.bf2props.name;
					flaglayer.data.name = feature.bf2props.name_object;
					flaglayer.data.team = feature.bf2props.team;
					flaglayer.data.sgid = feature.bf2props.sgid;
					flaglayer.data.cpid = feature.bf2props.cpid;
					flaglayer.data.uncap = feature.bf2props.uncap;
					flaglayer.data.ttgc = feature.bf2props.ttgc;
					flaglayer.data.areavalue1 = feature.bf2props.areavalue1;
					flaglayer.data.areavalue2 = feature.bf2props.areavalue2;
					flaglayer.data.ttlc = feature.bf2props.ttlc;
					flaglayer.data.radius = feature.geometry.radius;
					flaglayer.addLayer(newmarker);
					if (feature.geometry.radius && feature.bf2props.uncap == "false") {
						var radiusmarker = L.circle(latlng, {
							color : 'red',
							weight : 2,
							opacity : 0.6,
							fill : true,
							fillColor : '#f03',
							fillOpacity : 0.1,
							radius : feature.geometry.radius
						});
						radiusmarker.radius = feature.geometry.radius;
						flaglayer.addLayer(radiusmarker);
					}
					var str_popup = "Name: " + flaglayer.data.name;
					str_popup += "<br/>Team: " + flaglayer.data.team;
					str_popup += "<br/>ControlPointID: " + flaglayer.data.cpid;
					str_popup += "<br/>SupplygroupID: " + flaglayer.data.sgid;
					str_popup += "<br/>Value Team 1: " + flaglayer.data.areavalue1;
					str_popup += "<br/>Value Team 2: " + flaglayer.data.areavalue2;

					flaglayer.bindPopup(str_popup);
					CURRENTGM.flags.push(flaglayer);

					return null;
				} else
					return null;
			}
		});

		// Now that we have all the data neatly packed away, let's bring our map up to speed!
		$('#MiddleHeader').find(".team1").html('');
		$('#MiddleHeader').find(".team2").html('');
		var team1flag = getFlagURL(CURRENTGM.team1name);
		var team2flag = getFlagURL(CURRENTGM.team2name);
		$('#MiddleHeader').find(".team1").append("<img src='" + team1flag + "' />");
		if (CURRENTGM.team1tickets)
			$('#MiddleHeader').find(".team1").append(" " + CURRENTGM.team1tickets);
		$('#MiddleHeader').find(".team2").append("<img src='" + team2flag + "' />");
		if (CURRENTGM.team2tickets)
			$('#MiddleHeader').find(".team2").append(" " + CURRENTGM.team2tickets);
		$('#MiddleHeader').removeClass('hide');

		var sorted_assets = [];
		for ( j = 0; j < CURRENTGM.objects.length; j++) {// Get and count same objects
			var object = CURRENTGM.objects[j];
			var objexists = false;
			for ( k = 0; k < sorted_assets.length; k++) {
				if (sorted_assets[k].data.name == object.data.name && sorted_assets[k].data.team == object.data.team && sorted_assets[k].data.minspawn == object.data.minspawn && sorted_assets[k].data.maxspawn == object.data.maxspawn) {
					sorted_assets[k].count += 1;
					objexists = true;
					break;
				}
			}
			if (!objexists) {
				object.count = 1;
				sorted_assets.push(object);
			}
		}
		LAYER_FLAGS.clearLayers();
		for ( j = 0; j < CURRENTGM.flags.length; j++) {// Handle flags
			var flag = CURRENTGM.flags[j];
			flag.addTo(LAYER_FLAGS);
		}

		LAYER_FLAGRADIUS.clearLayers();
		for ( j = 0; j < CURRENTGM.flagradius.length; j++) {// Handle flag radius
			var flag = CURRENTGM.flagradius[j];
			flag.addTo(LAYER_FLAGRADIUS);
		}

		LAYER_ROUTES.clearLayers();
		if (CURRENTGM.routes.length > 1)
			$("#AAS-button").removeClass("hide");
		else if (!$("#AAS-button").hasClass("hide"))
			$("#AAS-button").addClass("hide");
		var route_colors = ["#FFFFFF", "#FF0000", "#7F00FF", "#7FFF00", "#00FFFF", "#0000FF", "#00FF7F", "#FF007F", "#FFFF00"];
		// Some crazy colors for routes to pick
		for ( i = 0; i < CURRENTGM.routes.length; i++) {
			var curroute = CURRENTGM.routes[i];
			var curroutelayer = L.featureGroup();
			for ( j = 0; j < curroute.length; j++) {
				var curstep = curroute[j];
				var curflags = [];
				for ( k = 0; k < curstep.length; k++) {
					var curflagname = curstep[k];
					for ( l = 0; l < CURRENTGM.flags.length; l++) {
						if (curflagname == CURRENTGM.flags[l].data.code) {
							curflags.push(CURRENTGM.flags[l]);
							break;
						}
					}
				}
				var curlatlng_avg = L.latLng(0, 0);
				for ( k = 0; k < curflags.length; k++) {
					curlatlng_avg.lat += curflags[k].getBounds().getCenter().lat;
					curlatlng_avg.lng += curflags[k].getBounds().getCenter().lng;
					//curlatlng_avg.lng += curflags[k].getLatLng().lng;
				}
				curlatlng_avg.lat = curlatlng_avg.lat / curflags.length;
				curlatlng_avg.lng = curlatlng_avg.lng / curflags.length;

				// Average all flags in the same step (random flags). Marked by dashed lines. Connecting to next/previous steps by a virtual average LatLng
				if (curflags.length > 1) {
					var curconnector = L.polyline([curflags[0].getBounds().getCenter(), curlatlng_avg], {
						clickable : false,
						pointerEvents : 'none',
						color : route_colors[i],
						dashArray : "20,10",
						opacity : 0.6
					});
					for ( k = 1; k < curflags.length; k++) {
						var curlatlng = curconnector.getLatLngs();
						var newlatlng = [];
						newlatlng.push([curlatlng]);
						newlatlng.push([curflags[k].getBounds().getCenter(), curlatlng_avg]);
						curconnector.setLatLngs(newlatlng);
					}
					curconnector.data = {
						type : 'curconnector',
						route : i,
						link : curstep
					};
					curconnector.addTo(curroutelayer);

				}

				if (j < curroute.length - 1) {
					var nextstep = curroute[j + 1];
					var nextflags = [];
					for ( k = 0; k < nextstep.length; k++) {
						var nextflagname = nextstep[k];
						for ( l = 0; l < CURRENTGM.flags.length; l++) {
							if (nextflagname == CURRENTGM.flags[l].data.code) {
								nextflags.push(CURRENTGM.flags[l]);
								break;
							}
						}
					}

					var nextlatlng_avg = L.latLng(0, 0);
					for ( k = 0; k < nextflags.length; k++) {
						nextlatlng_avg.lat += nextflags[k].getBounds().getCenter().lat;
						nextlatlng_avg.lng += nextflags[k].getBounds().getCenter().lng;
						//nextlatlng_avg.lat += nextflags[k].getLatLng().lat;
						//nextlatlng_avg.lng += nextflags[k].getLatLng().lng;
					}
					nextlatlng_avg.lat = nextlatlng_avg.lat / nextflags.length;
					nextlatlng_avg.lng = nextlatlng_avg.lng / nextflags.length;

					// Connection between current and next step. Always a solid line.
					var curnextconnector = L.polyline([curlatlng_avg, nextlatlng_avg], {
						clickable : false,
						pointerEvents : 'none',
						color : route_colors[i],
						opacity : 0.8
					});
					curnextconnector.data = {
						type : 'curnextconnector',
						route : i,
						link : [curstep, nextstep]

					};
					curnextconnector.addTo(curroutelayer);
				}
			}

			curroutelayer.routeindex = i;
			GMROUTES.push(curroutelayer);
			LAYER_ROUTES.addLayer(curroutelayer);

		}
		document.getElementById('AAS-button-list').innerHTML = "";
		for ( i = 0; i < CURRENTGM.routes.length; i++) {
			document.getElementById('AAS-button-list').innerHTML += "<div class='AASselection' data-index='" + i + "'>Route " + (i + 1) + "</div>";
		}

		function compare(a, b) {
			if (a.data.team < b.data.team)
				return -1;
			if (a.data.team > b.data.team)
				return 1;
			return 0;
		}


		sorted_assets.sort(compare);
		LAYER_ASSETS.clearLayers();
		for ( i = 0; i < CURRENTGM.objects.length; i++) {
			LAYER_ASSETS.addLayer(CURRENTGM.objects[i]);
		}
		resetRotation();

		/* Fill Asset List */
		document.getElementById('RPane-content').innerHTML = "";
		for ( i = 0; i < sorted_assets.length; i++) {
			var stringadd = "";
			var feature = sorted_assets[i];
			var minspawn = parseInt(feature.data.minspawn);
			var maxspawn = parseInt(feature.data.maxspawn);
			var spawntime = 0;
			stringadd += "<div class='asset-row team" + feature.data.team + "'>";
			stringadd += '<img src=' + feature.data.iconurl + '>';
			stringadd += "<div class='asset-qt'>" + feature.count + "x</div>";
			stringadd += "<div class='asset-name'>" + feature.data.name + "</div>";
			stringadd += "<div class='asset-delay'>Respawn Time: ";

			if (minspawn < 0 || maxspawn < 0 || minspawn > 9999 || maxspawn > 9999) {
				stringadd += "Never</div>";
			} else if (minspawn == 0 && maxspawn == 0) {
				stringadd += "Instant</div>";
			} else {
				if (minspawn == minspawn) {
					stringadd += (minspawn / 60) + " min</div>";
				} else {
					stringadd += (minspawn / 60) + " to " + (maxspawn / 60) + " min</div>";
				}
			}
			stringadd += "</div>";
			document.getElementById('RPane-content').innerHTML += stringadd;
		};

	}).fail(function(d, textStatus, error) {
		console.error("getJSON failed, status: " + textStatus + ", error: " + error);
	});
}
