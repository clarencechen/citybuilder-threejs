function City () {
	this.immigrationRate = 0;
	
	this.birthRate = 5.078125e-5;
	this.deathRate = 3.183594e-5;
	this.propCanWork = 0.5;
	this.populationPool = 10;
	
	this.residentialTax = 0.1;
	this.commercialTax = 0.1;
	this.officeTax = 0.1;
	this.lightIndTax = 0.1;
	this.heavyIndTax = 0.1;
	
	this.residentialEarn = 0;
	this.commercialEarn = 0;
	this.officeEarn = 0;
	this.lightIndEarn = 0;
	this.heavyIndEarn = 0;
	this.funds = 0;
	
	this.maxPopPerVariant = 5;
	this.zones = [];
	this.residents = 0;
	this.unemployed = [0,0,0,0];

	this.addPop = function(type) {
		var pop = 0;
		Grow.list.forEach( function(loc, i) {
			var x = loc%TERRAIN_SIZE;
			var z = (loc/TERRAIN_SIZE)|0;
			if((Grow.growers[z][x].mode/3)|0 === type +4)
				pop += type === 0 ? Grow.growers[z][x].residents : Grow.growers[z][x].employees;
		});
		return pop;
	}
	this.addUnemployed = function (type) {
		var pop = 0;
		Grow.list.forEach( function(loc, i) {
			var x = loc%TERRAIN_SIZE;
			var z = (loc/TERRAIN_SIZE)|0;
			if((Grow.growers[z][x].mode/3)|0 === 4)//residential
				pop += Grow.growers[z][x].unemployed*Grow.growers[z][x].empSplit[type];
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
		var z0 = Zone.zones[(order0[i]/TERRAIN_SIZE)|0][order0[i]%TERRAIN_SIZE];
//		z0.adjustLandValue();
		z0.develop();
	}
	for(var i = 0; i < order1.length; i++)
	{
		var z1 = g[(order1[i]/TERRAIN_SIZE)|0][order1[i]%TERRAIN_SIZE];
		if(z1.mode >= 12 && z1.mode < 15)//residential
		{
			/* Redistribute the pool and increase the population total by the tile's population */
			z1.house(z1.birthRate -z1.deathRate);
			for(var j = 0; j < order2.length; j++)
			{
				var z2 = g[(order2[j]/TERRAIN_SIZE)|0][order2[j]%TERRAIN_SIZE];
				if(/*commute(z1,z2) &&*/ z2.mode >= 15 && z2.mode < 18)
					if(Math.random() < .75*(1 -this.commercialTax))
						z1.unemployed -= z2.employ(this.unemployed[0], z1.unemployed*z1.empSplit[0]);
				if(/*commute(z1,z2) &&*/ z2.mode >= 18 && z2.mode < 21)
					if(Math.random() < .75*(1 -this.officeTax))
						z1.unemployed -= z2.employ(this.unemployed[1], z1.unemployed*z1.empSplit[1]);
				if(/*commute(z1,z2) &&*/ z2.mode >= 21 && z2.mode < 23)
					if(Math.random() < .75*(1 -this.lightIndTax))
						z1.unemployed -= z2.employ(this.unemployed[2], z1.unemployed*z1.empSplit[2]);
				if(/*commute(z1,z2) &&*/ z2.mode === 23)
					if(Math.random() < .75*(1 -this.heavyIndTax))
						z1.unemployed -= z2.employ(this.unemployed[3], z1.unemployed*z1.empSplit[3]);
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
						z2.revenue += 100*(1.0 -this.heavyIndTax);
						this.heavyIndEarn += 100*this.heavyIndTax;
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
						z2.revenue += 100*(1.0 -this.lightIndTax);
						this.lightIndEarn += 100*this.lightIndTax;
					}
				else if(/*commute(z2, z1) &&*/ z2.mode >= 12 && z2.mode < 15)
					maxCustomers += z2.residents*1.5*z2.propCanWork*Math.random();
				if(receivedGoods === z1.variant)
					break;
			}
			/* Calculate the overall revenue for the tile. */
			z1.production = (receivedGoods +Math.random()/10)*(1.0 -this.commercialTax);
			z1.revenue = 100*z1.production*maxCustomers;
			this.commercialEarn += 100*(receivedGoods +Math.random()/10)*this.commercialTax*maxCustomers;
		}
	}
	this.residentialEarn += this.addPop(0)*this.residentialTax*15;
	this.officeEarn += this.addPop(2)*this.officeTax*30;

	var poolGrowthRate = this.immigrationRate +this.birthRate -this.deathRate;
	this.populationPool *= 1 +poolGrowthRate;

	this.residents = this.addPop(0) +this.populationPool;
	$('#population').text('Population: ' + Math.floor(this.residents));

	for(var i = 0; i < this.unemployed.length; i++)
		this.unemployed[i] = this.addUnemployed(i);
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