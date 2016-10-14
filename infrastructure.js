//if(!!window.Worker)
//	var dworker = new Worker('develop.js');
//else
//	console.log('workers not supported!');

function updatePlacementPosition(mouse) {
	keyPressed = false;
	raycaster.setFromCamera(mouse, camera);
	var terrainIntData = raycaster.intersectObject(scene.getObjectByName("terrain").children[0]);
	if(terrainIntData[0])
	{
		if(current)
			plopPreview(current, true, mode);
		current = (terrainIntData[0].faceIndex/2)|0;
		plopPreview(current, false, mode);
	}
	return current;
}

function updateSelectedTilePosition(mouse) {
	keyPressed = false;
	raycaster.setFromCamera(mouse, camera);
	var terrainIntData = raycaster.intersectObject(scene.getObjectByName("terrain").children[0]);
	if(terrainIntData[0])
	{
		if(current)
			if(mode == 64)
				demolishPreview(current, anchor, true);
			else if(mode == 24)
				dezonePreview(current, anchor, true);
			else if(mode < 12)
				placeRoadPreview(current, anchor, true, mode, buildBridge ? bridgeHeight : null);
			else
				placeZonePreview(current, anchor, true, mode);
		current = (terrainIntData[0].faceIndex/2)|0;
		if(mode == 64)
			demolishPreview(current, anchor, false);
		else if(mode == 24)
			dezonePreview(current, anchor, false);
		else if (mode < 12)
			placeRoadPreview(current, anchor, false, mode, buildBridge ? bridgeHeight : null);
		else
			placeZonePreview(current, anchor, false, mode);
	}
	return current;
}

function plopPreview (current, revert, mode) {
	var c = current%TERRAIN_SIZE;
	var d = (current/TERRAIN_SIZE)|0;
	if(revert)
		revertPloppable(c, d);
	else
		placePloppable(c, d, true, false, mode);
}

function dezonePreview (current, anchor, revert) {
	var a = lastAnchor !== null ? lastAnchor%TERRAIN_SIZE : anchor !== null ? anchor%TERRAIN_SIZE : current%TERRAIN_SIZE;
	var b = lastAnchor !== null ? (lastAnchor/TERRAIN_SIZE)|0 : anchor !== null ? (anchor/TERRAIN_SIZE)|0 : (current/TERRAIN_SIZE)|0;
	var c = current%TERRAIN_SIZE;
	var d = (current/TERRAIN_SIZE)|0;
	var x;
	var z;
	if(revert)
	{
		for(b < d ? z = b : z = d; b < d ? z <= d : z <= b; z++)
			for(a < c ? x = a : x = c; a < c ? x <= c : x <= a; x++)
				revertZoneTile(x, z);
	}
	else
	{
		for(b < d ? z = b : z = d; b < d ? z <= d : z <= b; z++)
			for(a < c ? x = a : x = c; a < c ? x <= c : x <= a; x++)
				zoneTile(x, z, 0, true, true, false);
	}
}

function demolishPreview (current, anchor, revert) {
	var a = lastAnchor !== null ? lastAnchor%TERRAIN_SIZE : anchor !== null ? anchor%TERRAIN_SIZE : current%TERRAIN_SIZE;
	var b = lastAnchor !== null ? (lastAnchor/TERRAIN_SIZE)|0 : anchor !== null ? (anchor/TERRAIN_SIZE)|0 : (current/TERRAIN_SIZE)|0;
	var c = current%TERRAIN_SIZE;
	var d = (current/TERRAIN_SIZE)|0;
	var y = buildBridge ? Math.max.apply(null, getHeightForTile(a, b)) +bridgeHeight : null;
	var x;
	var z;
	if(revert)
	{
		for(b < d ? z = b : z = d; b < d ? z <= d : z <= b; z++)
			for(a < c ? x = a : x = c; a < c ? x <= c : x <= a; x++)
			{
				revertRoadSegment(x, z, y);
				revertPloppable(x, z);
				revertDevelopment(x, z);
			}
	}
	else
	{
		for(b < d ? z = b : z = d; b < d ? z <= d : z <= b; z++)
			for(a < c ? x = a : x = c; a < c ? x <= c : x <= a; x++)
			{
				placeRoadSegment(x, z, 0, true, true, y);
				placePloppable(x, z, true, true);
				resetDevelopment(x, z, true);
			}
	}
}

