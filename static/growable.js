function Grow(x, z, f, d, o, mode, lv) {

	this.x = x;
	this.z = z;
	this.f = f;//width of frontage
	this.d = d;//depth of lot
	this.o = o;//orientation of lot
	this.mode = mode;
	this.llv = lv;//log base 2 of land value of growable (ranges from 6 (64) to -6 (1/64))
	for(var a = 0; a < d; a++)
		for(var b = 0; b < f; b++)
			switch (o)
			{
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
	this.variant = 1;
	this.residents = 0;
	this.unemployed = [0, 0, 0, 0];
	this.employees = 0;
	this.production = 0;
	this.storedGoods = 0;
	this.revenue = 0;
	this.propCanWork = 0.5;
	this.birthRate = city.birthRate;
	this.deathRate = city.deathRate;
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
		this.model.geometry.dispose();
		this.model.material.dispose();
		this.model = Grow.makeModel(this.x, this.z, this.f, this.d, this.o, this.mode, this.variant, demolish);
		scene.add(this.model);
	}
	this.grow = function() {
		this.variant++;
		this.updateModel(false);
	}
	this.expand = function() {
		if(!Zone.enoughSpace(this.x, this.z, this.o, this.d +1, false))
			return false;
		for (var b = 0; b < this.f; b++)			
			switch(this.o) {
				case 0:
					Grow.growers[this.z +b][this.x -this.d] = this;
					break;
				case 1:
					Grow.growers[this.z +this.d][this.x +b] = this;
					break;
				case 2:
					Grow.growers[this.z +b][this.x +this.d] = this;
					break;
				case 3:
					Grow.growers[this.z -this.d][this.x +b] = this;
					break;
			}
		this.d++;
		this.updateModel(false);
		return true;
	}
	this.del = function() {
		scene.remove(this.model);
		this.model.geometry.dispose();
		this.model.material.dispose();
		Grow.list.splice(Grow.list.indexOf(this.z*TERRAIN_SIZE +this.x), 1);
		for(var a = 0; a < this.d; a++)
			for(var b = 0; b < this.f; b++)
				switch (this.o) {
					case 0:
						Grow.growers[this.z +b][this.x -a] = null;
						break;
					case 1:
						Grow.growers[this.z +a][this.x +b] = null;
						break;
					case 2:
						Grow.growers[this.z +b][this.x +a] = null;
						break;
					case 3:
						Grow.growers[this.z -a][this.x +b] = null;
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
Grow.prototype.employ = function(zone) {
	var cityPool = city.unemployed;
	var pool = zone.unemployed;
	var type = this.mode < 23 ? ((this.mode/3)|0) -5 : 3;
	const moveRate = 32;
	const maxPop = this.variant !== 0 ? city.maxPopPerVariant*this.d*this.f << this.variant : 0;
	var moving = 0;
	// If there is room, employ up to 32 people
	if(pool[type] >= 1)
	{
		moving = maxPop -this.employees;
		if(moving > moveRate)
			moving = moveRate;
		if(moving > pool[type])
			moving = pool[type];
		pool[type] -= moving;
		cityPool[type] -= moving;
		this.employees += moving;
	}
	// Move population that cannot be sustained into the pool
	if(this.employees > maxPop)
	{
		var extra = this.employees -maxPop;
		pool[type] += extra;
		cityPool[type] += extra;
		moving -= extra;
		this.employees = maxPop;
		//decrease demand
		city.demand -= extra*extra/maxPop;
	}
	//increase residential demand
	city.demand += moving*(moving/maxPop);
	// Grow existing zones if there is enough demand
	if(cityPool[type] > maxPop && this.variant < this.maxVariants)
		if(Math.random()*(1 << 24) < 1 << (18 -this.variant +this.llv))
		{
			var expanded = false;
			if(Math.random() < 1/3)
				expanded = this.expand();
			if(!expanded)
				this.grow();
			//increase demand
			const newMaxPop = city.maxPopPerVariant*this.d*this.f << this.variant
			city.demand += newMaxPop -maxPop;
			this.llv = Zone.zones[this.z][this.x].adjustLandValue();
		}
}
Grow.prototype.house = function(rate) {
	var pool = city.unemployed;
	var moveRate = 64;
	const maxPop = this.variant !== 0 ? city.maxPopPerVariant*this.d*this.f << this.variant : 0;
	//If there is room, move up to 64 people
	if(city.demand >= 1)
	{
		var moving = maxPop -this.residents;
		if(moving > moveRate)
			moving = moveRate;
		if(moving > city.demand)
			moving = city.demand;
		city.demand -= moving;
		this.residents += moving;
		for(var i = 0; i < this.unemployed.length; i++)
		{
			this.unemployed[i] += moving*city.propCanWork*this.empSplit[i];
			pool[i] += moving*city.propCanWork*this.empSplit[i];
		}
	}
	// Adjust the population for births and deaths
	this.residents *= 1 +rate;
	for(var i = 0; i < this.unemployed.length; i++)
		this.unemployed[i] *= 1 +rate;
	// Move population that cannot be sustained into the pool
	if(this.residents > maxPop)
	{
		var extra = this.residents -maxPop;
		city.demand += extra;
		moving -= extra;
		this.residents = maxPop;
		for(var i = 0; i < this.unemployed.length; i++)
		{
			pool[i] -= this.unemployed[i]*extra/this.residents;
			this.unemployed[i] *= 1 -extra/this.residents;
		}
		//decrease demand
		city.demand -= extra*extra/maxPop;
	}
	// Grow existing zones if there is enough demand
	if(city.demand > maxPop && this.variant < this.maxVariants)
		if(Math.random()*(1 << 24) < 1 << (18 -this.variant +this.llv))
		{
			var expanded = false;
			if(Math.random() < 1/3)
				expanded = this.expand();
			if(!expanded)
				this.grow();
			//increase demand
			const newMaxPop = city.maxPopPerVariant*this.d*this.f << this.variant;
			city.demand += newMaxPop -maxPop;
			this.llv = Zone.zones[this.z][this.x].adjustLandValue();
		}
}

Grow.growers = [];
for(var i = 0; i < TERRAIN_SIZE; i++)
{
	Grow.growers.push([]);
}
Grow.list = [];
