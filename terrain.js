function updateSelectedVertexPosition(mouse) {
	if(keyPressed)
		clearColors();
	keyPressed = false;
	raycaster.setFromCamera(mouse, camera);
	var terrainIntData = raycaster.intersectObject(scene.getObjectByName("terrain").children[0]);
	if(terrainIntData[0])
	{
		if(current)
			terrainIndicator(current, anchor, true);
		
		current = findNearestVertex(terrainIntData[0].point, terrainIntData[0].face);
		terrainIndicator(current, anchor, false);
	}
	return current;
}

function findNearestVertex(point, face) {
	var terrain = scene.getObjectByName("terrain").children[0];
	var distances = [terrain.geometry.vertices[face.a].clone().distanceTo(point),
					terrain.geometry.vertices[face.b].clone().distanceTo(point),
					terrain.geometry.vertices[face.c].clone().distanceTo(point)];
	var minDIndex = 0;
	for (var i = 0; i < distances.length; i++)
		if(distances[i] < distances[minDIndex])
			minDIndex = i;
	var nearestVertex = minDIndex === 0 ? face.a : (minDIndex == 1 ? face.b : face.c);
	return nearestVertex;
}

function findFaces(nearest) {
	return [nearest%(TERRAIN_SIZE +1) != 0				?	2*TERRAIN_SIZE*((nearest/(TERRAIN_SIZE +1)|0) -1)	+2*(nearest%(TERRAIN_SIZE +1)) -1	: -1,
			nearest%(TERRAIN_SIZE +1) != 0				?	2*TERRAIN_SIZE*(nearest/(TERRAIN_SIZE +1)|0)		+2*(nearest%(TERRAIN_SIZE +1)) -2	: -1,
			nearest%(TERRAIN_SIZE +1) != 0				?	2*TERRAIN_SIZE*(nearest/(TERRAIN_SIZE +1)|0)		+2*(nearest%(TERRAIN_SIZE +1)) -1	: -1,
			nearest%(TERRAIN_SIZE +1) != TERRAIN_SIZE	?	2*TERRAIN_SIZE*((nearest/(TERRAIN_SIZE +1)|0) -1)	+2*(nearest%(TERRAIN_SIZE +1))		: -1,
			nearest%(TERRAIN_SIZE +1) != TERRAIN_SIZE	?	2*TERRAIN_SIZE*((nearest/(TERRAIN_SIZE +1)|0) -1)	+2*(nearest%(TERRAIN_SIZE +1)) +1	: -1,
			nearest%(TERRAIN_SIZE +1) != TERRAIN_SIZE	?	2*TERRAIN_SIZE*(nearest/(TERRAIN_SIZE +1)|0)		+2*(nearest%(TERRAIN_SIZE +1))		: -1
			];
}