function placeZonePreview (current, anchor, revert, mode) {
	var a = lastAnchor !== null ? lastAnchor%TERRAIN_SIZE : anchor !== null ? anchor%TERRAIN_SIZE : current%TERRAIN_SIZE;
	var b = lastAnchor !== null ? (lastAnchor/TERRAIN_SIZE)|0 : anchor !== null ? (anchor/TERRAIN_SIZE)|0 : (current/TERRAIN_SIZE)|0;
	var c = current%TERRAIN_SIZE;
	var d = (current/TERRAIN_SIZE)|0;
	var x;
	var z;
	if(revert)
	{
		for(b < d ? z = b : z = d; b < d ? z <= d : z <= b; z++)
			for(a < c ? x = a : x = c; a < c ? x <= c : x <= a; x++)
				revertZoneTile(x, z);
	}
	else
	{
		for(b < d ? z = b : z = d; b < d ? z <= d : z <= b; z++)
			for(a < c ? x = a : x = c; a < c ? x <= c : x <= a; x++)
				zoneTile(x, z, mode, true, false, false);
	}
}

function placeRoadPreview(current, anchor, revert, mode, h) {
	var a = lastAnchor !== null ? lastAnchor%TERRAIN_SIZE : anchor !== null ? anchor%TERRAIN_SIZE : current%TERRAIN_SIZE;
	var b = lastAnchor !== null ? (lastAnchor/TERRAIN_SIZE)|0 : anchor !== null ? (anchor/TERRAIN_SIZE)|0 : (current/TERRAIN_SIZE)|0;
	var c = current%TERRAIN_SIZE;
	var d = (current/TERRAIN_SIZE)|0;
	var y = h === null || h === undefined ? null : Math.max.apply(null, getHeightForTile(a, b)) +h;
	if(revert)
	{
		if(Math.abs(d -b) > Math.abs(c -a))//north-south
		{
			if(b < d)//dragging south
				for(var z = b; z <= d; z++)
					revertRoadSegment(a, z, y);
			else if(b > d)//dragging north
				for(var z = d; z <= b; z++)
					revertRoadSegment(a, z, y);
		}
		else//east-west and no direction
		{
			if(a < c)//dragging east
				for(var x = a; x <= c; x++)
					revertRoadSegment(x, b, y);
			else if(a > c)//dragging west
				for(var x = c; x <= a; x++)
					revertRoadSegment(x, b, y);
			else//no direction
				revertRoadSegment(c, d, y);
		}
	}
	else if(lastAnchor === null)
	{
		if(Math.abs(d -b) > Math.abs(c -a))//north-south
		{
			if(b < d)//dragging south
				for(var z = b; z <= d; z++)
					placeRoadSegment(a, z, mode -4, true, false, y);
			else if(b > d)//dragging north
				for(var z = d; z <= b; z++)
					placeRoadSegment(a, z, mode -4, true, false, y);
		}
		else//east-west and no direction
		{
			if(a < c)//dragging east
				for(var x = a; x <= c; x++)
					placeRoadSegment(x, b, mode -4, true, false, y);
			else if(a > c)//dragging west
				for(var x = c; x <= a; x++)
					placeRoadSegment(x, b, mode -4, true, false, y);
			else//no direction
				placeRoadSegment(c, d, mode -4, true, false, y);
		}
	}
}


function zoneTile(x, z, mode, preview, demolish, hide) {
	var road = Road.roads[z][x];
	var plop = Plop.plops[z][x];
	var zone = Zone.zones[z][x];
	var grow = Grow.growers[z][x];
	if(!demolish && ((plop && !plop.preview) || (road && road.buffer)))
	{
		console.log("Not enough space to zone tile!");
		return;
	}
	else if(zone)
	{
		if(!preview && demolish)
		{
			if(grow)
			{
				grow.del();
				grow = null;
			}
			if(zone.model)
				scene.remove(zone.model);
			Zone.zones[z][x] = null;
		}
		else
			zone.modify(mode, preview, demolish, hide);
	}
	else if(!demolish)
		Zone.zones[z][x] = new Zone(x, z, preview, mode);
}

