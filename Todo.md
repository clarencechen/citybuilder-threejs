Utilities:
	Needed or else growables will abandon
	Power and Water:
		Pipes and Lines deliver to growables, per-capita consumption decreases as variant and education increase
	Garbage:
		Effectiveness based on road congestion, per-capita production decreases with power and water consumption
Outside Connections:
	Used to import raw materials and goods when not locally produced
Commutes, Shopping Trips, and Freight:
	A* algorithm, initially supporting car and pedestrian, adding public transport later
	Pedestrian commutes are slow but do not contribute to congestion
Land Value:
	Based on services, pollution, terrain slope, and Land Value and commute time of nearby lots
Public Transport:
	Set up bus lines and train lines and tracks at all elevations
Services:
	All increase Land Value
	Police and Fire:
		
	Education:
		Shifts employment and wealth ratios, affects birth rates significantly
	Health:
		Affects birth rates somewhat and death rates greatly
	Parks:
		Affects death rates slightly directly, decreases Air and Noise Pollution
Pollution:
	Comes in three forms: Air, Ground/Water, and Noise
	Production decreases as Land Value increases
	Increases Death Rates and Decreases Land Value of nearby lots
	Trees/Parks help with Air and Noise Pollution
	Air:
		Mainly comes from private autos, heavy manufaturing, and dirty power plants
	Ground/Water:
		Mainly comes from heavy maufacturing and dirty power plants
	Noise:
		More tolerable than other two, but PDR and some commercial growables produce it too
