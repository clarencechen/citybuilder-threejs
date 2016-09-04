function Grow(x, z, f, d, o, mode) {

	this.x = x;
	this.z = z;
	this.f = f;
	this.d = d;
	this.o = o;
	for(var a = 0; a < d; a++)
		for(var b = 0; b < f; b++)
			switch (o) {
				case 0:
					Grow.growers[z +b][x -a] = this;
					break;
				case 1:
					Grow.growers[z +a][x +b] = this;
					break;
				case 2:
					Grow.growers[z +b][x +a] = this;
					break;
				case 3:
					Grow.growers[z -a][x +b] = this;
					break;
			}
	this.mode = mode;
	this.variant = 1;
	this.residents = 0;
	this.unemployed = 0;
	this.employees = 0;
	this.production = 0;
	this.storedGoods = 0;
	this.revenue = 0;
	this.propCanWork = 0.5;
	this.birthRate = 5.078125e-5;
	this.deathRate = 3.183594e-5;
	this.empSplit = [.3, .2, .3, .2];
	switch(this.mode)
	{
		case 12:
			this.maxVariants = 2;
			break;
		case 13:
			this.maxVariants = 5;
			break;
		case 14:
			this.maxVariants = 8;
			break;
		case 15:
			this.maxVariants = 2;
			break;
		case 16:
			this.maxVariants = 4;
			break;
		case 17:
			this.maxVariants = 6;
			break;
		case 18:
			this.maxVariants = 2;
			break;
		case 19:
			this.maxVariants = 5;
			break;
		case 20:
			this.maxVariants = 8;
			break;
		case 21:
			this.maxVariants = 2;
			break;
		case 22:
			this.maxVariants = 4;
			break;
		case 23:
			this.maxVariants = 5;
			break;

	}
	Grow.list.push(z*TERRAIN_SIZE +x);
	this.model = Grow.makeModel(x, z, f, d, o, mode, this.variant, false);
	scene.add(this.model);
	this.updateModel = function(demolish) {
		scene.remove(this.model);
		this.model = Grow.makeModel(this.x, this.z, this.f, this.d, this.o, this.mode, this.variant, demolish);
		scene.add(this.model);
	}
	this.grow = function(grow, expand, demolish) {
		
			if(grow)
				this.variant += grow;
			if(expand)
				;
			this.updateModel(demolish);
	}
	this.del = function() {
		scene.remove(this.model);
		Grow.list.splice(Grow.list.indexOf(z*TERRAIN_SIZE +x), 1);
		for(var a = 0; a < d; a++)
			for(var b = 0; b < f; b++)
				switch (o) {
					case 0:
						Grow.growers[z +b][x -a] = null;
						break;
					case 1:
						Grow.growers[z +a][x +b] = null;
						break;
					case 2:
						Grow.growers[z +b][x +a] = null;
						break;
					case 3:
						Grow.growers[z -a][x +b] = null;
						break;
				}
	}

}
Grow.makeModel = function(x, z, f, d, o, mode, variant, demolish) {
	switch (o) {
		case 0://road to east
			var y = getHeightForBuilding(x -d, z, d, f);
			var c = new THREE.Vector2(x +1 -d/2, z +f/2);
			break;
		case 1://road to north
			var y = getHeightForBuilding(x, z, f, d);
			var c = new THREE.Vector2(x +f/2, z +d/2);
			break;
		case 2://road to west
			var y = getHeightForBuilding(x, z, d, f);
			var c = new THREE.Vector2(x +d/2, z +f/2);
			break;
		case 3://road to south
			var y = getHeightForBuilding(x, z -d, f, d);
			var c = new THREE.Vector2(x +f/2, z +1 -d/2);
			break;
	}

	if(variant < 3)
	{
		var grownGeometry = new THREE.BoxGeometry(o % 2 ? f*.9 : d*.8, variant/4, o % 2 ? d*.8 : f*.9);
		grownGeometry.translate(c.x -128, variant/8 +y, c.y -128);
	}
	else if(variant < 5)
	{
		var grownGeometry = new THREE.BoxGeometry(o % 2 ? f : d*.9, variant/4, o % 2 ? d*.9 : f);
		grownGeometry.translate(c.x -128, variant/8 +y, c.y -128);
	}
	else
	{
		var grownGeometry = new THREE.BoxGeometry(o % 2 ? f : d, Math.pow(Math.SQRT2, variant -4), o % 2 ? d : f);
		grownGeometry.translate(c.x -128, Math.pow(Math.SQRT2, variant -6) +y, c.y -128);
	}
	grownGeometry.computeFaceNormals();
	grownGeometry.computeVertexNormals();
	var grownMaterial;
	switch(mode)
	{
		case 12:
			grownMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xc0ffc0)});
			break;
		case 13:
			grownMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x80ff80)});
			break;
		case 14:
			grownMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x40ff40)});
			break;
		case 15:
			grownMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xc0c0ff)});
			break;
		case 16:
			grownMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x8080ff)});
			break;
		case 17:
			grownMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0x4040ff)});
			break;
		case 18:
			grownMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xffc0c0)});
			break;
		case 19:
			grownMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xff8080)});
			break;
		case 20:
			grownMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xff4040)});
			break;
		case 21:
			grownMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xffffaa)});
			break;
		case 22:
			grownMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xffff55)});
			break;
		case 23:
			grownMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color(0xaaaa00)});
			break;
	}
	if(demolish)
		grownMaterial.setValues({color: new THREE.Color(0xff0000), transparent: true, opacity: 0.75});
	var grownMesh = new THREE.Mesh(grownGeometry, grownMaterial);
	grownMesh.name = "grown@" + x + " " + z;
	return grownMesh;
}
Grow.prototype.employ = function(cityPool, pool) {
	const moveRate = 8;
	const maxPop = this.variant !== 0 ? city.maxPopPerVariant << this.variant : 0;
	var moving = 0;
	/* If there is room, employ up to 8 people*/
	if(pool >= 1)
	{
		moving = maxPop -this.employees;
		if(moving > moveRate)
			moving = moveRate;
		if(moving > pool)
			moving = pool;
		pool -= moving;
		this.employees += moving;
	}
	/* Move population that cannot be sustained into the pool */
	if(this.employees > maxPop)
	{
		pool += this.employees -maxPop;
		moving -= this.employees -maxPop;
		this.employees = maxPop;
		city.immigrationRate -= this.variant*1e-7;
	}
	// Construct new zones if there is enough demand
	if(cityPool > maxPop && this.variant < this.maxVariants)
		if(Math.random()*(1 << 24) < 1 << (18 -this.variant))
		{
			this.grow(1);
			this.variant++;
			this.updateModel(false, false, false);
			city.immigrationRate += this.variant*1e-6;
		}
	return moving;
}
//slated for webworker prcoessing
Grow.prototype.house = function(rate) {
	var pool = city.populationPool;
	var moveRate = 64;
	const maxPop = this.variant !== 0 ? city.maxPopPerVariant << this.variant : 0;
	/* If there is room, move up to 64 people*/
	if(pool >= 1)
	{
		var moving = maxPop - this.residents;
		if(moving > moveRate)
			moving = moveRate;
		if(moving > pool)
			moving = pool;
		pool -= moving;
		this.residents += moving;
		this.unemployed += moving*city.propCanWork;
	}
	/* Adjust the population for births and deaths */
	this.residents *= 1 +rate;
	this.unemployed *= 1 +rate;
	/* Move population that cannot be sustained into the pool */
	if(this.residents >= maxPop +1)
	{
		pool += this.residents -maxPop;
		moving -= this.residents -maxPop;
		this.residents = maxPop;
		this.unemployed = maxPop*this.propCanWork;
		city.immigrationRate -= this.variant*1e-7;
	}
	// Construct new zones if there is enough demand
	if(pool > maxPop && this.variant < this.maxVariants)
		if(Math.random()*(1 << 24) < 1 << (18 -this.variant))
		{
			this.grow(1);
			this.variant++;
			this.updateModel(false, false, false);
			city.immigrationRate += this.variant*1e-6;
		}
}

Grow.growers = [];
for(var i = 0; i < TERRAIN_SIZE; i++)
{
	Grow.growers.push([]);
}
Grow.list = [];