function placePloppable(x, z, preview, demolish, mode) {
	//no need to check for every tile b/c of multiple pointers here
	var road = Road.roads[z][x];
	var plop = Plop.plops[z][x];
	var zone = Zone.zones[z][x];
//	if(!demolish)
//	{
//		for(var a = 0; a < Plop.sizes[mode].x; a++)
//			for(var b = 0; b < Plop.sizes[mode].y; b++)
//			{
//				var road = Road.roads[z +b][x +a];
//				var plop = Plop.plops[z +b][x +a];
//				if((road && road.buffer) || (plop && !plop.preview))
//				{
//					console.log("Not enough space to plop Plop!");
//					return;
//				}
//			}
//	}
	if(plop)
	{
		//make sure that destruction/modification loop starts where it should
		var x1 = plop.x;
		var z1 = plop.z;
		if(!preview && demolish)
		{
			scene.remove(plop.model);
			for(var a = 0; a < Plop.sizes[plop.mode].x; a++)
				for(var b = 0; b < Plop.sizes[plop.mode].z; b++)	
					Plop.plops[z1 +b][x1 +a] = null;
		}
		else
		{
			plop.modify(preview, demolish);
			for(var a = 0; a < Plop.sizes[plop.mode].x; a++)
				for(var b = 0; b < Plop.sizes[plop.mode].z; b++)
					if(Zone.zones[z1 +b][x1 +a])
						zoneTile(x1 +a, z1 +b, 0, preview, true, true);//overwriting zones
		}
	}
	else if(!demolish)
	{
		
		if(!checkForPlopSpace(x, z))
			return;
		plop = new Plop(x, z, preview, mode);
		for(var a = 0; a < Plop.sizes[mode].x; a++)
			for(var b = 0; b < Plop.sizes[mode].z; b++)
				if(Zone.zones[z +b][x +a])
					zoneTile(x +a, z +b, 0, preview, true, true);//overwriting zones
	}
}

function checkForPlopSpace(x, z) {
	for(var a = 0; a < Plop.sizes[mode].x; a++)
		for(var b = 0; b < Plop.sizes[mode].z; b++)
		{
			y = getHeightForBuilding(x, z, Plop.sizes[mode].x, Plop.sizes[mode].z);
			for(var c = 0; c < Plop.sizes[mode].y; c += 0.25)
				if(Road.bridges[z +b][x +a][y +c])
					return false;
			if((Plop.plops[z +b][x +a] && !Plop.plops[z +b][x +a].preview) || Road.roads[z +b][x +a])
				return false;
		}
	return true;
}

function placeRoadSegment(x, z, capacity, preview, demolish, y) {
	var road = y === null || y === undefined ? Road.roads[z][x] : Road.bridges[z][x][y];
	var plop = Plop.plops[z][x];
	var zone = Zone.zones[z][x];
//	if(plop && !demolish)
//	{
//		console.log("Not enough space to lay road!")
//		return;
//	}
	if(road)//there is a road at specified x and z
	{
		if(!preview && demolish)
		{
			scene.remove(road.model);
			y === null || y === undefined ? Road.roads[z][x] = null : Road.bridges[z][x][y] = null;
			road.matchNeighbors(preview, demolish);
		}
		else
		{
			road.modify(capacity, preview, demolish);
			if(zone)
				zoneTile(x, z, 0, preview, true, true);//overwriting zones
		}
	}
	else if(!demolish)//must come last or deomlished model will reappear
	{
		road = new Road(x, z, capacity, preview, y);
		road.matchNeighbors(preview, false);
		if(zone)
			zoneTile(x, z, 0, preview, true, true);//overwriting zones
	}
}

function resetDevelopment (x, z, preview) {
	 var grow = Grow.growers[z][x];
	 if(grow)
	 	if(preview)
	 		grow.updateModel(true);
	 	else
	 		grow.del();
}

function revertZoneTile(x, z) {
	var zone = Zone.zones[z][x];
	if(zone && zone.buffer)
		zone.revert();
	else if(zone)
	{
		if(zone.model)
			scene.remove(zone.model);
		Zone.zones[z][x] = null;
	}
}

function revertPloppable(x, z) {
	var plop = Plop.plops[z][x];
	if(plop)
	{	
		//make sure that destruction loop starts where it should
		var x1 = Plop.plops[z][x].x;
		var z1 = Plop.plops[z][x].z;
		if(!plop.preview)
		{
			plop.revert();
			for(var a = 0; a < Plop.sizes[plop.mode].x; a++)
				for(var b = 0; b < Plop.sizes[plop.mode].z; b++)	
					revertZoneTile(x1 +a, z1 +b);
		}
		else
		{
			scene.remove(plop.model);
			for(var a = 0; a < Plop.sizes[plop.mode].x; a++)
				for(var b = 0; b < Plop.sizes[plop.mode].z; b++)	
				{
					Plop.plops[z1 +b][x1 +a] = null;
					revertZoneTile(x1 +a, z1 +b);
				}
		}
	}
}

