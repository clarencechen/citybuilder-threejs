function Plop(x, z, preview, mode)
{
	for(var a = 0; a < Plop.sizes[mode].x; a++)
		for(var b = 0; b < Plop.sizes[mode].z; b++)
		{
			for(var c = this.y; c < Plop.sizes[mode].y; c += 0.25)
				if(Road.bridges[z +b][x +a][this.y +c])
						return;
			if((Plop.plops[z +b][x +a] && !Plop.plops[z +b][x +a].preview) || Road.roads[z +b][x +a])
				return;
		}
	for(var a = 0; a < Plop.sizes[mode].x; a++)
		for(var b = 0; b < Plop.sizes[mode].z; b++)
			Plop.plops[z +b][x +a] = this;
	this.x = x;
	this.z = z;
	this.y = getHeightForBuilding(x, z, Plop.sizes[mode].x, Plop.sizes[mode].z);
	this.preview = preview;
	this.mode = mode;
	this.model = this.problem ? Plop.makePlopModel(x, z, mode, true, true) :
								Plop.makePlopModel(x, z, mode, preview, false);
	scene.add(this.model);
	this.updateModel = function(preview, demolish) {
		scene.remove(this.model);
		this.model = 0;
		this.model = Plop.makePlopModel(this.x, this.z, this.mode, preview, demolish);
		scene.add(this.model);
	};
	this.modify = function(preview, demolish) {
		if(!preview && !this.problem)
			this.preview = false;
		if(!this.preview && !demolish)
			this.updateModel(false, demolish);
		else if(this.problem)
			this.updateModel(true, true);
		else
			this.updateModel(preview, demolish);
	};
	
	this.revert = function() {
		this.updateModel(false, false);
	};
}
Plop.makePlopModel = function(x, z, mode, preview, demolish) {
	var y = getHeightForBuilding(x, z, Plop.sizes[mode].x, Plop.sizes[mode].z);
	if(mode == 26 || mode == 42)
	{
		var plopgeometry = new THREE.BoxGeometry(Plop.sizes[mode].x -.2, Plop.sizes[mode].y/16, Plop.sizes[mode].z -.2);
		plopgeometry.translate(x -128 +Plop.sizes[mode].x/2, y +Plop.sizes[mode].y/32, z -128 +Plop.sizes[mode].z/2);
	}
	else
	{
		var plopgeometry = new THREE.BoxGeometry(Plop.sizes[mode].x -.2, Plop.sizes[mode].y, Plop.sizes[mode].z -.2);
		plopgeometry.translate(x -128 +Plop.sizes[mode].x/2, y +Plop.sizes[mode].y/2, z -128 +Plop.sizes[mode].z/2);
	}
	plopgeometry.computeFaceNormals();
	plopgeometry.computeVertexNormals();
	var plopmaterial;
	switch(mode%16)
	{
		case 9:
			plopmaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x800000)});
			break;
		case 10:
			plopmaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x408000)});
			break;
		case 11:
			plopmaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x804000)});
			break;
		case 12:
			plopmaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x800080)});
			break;
		case 13:
			plopmaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x800040)});
			break;
		case 14:
			plopmaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x400080)});
			break;
		case 15:
			plopmaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x404080)});
			break;
		case 0:
			plopmaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x808080)});
			break;
		case 1:
			plopmaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x000080)});
			break;
	}
	if(demolish && preview)
		plopmaterial.setValues({color: new THREE.Color(0xff0000), transparent: true, opacity: 0.75});
	else if(preview)
		plopmaterial.setValues({transparent: true, opacity: 0.5});
	var plopmesh = new THREE.Mesh(plopgeometry, plopmaterial);
	plopmesh.name = "Plop@" + x + " " + z;
	return plopmesh;

}
Plop.sizes = [];
for(var i = 1; i < 10; i++)
{
	Plop.sizes[i +24] = new THREE.Vector3(2, 1, 2);
	Plop.sizes[i +40] = new THREE.Vector3(2, 1, 4);
}
Plop.plops = [];
for(var i = 0; i < TERRAIN_SIZE; i++)
{
	Plop.plops.push([]);
}