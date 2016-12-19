//if(!!window.Worker)
//	var dworker = new Worker('commute.js');
//else
//	console.log('workers not supported!');

function City () {
	
	this.birthRate = 2.0625e-4;
	this.deathRate = 1.3125e-4;
	this.propCanWork = 0.5;
	
	this.taxes = [0.1, 0.1, 0.1, 0.1, 0.1];

	this.residentialEarn = 0;
	this.commercialEarn = 0;
	this.officeEarn = 0;
	this.lightIndEarn = 0;
	this.heavyIndEarn = 0;
	this.funds = 0;
	
	this.maxPopPerVariant = 5;
	this.zones = [];
	this.residents = 0;
	this.demand
	this.unemployed = [100,0,0,0,0];

	this.addPop = function(type) {
		var pop = 0;
		Grow.list.forEach( function(loc, i) {
			var x = loc%TERRAIN_SIZE;
			var z = (loc/TERRAIN_SIZE)|0;
			if((Grow.growers[z][x].mode/3)|0 === (type +4))
				pop += type === 0 ? Grow.growers[z][x].residents : Grow.growers[z][x].employees;
		});
		return pop;
	}
	this.addUnemployed = function(type) {
		var pop = 0;
		Grow.list.forEach( function(loc, i) {
			var x = loc%TERRAIN_SIZE;
			var z = (loc/TERRAIN_SIZE)|0;
			if((Grow.growers[z][x].mode/3)|0 === 4)
				pop += Grow.growers[z][x].unemployed[type];
		});
		return pop;
	}
	
	this.budget = function () {
		console.log('Old City Funds: ' + this.funds);
		console.log('Current Earnings: ' + this.residentialEarn + ' ' + this.commercialEarn + ' ' + this.officeEarn + ' ' + this.lightIndEarn + ' ' + this.heavyIndEarn);
		this.funds += this.residentialEarn + this.commercialEarn + this.officeEarn + this.lightIndEarn + this.heavyIndEarn;
		$('#funds').text('Funds: $' + Math.floor(this.funds));
		this.residentialEarn = 0;
		this.commercialEarn = 0;
		this.officeEarn = 0;
		this.lightIndEarn = 0;
		this.heavyIndEarn = 0;
	}
}

City.prototype.simulate = function() {
	this.zones = loadZones(Zone.zones);
	var order0 = shuffle(this.zones);
	var order1 = shuffle(Grow.list);
	var order2 = shuffle(Grow.list.slice(0));
	var g = Grow.growers;
	for(var i = 0; i < order0.length; i++)
	{
		var zone = Zone.zones[(order0[i]/TERRAIN_SIZE)|0][order0[i]%TERRAIN_SIZE];
		if(zone.buffer)
			zone.develop();
	}
	for(var i = 0; i < order1.length; i++)
	{
		var z1 = g[(order1[i]/TERRAIN_SIZE)|0][order1[i]%TERRAIN_SIZE];
		if(z1.mode >= 12 && z1.mode < 15)//residential
		{
			/* Redistribute the pool and increase the population total by the tile's population */
			var hires = 0;
			z1.house(z1.birthRate -z1.deathRate);
			for(var j = 0; j < order2.length; j++)
			{
				var z2 = g[(order2[j]/TERRAIN_SIZE)|0][order2[j]%TERRAIN_SIZE];
				var type = z2.mode < 23 ? ((z2.mode/3)|0) -4 : 4;
				if(/*commute(z1,z2) &&*/ type)
					if(Math.random() < .95*(1 -this.taxes[type]))
						z2.employ(z1);
			}
		}
		/* Extract resources from the ground. */
		else if(z1.mode == 23)//heavy industrial
			if(Math.random()*(1 << 16) < z1.employees*((1 << 16) -(1 << (16 -z1.variant))))
				++z1.production;
	}
	/* Run second pass. Mostly handles goods manufacture */
	for(var i = 0; i < order1.length; i++)
	{
		var z1 = g[(order1[i]/TERRAIN_SIZE)|0][order1[i]%TERRAIN_SIZE];
		if(z1.mode >= 21 && z1.mode < 23)//light industrial
		{
			var receivedResources = 0;
			/* Receive resources from smaller and connected zones */
			for(var j = 0; j < order2.length; j++)
			{
				var z2 = g[(order2[j]/TERRAIN_SIZE)|0][order2[j]%TERRAIN_SIZE];
				if(/*commute(z2,z1) &&*/ z2.mode == 23)
					if(receivedResources >= z1.variant)
						break;
					else if(z2.production > 0)
					{
						++receivedResources;
						--z2.production;
						z2.revenue += 100*(1.0 -this.taxes[4]);
						this.heavyIndEarn += 100*this.taxes[4];
					}
			}

			/* Turn resources into goods */
			if(z1.storedGoods < z1.variant*5)
				z1.storedGoods += receivedResources*z1.variant;
		}
	}
	/* Run third pass. Mostly handles goods distribution. */
	for(var i = 0; i < order1.length; i++)
	{
		var z1 = g[(order1[i]/TERRAIN_SIZE)|0][order1[i]%TERRAIN_SIZE];
		if(z1.mode >= 15 && z1.mode < 18)//commercial
		{
			var receivedGoods = 0;
			var maxCustomers = 0;
			for(var j = 0; j < order2.length; j++)
			{
				var z2 = g[(order2[j]/TERRAIN_SIZE)|0][order2[j]%TERRAIN_SIZE];
				if(/*commute(z2, z1) &&*/ z2.mode >= 21 && z2.mode < 23)
					while(z2.storedGoods > 0 && receivedGoods !== z1.variant)
					{
						--z2.storedGoods;
						++receivedGoods;
						z2.revenue += 100*(1.0 -this.taxes[3]);
						this.lightIndEarn += 100*this.taxes[3];
					}
				else if(/*commute(z2, z1) &&*/ z2.mode >= 12 && z2.mode < 15)
					maxCustomers += z2.residents*1.5*z2.propCanWork*Math.random();
				if(receivedGoods === z1.variant)
					break;
			}
			/* Calculate the overall revenue for the tile. */
			z1.production = (receivedGoods +Math.random()/10)*(1.0 -this.taxes[1]);
			z1.revenue = 100*z1.production*maxCustomers*(Math.random() +1)/2;
			this.commercialEarn += 100*this.taxes[1]*(receivedGoods +Math.random()/10)*maxCustomers*(Math.random() +1)/2;
		}
	}
	this.residentialEarn += this.addPop(0)*this.taxes[0]*15;
	this.officeEarn += this.addPop(2)*this.taxes[2]*30;
	//grow residential demand pool
	this.demand *= 1 +this.birthRate -this.deathRate;

	this.residents = this.addPop(0) +this.demand;
	$('#population').text('Population: ' + Math.floor(this.residents));
}

function loadZones () {
	var zones = Zone.zones;
	var grow = Grow.growers;
	var ret = [];
	for (var z = 0; z < TERRAIN_SIZE; z++)
		for (var x = 0; x < TERRAIN_SIZE; x++)
			if(zones[z][x] && zones[z][x].buffer && !grow[z][x])
				ret.push(TERRAIN_SIZE*z +x);
	return ret; 
}

function shuffle(arr) {
	for (var i = arr.length -1; i > 0; i--)
	{
		var j = (Math.random()*(i +1))|0;
		var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
	}
	return arr;
}