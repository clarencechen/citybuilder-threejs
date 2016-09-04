function Road(x, z, capacity, preview, y)
{
	if(y === undefined || y === null)
	{
		Road.roads[z][x] = this;
		this.x = x;
		this.z = z;
		this.problem = !!Plop.plops[z][x];
	}
	else
	{
		var top = Math.max.apply(null, getHeightForTile(x, z));
		var bottom = Math.min.apply(null, getHeightForTile(x, z));
		Road.bridges[z][x][y] = this;
		this.x = x;
		this.z = z;
		this.y = y;
		this.problem = ((y > bottom && y < top) || y === bottom -.25 || y === top +.25) ||
						Road.bridges[z][x][y -.25] || Road.bridges[z][x][y +.25] || Plop.plops[z][x];
	}
	this.buffer = (preview  || this.problem) ? null : {capacity: this.capacity, exitDirs: this.exitDirs};
	this.capacity = capacity;
	this.exitDirs = this.addExits();
	this.model = this.problem ? Road.makeRoadModel(x, this.y, z, this.capacity, this.exitDirs, true, true) : 
								Road.makeRoadModel(x, this.y, z, this.capacity, this.exitDirs, preview, false);
	scene.add(this.model);
	this.updateModel = function(preview, demolish) {
		scene.remove(this.model);
		this.model = 0;
		this.model = Road.makeRoadModel(this.x, this.y, this.z, this.capacity, this.exitDirs, preview, demolish);
		scene.add(this.model);
	};
	this.modify = function(capacity, preview, demolish) {
		if(capacity !== 0)
			this.capacity = capacity;
		this.exitDirs = this.addExits();
		var to2ex = [2, 8, 32, 128, 18, 72, 33, 132];
		var to1ex = [0, 1, 4, 16, 64];
		if(this.capacity === 1 && (this.exitDirs & 170) !== 0 && to2ex.indexOf(this.exitDirs) < 0)
			this.capacity = 2;
		else if(this.capacity === 2 && (this.exitDirs & 170) === 0 && to1ex.indexOf(this.exitDirs) < 0)
			this.capacity = 1;
		if(!preview && !this.problem)
			this.buffer = {capacity: this.capacity, exitDirs: this.exitDirs};
		if(this.buffer && !demolish)
			this.updateModel(false, demolish);
		else if(this.problem)
			this.updateModel(true, true);
		else
			this.updateModel(preview, demolish);
	};
	
	this.revert = function() {
		this.capacity = this.buffer.capacity;
		this.exitDirs = this.buffer.exitDirs;
		this.updateModel(false, false);
	};
}