function colorFaces(current, anchor, revert) {
	var terrain = scene.getObjectByName("terrain").children[0];
	//vertexIndices = [2,2,1,0,0,1];
	vertexIndices = [2,0,0,2,1,1];

	//vertexIndices = [1,1,1,1,1,1];
	var faceIndices = [];
	var formercolors = [];
	var a = lastAnchor !== null ? terrain.geometry.vertices[lastAnchor].x +TERRAIN_SIZE/2 : anchor !== null ? terrain.geometry.vertices[anchor].x +TERRAIN_SIZE/2 : terrain.geometry.vertices[current].x +TERRAIN_SIZE/2;
	var b = lastAnchor !== null ? terrain.geometry.vertices[lastAnchor].z +TERRAIN_SIZE/2 : anchor !== null ? terrain.geometry.vertices[anchor].z +TERRAIN_SIZE/2 : terrain.geometry.vertices[current].z +TERRAIN_SIZE/2;
	var c = terrain.geometry.vertices[current].x +TERRAIN_SIZE/2;
	var d = terrain.geometry.vertices[current].z +TERRAIN_SIZE/2;
	var x;
	var z;
	for(b < d ? z = b : z = d; b < d ? z <= d : z <= b; z++)
		for(a < c ? x = a : x = c; a < c ? x <= c : x <= a; x++)
			faceIndices.push(findFaces(z*(TERRAIN_SIZE +1) +x));
	if(revert)
	{
		for (var i = 0; i < faceIndices.length; i++)
		{
			for (var j = 0; j < 6; j++)
			{
				if(faceIndices[i][j] >= 0 && faceIndices[i][j] < 2*TERRAIN_SIZE*TERRAIN_SIZE)
				{
					var vertexLog = vertexIndices[j] === 0 ? terrain.geometry.faces[faceIndices[i][j]].a : (vertexIndices[j] == 1 ? terrain.geometry.faces[faceIndices[i][j]].b : terrain.geometry.faces[faceIndices[i][j]].c);
					formercolors[j] = calcGroundColor(terrain.geometry.vertices[z*(TERRAIN_SIZE +1) +x].y);
					console.log("Vertex " + vertexLog + " in Face # " + faceIndices[i][j] + " is about to be uncolored. Originally " + terrain.geometry.faces[faceIndices[i][j]].vertexColors[vertexIndices[j]].r);
					terrain.geometry.faces[faceIndices[i][j]].vertexColors[vertexIndices[j]].copy(formercolors[j]);
				}
			}
		}
		console.log("End loop");
	}
	else if(lastAnchor === null)
	{
		for (var i = 0; i < faceIndices.length; i++)
		{
			for (var j = 0; j < 6; j++)
			{
				if(faceIndices[i][j] >= 0 && faceIndices[i][j] < 2*TERRAIN_SIZE*TERRAIN_SIZE)
				{
					var vertexLog = vertexIndices[j] === 0 ? terrain.geometry.faces[faceIndices[i][j]].a : (vertexIndices[j] == 1 ? terrain.geometry.faces[faceIndices[i][j]].b : terrain.geometry.faces[faceIndices[i][j]].c);
					console.log("Vertex " + vertexLog + " in Face # " + faceIndices[i][j] + " is about to be colored. Originally " + terrain.geometry.faces[faceIndices[i][j]].vertexColors[vertexIndices[j]].r);
					terrain.geometry.faces[faceIndices[i][j]].vertexColors[vertexIndices[j]].setHex(0xff0000);
					
				}
			}
		}
		console.log("End loop");
	}
	terrain.geometry.colorsNeedUpdate = true;
}

function terrainIndicator(current, anchor, revert) {
	var terrain = scene.getObjectByName("terrain").children[0];
	var vertexIndices = [];
	var a = lastAnchor !== null ? terrain.geometry.vertices[lastAnchor].x +TERRAIN_SIZE/2 : anchor !== null ? terrain.geometry.vertices[anchor].x +TERRAIN_SIZE/2 : terrain.geometry.vertices[current].x +TERRAIN_SIZE/2;
	var b = lastAnchor !== null ? terrain.geometry.vertices[lastAnchor].z +TERRAIN_SIZE/2 : anchor !== null ? terrain.geometry.vertices[anchor].z +TERRAIN_SIZE/2 : terrain.geometry.vertices[current].z +TERRAIN_SIZE/2;
	var c = terrain.geometry.vertices[current].x +TERRAIN_SIZE/2;
	var d = terrain.geometry.vertices[current].z +TERRAIN_SIZE/2;
	var x;
	var z;
	for(b < d ? z = b : z = d; b < d ? z <= d : z <= b; z++)
		for(a < c ? x = a : x = c; a < c ? x <= c : x <= a; x++)
			vertexIndices.push((z*(TERRAIN_SIZE +1) +x));
	if(revert)
	{
		for(var i = 0; i < vertexIndices.length; i++)
		{
			var sphere = terrain.getObjectByName("sphere " + i);
			terrain.remove(sphere);
			sphere = 0;
		}
	}
	else if(lastAnchor === null)
	{
		for(var i = 0; i < vertexIndices.length; i++)
		{
			var newSphereGeo = new THREE.SphereGeometry(0.125);
			newSphereGeo.translate(terrain.geometry.vertices[vertexIndices[i]].x, terrain.geometry.vertices[vertexIndices[i]].y, terrain.geometry.vertices[vertexIndices[i]].z);
			var material = new THREE.MeshLambertMaterial({color: 0xff0000});
			var sphere = new THREE.Mesh(newSphereGeo, material);
			sphere.name = "sphere " + i;
			terrain.add(sphere);
		}
	}
}