function revertDevelopment (x, z) {
	  var grow = Grow.growers[z][x];
	  if(grow)
	  	grow.updateModel(false);
}

function revertRoadSegment(x, z, y) {
	var road = y === null || y === undefined ? Road.roads[z][x] : Road.bridges[z][x][y];
	if(road && road.buffer)//there is a non-preview road at specified x and z
	{
		road.revert();
		road.matchNeighbors(true, false);
	}
	else if(road)//preview road segment at specified x and z
	{
		scene.remove(road.model);
		y === null || y === undefined ? Road.roads[z][x] = null : Road.bridges[z][x][y] = null;
		road.matchNeighbors(true, false);
	}
	revertZoneTile(x, z);
}

function plop (mode) {
	var c = current%TERRAIN_SIZE;
	var d = (current/TERRAIN_SIZE)|0;
	placePloppable(c, d, false, false, mode);
}

function demolish () {
	var a = lastAnchor !== null ? lastAnchor%TERRAIN_SIZE : anchor !== null ? anchor%TERRAIN_SIZE : current%TERRAIN_SIZE;
	var b = lastAnchor !== null ? (lastAnchor/TERRAIN_SIZE)|0 : anchor !== null ? (anchor/TERRAIN_SIZE)|0 : (current/TERRAIN_SIZE)|0;
	var c = current%TERRAIN_SIZE;
	var d = (current/TERRAIN_SIZE)|0;
	var y = buildBridge ? Math.max.apply(null, getHeightForTile(a, b)) +bridgeHeight : null;
	var x;
	var z;
	for(b < d ? z = b : z = d; b < d ? z <= d : z <= b; z++)
		for(a < c ? x = a : x = c; a < c ? x <= c : x <= a; x++)
		{
			placeRoadSegment(x, z, 0, false, true, y);
			placePloppable(x, z, false, true, 0);
			resetDevelopment(x, z, false);
		}
}

function zone (mode) {
	var a = lastAnchor !== null ? lastAnchor%TERRAIN_SIZE : anchor !== null ? anchor%TERRAIN_SIZE : current%TERRAIN_SIZE;
	var b = lastAnchor !== null ? (lastAnchor/TERRAIN_SIZE)|0 : anchor !== null ? (anchor/TERRAIN_SIZE)|0 : (current/TERRAIN_SIZE)|0;
	var c = current%TERRAIN_SIZE;
	var d = (current/TERRAIN_SIZE)|0;
	var x;
	var z;
	for(b < d ? z = b : z = d; b < d ? z <= d : z <= b; z++)
		for(a < c ? x = a : x = c; a < c ? x <= c : x <= a; x++)
		{
			if(mode === 0)
				zoneTile(x, z, mode, false, true, false);
			else
				zoneTile(x, z, mode, false, false, false);
		}
}

function constructRoad(mode, h) {
	var a = lastAnchor !== null ? lastAnchor%TERRAIN_SIZE : anchor !== null ? anchor%TERRAIN_SIZE : current%TERRAIN_SIZE;
	var b = lastAnchor !== null ? (lastAnchor/TERRAIN_SIZE)|0 : anchor !== null ? (anchor/TERRAIN_SIZE)|0 : (current/TERRAIN_SIZE)|0;
	var c = current%TERRAIN_SIZE;
	var d = (current/TERRAIN_SIZE)|0;
	var y = h === null || h === undefined ? null : Math.max.apply(null, getHeightForTile(a, b)) +h;
	if(Math.abs(d -b) > Math.abs(c -a))//north-south
	{
		if(b < d)//dragging south
			for(var z = b; z <= d; z++)
				placeRoadSegment(a, z, mode -4, false, false, y);
		else if(b > d)//dragging north
			for(var z = d; z <= b; z++)
				placeRoadSegment(a, z, mode -4, false, false, y);
	}
	else//east-west and no direction
	{
		if(a < c)//dragging east
			for(var x = a; x <= c; x++)
				placeRoadSegment(x, b, mode -4, false, false, y);
		else if(a > c)//dragging west
		{
			for(var x = c; x <= a; x++)
				placeRoadSegment(x, b, mode -4, false, false, y);
		}
		else//no direction
			placeRoadSegment(c, d, mode -4, false, false, y);
	}
}

function cleanUp() {
	terrainIndicator(current, anchor, true);
	placeRoadPreview(current, anchor, true, null, null);
	placeRoadPreview(current, anchor, true, null, bridgeHeight);
	plopPreview(current, true, 0);
	placeZonePreview(current, anchor, true, 0);
	demolishPreview(current, anchor, true);
}