Road.prototype.matchNeighbors = function (preview, demolish) {
	var nc = this.findNeighbors();
	for(var i = 0; i < 4; i++)
		if(nc[i])
			nc[i].modify(0, preview, demolish);
}
Road.prototype.addExits = function() {
	var possibleExits = 0;
	var nc = this.findNeighbors();
	for(var i = 0; i < 4; i++)
		if(nc[i])
			possibleExits += (nc[i].capacity)*(1 << (2*i));
	return possibleExits;
}
Road.prototype.findNeighbors = function() {
	var x = this.x;
	var z = this.z;
	var y = this.y;
	var flush = y === null || y === undefined;
	var yt =[getHeightForTile(x, z)[1] === getHeightForTile(x, z)[2] ? getHeightForTile(x, z)[1] : null
			,getHeightForTile(x, z)[0] === getHeightForTile(x, z)[1] ? getHeightForTile(x, z)[0] : null
			,getHeightForTile(x, z)[3] === getHeightForTile(x, z)[0] ? getHeightForTile(x, z)[3] : null
			,getHeightForTile(x, z)[2] === getHeightForTile(x, z)[3] ? getHeightForTile(x, z)[2] : null
			];
	var r = [Road.roads[z][x +1], Road.roads[z -1][x], Road.roads[z][x -1], Road.roads[z +1][x]];
	var b = [Road.bridges[z][x +1][flush ? (yt[0] !== null ? yt[0] : y) : y]
			,Road.bridges[z -1][x][flush ? (yt[1] !== null ? yt[1] : y) : y]
			,Road.bridges[z][x -1][flush ? (yt[2] !== null ? yt[2] : y) : y]
			,Road.bridges[z +1][x][flush ? (yt[3] !== null ? yt[3] : y) : y]
			];
	var ret = [];
	for (var i = 0; i < 4; i++)
	{
		if(flush)
			ret.push(yt[i] !== null ? (b[i] ? b[i] : r[i]) : r[i]);
		else
			ret.push(yt[i] === y ? (r[i] ? r[i] : b[i]) : b[i]);
	}
	return ret;
};
Road.makeRoadModel = function(x, h, z, capacity, exitDirs, preview, demolish)//to be updated
{
	var y = h === undefined ? getHeightForTile(x, z) : [h, h, h, h];

	var v0 =	[[new THREE.Vector3(.5,		y[1]/3 +2*y[2]/3 +1/32, 1/6),	new THREE.Vector3(.5,	y[1]/3 +2*y[2]/3, 1/6)],
				[new THREE.Vector3(1/6,		y[0]/3 +2*y[1]/3 +1/32, -.5),	new THREE.Vector3(1/6,	y[0]/3 +2*y[1]/3, -.5)],
				[new THREE.Vector3(-.5,		y[3]/3 +2*y[0]/3 +1/32, -1/6),	new THREE.Vector3(-.5,	y[3]/3 +2*y[0]/3, -1/6)],
				[new THREE.Vector3(-1/6,	y[2]/3 +2*y[3]/3 +1/32, .5),	new THREE.Vector3(-1/6,	y[2]/3 +2*y[3]/3, .5)]];
	var v1 = 	[[new THREE.Vector3(.5,		2*y[1]/3 +y[2]/3 +1/32, -1/6),	new THREE.Vector3(.5,	2*y[1]/3 +y[2]/3, -1/6)],
				[new THREE.Vector3(-1/6,	2*y[0]/3 +y[1]/3 +1/32, -.5),	new THREE.Vector3(-1/6,	2*y[0]/3 +y[1]/3, -.5)],
				[new THREE.Vector3(-.5,		2*y[3]/3 +y[0]/3 +1/32, 1/6),	new THREE.Vector3(-.5,	2*y[3]/3 +y[0]/3, 1/6)],
				[new THREE.Vector3(1/6,		2*y[2]/3 +y[3]/3 +1/32, .5),	new THREE.Vector3(1/6,	2*y[2]/3 +y[3]/3, .5)]];

	var v2 =	[[new THREE.Vector3(.5,		y[1]/4 +3*y[2]/4 +1/32, 1/4),	new THREE.Vector3(.5,	y[1]/4 +3*y[2]/4, 1/4)],
				[new THREE.Vector3(1/4,		y[0]/4 +3*y[1]/4 +1/32, -.5),	new THREE.Vector3(1/4,	y[0]/4 +3*y[1]/4, -.5)],
				[new THREE.Vector3(-.5,		y[3]/4 +3*y[0]/4 +1/32, -1/4),	new THREE.Vector3(-.5,	y[3]/4 +3*y[0]/4, -1/4)],
				[new THREE.Vector3(-1/4,	y[2]/4 +3*y[3]/4 +1/32, .5),	new THREE.Vector3(-1/4,	y[2]/4 +3*y[3]/4, .5)]];
	var v3 = 	[[new THREE.Vector3(.5,		3*y[1]/4 +y[2]/4 +1/32, -1/4),	new THREE.Vector3(.5,	3*y[1]/4 +y[2]/4, -1/4)],
				[new THREE.Vector3(-1/4,	3*y[0]/4 +y[1]/4 +1/32, -.5),	new THREE.Vector3(-1/4,	3*y[0]/4 +y[1]/4, -.5)],
				[new THREE.Vector3(-.5,		3*y[3]/4 +y[0]/4 +1/32, 1/4),	new THREE.Vector3(-.5,	3*y[3]/4 +y[0]/4, 1/4)],
				[new THREE.Vector3(1/4,		3*y[2]/4 +y[3]/4 +1/32, .5),	new THREE.Vector3(1/4,	3*y[2]/4 +y[3]/4, .5)]];

	var vce =	[new THREE.Vector3(1/6,		y[1]/3 +y[2]/3 +y[3]/6 +y[0]/6 +1/32, 0),		new THREE.Vector3(1/6,	y[1]/3 +y[2]/3 +y[3]/6 +y[0]/6, 0)];
	var vcn =	[new THREE.Vector3(0,		y[0]/3 +y[1]/3 +y[2]/6 +y[3]/6 +1/32, -1/6),	new THREE.Vector3(0,	y[0]/3 +y[1]/3 +y[2]/6 +y[3]/6, -1/6)];
	var vcs =	[new THREE.Vector3(0,		y[2]/3 +y[3]/3 +y[0]/6 +y[1]/6 +1/32, 1/6),		new THREE.Vector3(0,	y[2]/3 +y[3]/3 +y[0]/6 +y[1]/6, 1/6)];
	var vcw =	[new THREE.Vector3(-1/6,	y[3]/3 +y[0]/3 +y[1]/6 +y[2]/6 +1/32, 0),		new THREE.Vector3(-1/6,	y[3]/3 +y[0]/3 +y[1]/6 +y[2]/6, 0)];

	var roadGeometry = new THREE.Geometry();
	if(exitDirs !== 0)
	{
		for(var i = 0; i < 2; i++)
			for(var j = 0; j < 4; j++)
				if((exitDirs & 3*(1 << (2*j))) === 0)
					switch(exitDirs)
					{
						case 1://east
						case 2:
							if(roadGeometry.vertices.indexOf(vcn[i]) < 0 && roadGeometry.vertices.indexOf(vcs[i]) < 0)
								roadGeometry.vertices.push(vcn[i], vcs[i]);
							break;
						case 4://north
						case 8:
							if(roadGeometry.vertices.indexOf(vce[i]) < 0 && roadGeometry.vertices.indexOf(vcw[i]) < 0)
								roadGeometry.vertices.push(vcw[i], vce[i]);
							break;
						case 16://west
						case 32:
							if(roadGeometry.vertices.indexOf(vcs[i]) < 0 && roadGeometry.vertices.indexOf(vcn[i]) < 0)
								roadGeometry.vertices.push(vcs[i], vcn[i]);
							break;
						case 64://south
						case 128:
							if(roadGeometry.vertices.indexOf(vcw[i]) < 0 && roadGeometry.vertices.indexOf(vce[i]) < 0)
								roadGeometry.vertices.push(vce[i], vcw[i]);
							break;
					}
				else if((exitDirs & (3 << (2*j))) === (1 << (2*j)))
					roadGeometry.vertices.push(v0[j][i], v1[j][i]);
				else if((exitDirs & (3 << (2*j))) === 2*(1 << (2*j)))
					if(capacity > 1)
						roadGeometry.vertices.push(v2[j][i], v3[j][i]);
					else
						roadGeometry.vertices.push(v0[j][i], v1[j][i]);
	}
	else
		roadGeometry.vertices.push(vce[0], vcn[0], vcw[0], vcs[0], vce[1], vcn[1], vcw[1], vcs[1]);

	if(roadGeometry.vertices.length === 16)
	{
		roadGeometry.faces.push(new THREE.Face3(0,1,2));
		roadGeometry.faces.push(new THREE.Face3(0,2,3));
		roadGeometry.faces.push(new THREE.Face3(0,3,4));
		roadGeometry.faces.push(new THREE.Face3(0,4,5));
		roadGeometry.faces.push(new THREE.Face3(0,5,6));
		roadGeometry.faces.push(new THREE.Face3(0,6,7));

		roadGeometry.faces.push(new THREE.Face3(8,10,9));
		roadGeometry.faces.push(new THREE.Face3(8,11,10));
		roadGeometry.faces.push(new THREE.Face3(8,12,11));
		roadGeometry.faces.push(new THREE.Face3(8,13,12));
		roadGeometry.faces.push(new THREE.Face3(8,14,13));
		roadGeometry.faces.push(new THREE.Face3(8,15,14));

		roadGeometry.faces.push(new THREE.Face3(8,9,1));
		roadGeometry.faces.push(new THREE.Face3(8,1,0));
		roadGeometry.faces.push(new THREE.Face3(9,10,2));
		roadGeometry.faces.push(new THREE.Face3(9,2,1));
		roadGeometry.faces.push(new THREE.Face3(10,11,3));
		roadGeometry.faces.push(new THREE.Face3(10,3,2));
		roadGeometry.faces.push(new THREE.Face3(11,12,4));
		roadGeometry.faces.push(new THREE.Face3(11,4,3));
		roadGeometry.faces.push(new THREE.Face3(12,13,5));
		roadGeometry.faces.push(new THREE.Face3(12,5,4));
		roadGeometry.faces.push(new THREE.Face3(13,14,6));
		roadGeometry.faces.push(new THREE.Face3(13,6,5));
		roadGeometry.faces.push(new THREE.Face3(14,15,7));
		roadGeometry.faces.push(new THREE.Face3(14,7,6));
		roadGeometry.faces.push(new THREE.Face3(15,8,0));
		roadGeometry.faces.push(new THREE.Face3(15,0,7));
	}
	else if(roadGeometry.vertices.length === 12)
	{
		roadGeometry.faces.push(new THREE.Face3(0,1,2));
		roadGeometry.faces.push(new THREE.Face3(0,2,3));
		roadGeometry.faces.push(new THREE.Face3(0,3,4));
		roadGeometry.faces.push(new THREE.Face3(0,4,5));

		roadGeometry.faces.push(new THREE.Face3(6,8,7));
		roadGeometry.faces.push(new THREE.Face3(6,9,8));
		roadGeometry.faces.push(new THREE.Face3(6,10,9));
		roadGeometry.faces.push(new THREE.Face3(6,11,10));

		roadGeometry.faces.push(new THREE.Face3(6,7,1));
		roadGeometry.faces.push(new THREE.Face3(6,1,0));
		roadGeometry.faces.push(new THREE.Face3(7,8,2));
		roadGeometry.faces.push(new THREE.Face3(7,2,1));
		roadGeometry.faces.push(new THREE.Face3(8,9,3));
		roadGeometry.faces.push(new THREE.Face3(8,3,2));
		roadGeometry.faces.push(new THREE.Face3(9,10,4));
		roadGeometry.faces.push(new THREE.Face3(9,4,3));
		roadGeometry.faces.push(new THREE.Face3(10,11,5));
		roadGeometry.faces.push(new THREE.Face3(10,5,4));
		roadGeometry.faces.push(new THREE.Face3(11,6,0));
		roadGeometry.faces.push(new THREE.Face3(11,0,5));
	}
	else if(roadGeometry.vertices.length === 8)
	{
		roadGeometry.faces.push(new THREE.Face3(0,1,2));
		roadGeometry.faces.push(new THREE.Face3(0,2,3));

		roadGeometry.faces.push(new THREE.Face3(4,6,5));
		roadGeometry.faces.push(new THREE.Face3(4,7,6));

		roadGeometry.faces.push(new THREE.Face3(4,5,1));
		roadGeometry.faces.push(new THREE.Face3(4,1,0));
		roadGeometry.faces.push(new THREE.Face3(5,6,2));
		roadGeometry.faces.push(new THREE.Face3(5,2,1));
		roadGeometry.faces.push(new THREE.Face3(6,7,3));
		roadGeometry.faces.push(new THREE.Face3(6,3,2));
		roadGeometry.faces.push(new THREE.Face3(7,4,0));
		roadGeometry.faces.push(new THREE.Face3(7,0,3));
	}
	else
	{
		console.log("Invalid vertex count!");
		return;
	}
	roadGeometry.computeFaceNormals();
	roadGeometry.computeVertexNormals();
	roadGeometry.translate(x -127.5, 0, z -127.5);
	var roadMaterial = preview && demolish ? new THREE.MeshLambertMaterial({color: new THREE.Color(0xff0000), transparent: true, opacity: 0.75}) :
									preview ? new THREE.MeshLambertMaterial({color: new THREE.Color(0x808080), transparent: true, opacity: 0.5}) :
											new THREE.MeshLambertMaterial({color: new THREE.Color(0x808080)});
	var roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
	roadMesh.name = "road@" + x + " " + z;
	return roadMesh;
}
Road.roads = [];
for(var i = 0; i < TERRAIN_SIZE; i++)
{
	Road.roads.push([]);
}
Road.bridges = [];
for(var z = 0; z < TERRAIN_SIZE; z++)
{
	Road.bridges.push([]);
	for(var x = 0; x < TERRAIN_SIZE; x++)
		Road.bridges[z].push([]);
}