function getHeightForTile(x, z) {
	var terrain = scene.getObjectByName("terrain").children[0];
	var index = z*(TERRAIN_SIZE +1) +x;
	return [terrain.geometry.vertices[index].y, terrain.geometry.vertices[index +1].y, terrain.geometry.vertices[index +TERRAIN_SIZE +2].y, terrain.geometry.vertices[index +TERRAIN_SIZE +1].y];
}

function getHeightForBuilding(x, z, sizeX, sizeZ) {
	var terrain = scene.getObjectByName("terrain").children[0];
	var height = 0;
	for(var a = 0; a <= sizeX; a++)
		for(var b = 0; b <= sizeZ; b++)
			height += terrain.geometry.vertices[(z +b)*(TERRAIN_SIZE +1) +x +a].y;
	height /= (sizeX +1)*(sizeZ +1);
	height = height > 0 ? ((height*4 +.5)|0)/4 : ((height*4 -.5)|0)/4;
	return height;
}

function clearColors() {
	colorFaces(0, (TERRAIN_SIZE)*(TERRAIN_SIZE) -1, true);
}

function editTerrain(raise) {
	var terrain = scene.getObjectByName("terrain").children[0];
	var a = lastAnchor !== null ? terrain.geometry.vertices[lastAnchor].x +TERRAIN_SIZE/2 : anchor !== null ? terrain.geometry.vertices[anchor].x +TERRAIN_SIZE/2 : terrain.geometry.vertices[current].x +TERRAIN_SIZE/2;
	var b = lastAnchor !== null ? terrain.geometry.vertices[lastAnchor].z +TERRAIN_SIZE/2 : anchor !== null ? terrain.geometry.vertices[anchor].z +TERRAIN_SIZE/2 : terrain.geometry.vertices[current].z +TERRAIN_SIZE/2;
	var c = terrain.geometry.vertices[current].x +TERRAIN_SIZE/2;
	var d = terrain.geometry.vertices[current].z +TERRAIN_SIZE/2;
	var x;
	var z;
	for(b < d ? z = b : z = d; b < d ? z <= d : z <= b; z++)
		for(a < c ? x = a : x = c; a < c ? x <= c : x <= a; x++)
			raisePoint(z*(TERRAIN_SIZE +1) +x, raise);
	terrain.geometry.verticesNeedUpdate = true;
	terrain.geometry.normalsNeedUpdate = true;
	terrain.geometry.colorsNeedUpdate = true;
}

function raisePoint(index, raise) {
	var terrain = scene.getObjectByName("terrain").children[0];
	var x = terrain.geometry.vertices[index].x +TERRAIN_SIZE/2;
	var z = terrain.geometry.vertices[index].z +TERRAIN_SIZE/2;
	//check for x -1 and z -1 too since we are dealing with vertices, not cells
	var blocked = false;
	var road = [Road.roads[z][x], Road.roads[z][x -1], Road.roads[z -1][x], Road.roads[z -1][x -1]];
	var bridges = [Road.bridges[z][x], Road.bridges[z][x -1], Road.bridges[z -1][x], Road.bridges[z -1][x -1]];
	var plop = [Plop.plops[z][x], Plop.plops[z][x -1], Plop.plops[z -1][x], Plop.plops[z -1][x -1]];
	var point = terrain.geometry.vertices[index];
	for(var i = 0; i < 4; i++)
	{
		for (var j = point.y -.5; j <= point.y +.5 ; j += .25)
			if(bridges[i][j] && bridges[i][j].buffer)
				blocked = true;
		if((road[i] && road[i].buffer) || (plop[i] && !plop[i].preview))
			blocked = true;
	}
			
	if(!blocked)
	{
		raise ? point.y += 0.25 : point.y -= 0.25;
		colorFaces(index, index, true);
		var nh =   [index -TERRAIN_SIZE -1,
					index +TERRAIN_SIZE +1, 
					index -1,
					index +1];
		for(var i = 0; i < 4; i++)
			if(Math.abs(point.y -terrain.geometry.vertices[nh[i]].y) == 1)
				raisePoint(nh[i], raise);
	}
}

function flatten (height) {
	var terrain = scene.getObjectByName("terrain").children[0];
	
}

function calcGroundColor(y) {
	return new THREE.Color(y/32 ,.25 ,0);
}