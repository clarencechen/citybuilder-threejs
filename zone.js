function Zone(x, z, preview, mode)
{
	Zone.zones[z][x] = this;
	this.x = x;
	this.z = z;
	this.buffer = preview ? null : {mode: mode};
	this.mode = mode;

	this.model = Zone.makeZoneModel(x, z, mode, preview, false);
	scene.add(this.model);

	this.updateModel = function(preview, demolish, hide) {
		if(this.model)
		{
			scene.remove(this.model);
			this.model.geometry.dispose();
			this.model.material.dispose();
			this.model = 0;
		}
		if(!hide)
		{
			this.model = Zone.makeZoneModel(this.x, this.z, this.mode, preview, demolish);
			scene.add(this.model);
		}
	};

	this.modify = function(mode, preview, demolish, hide) {
		if(mode !== 0 && mode !== this.mode)
		{
			if(Grow.growers[this.z][this.x])
				Grow.growers[this.z][this.x].updateModel(true);
			this.mode = mode;
		}
		if(!preview)
		{
			if(Grow.growers[this.z][this.x] && mode !== this.buffer.mode)
				Grow.growers[this.z][this.x].del();
			this.buffer = {mode: this.mode};
		}
		if(this.buffer && !demolish)
		{
			this.updateModel(false, demolish, hide);	
		}
		else
		{
			if(Grow.growers[this.z][this.x])
				Grow.growers[this.z][this.x].updateModel(demolish);
			this.updateModel(preview, demolish, hide);			
		}
	};
	
	this.revert = function() {
		this.mode = this.buffer.mode;
		if(Grow.growers[this.z][this.x])
			Grow.growers[this.z][this.x].updateModel(false);
		this.updateModel(false, false, false);
	};
}

Zone.makeZoneModel = function(x, z, mode, preview, demolish) {
	var y = getHeightForBuilding(x, z, 1, 1);
	var zoneGeometry = new THREE.BoxGeometry(1, 1/32, 1);
	zoneGeometry.translate(x -127.5, 1/64 + y, z -127.5);
	zoneGeometry.computeFaceNormals();
	zoneGeometry.computeVertexNormals();
	var zoneMaterial;
	switch(mode)
	{
		case 12:
			zoneMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xc0ffc0)});
			break;
		case 13:
			zoneMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x80ff80)});
			break;
		case 14:
			zoneMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x40ff40)});
			break;
		case 15:
			zoneMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xc0c0ff)});
			break;
		case 16:
			zoneMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x8080ff)});
			break;
		case 17:
			zoneMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x4040ff)});
			break;
		case 18:
			zoneMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xffc0c0)});
			break;
		case 19:
			zoneMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xff8080)});
			break;
		case 20:
			zoneMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xff4040)});
			break;
		case 21:
			zoneMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xffffaa)});
			break;
		case 22:
			zoneMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xffff55)});
			break;
		case 23:
			zoneMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xaaaa00)});
			break;
	}
	if(demolish && preview)
		zoneMaterial.setValues({color: new THREE.Color(0xff0000), transparent: true, opacity: 0.75});
	else if(preview)
		zoneMaterial.setValues({transparent: true, opacity: 0.5});
	var zoneMesh = new THREE.Mesh(zoneGeometry, zoneMaterial);
	zoneMesh.name = "zone@" + x + " " + z;
	return zoneMesh;
}

Zone.prototype.develop = function() {
	// Construct new zones if there is enough demand
	if(Math.random()*(1 << 24) > 1 << (18 +this.adjustLandValue()))
		return;
	var frontage = [Road.roads[this.z][this.x +1], Road.roads[this.z -1][this.x], Road.roads[this.z][this.x -1], Road.roads[this.z +1][this.x]];
	var d = [2,3,1];
	for(var i = 0; i < 4; i++)
	{
		for(var j = 0; j < 3; j++)
		{
			//enough space for zone
			if(frontage[i] && frontage[i].buffer && Zone.enoughSpace(this.x, this.z, i, d[j], true) && Zone.enoughDemand(this.mode, d[j]))
			{
				var grower = new Grow(this.x, this.z, 1, d[j], i, this.mode, this.adjustLandValue());
				city.immigrationRate += 1e-8;
			}
		}
	}
}

Zone.prototype.adjustLandValue = function() {
//	var  
	return 0;
}

Zone.enoughDemand = function(mode, d) {
	var pool = mode < 23 ? city.demand[((mode/3)|0) -4] : city.demand[4];
	return pool > city.maxPopPerVariant*d;
}

Zone.enoughSpace = function(a, b, o, d, newZone) {
	var mode = Zone.zones[b][a].mode;
	for(var c = d -1; c >= 0; c--)
	{	
		switch (o) {
			case 0:
				if(!(Zone.zones[b][a -c] && Zone.zones[b][a -c].buffer && Zone.zones[b][a -c].mode === mode && !Grow.growers[b][a -c]))
					return false;
				break;
			case 1:
				if(!(Zone.zones[b +c][a] && Zone.zones[b +c][a].buffer && Zone.zones[b +c][a].mode === mode && !Grow.growers[b +c][a]))
					return false;
				break;
			case 2:
				if(!(Zone.zones[b][a +c] && Zone.zones[b][a +c].buffer && Zone.zones[b][a +c].mode === mode && !Grow.growers[b][a +c]))
					return false;
				break;
			case 3:
				if(!(Zone.zones[b -c][a] && Zone.zones[b -c][a].buffer && Zone.zones[b -c][a].mode === mode && !Grow.growers[b -c][a]))
					return false;
				break;
		}
		if(!newZone)
			break;
	}
	return true;
}

Zone.zones = [];
for(var i = 0; i < TERRAIN_SIZE; i++)
{
	Zone.zones.push([]);
}

