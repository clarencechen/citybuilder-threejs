const TERRAIN_SIZE = 256;
// ---------

var center = [Math.floor(window.innerWidth/2), Math.floor(window.innerHeight/2)];
var mode = 1;
var simSpeed = 1;
var counter = 0;
var mousePositionX = center[0];
var mousePositionY = center[1];
var leftButton = false;
var rightButton = false;
var middleButton = false;
var keyPressed = false;
var mouseBufferX = center[0];
var mouseBufferY = center[1];
var buildBridge = false;
var bridgeHeight = 0;
var tunnelmode = false;
var lastAnchor = null;
var anchor = null; //index of anchor vertex/tile when selecting
var current = null; //index of current vertex/tile when selecting
var scene;
var camera;
var renderer;
var terrain;
var light;
var raycaster;
var city;

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	center = [Math.floor(window.innerWidth/2), Math.floor(window.innerHeight/2)];
	renderer.setSize( window.innerWidth, window.innerHeight);
	render();

}

function init() {

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

	camera.position.y=8;
	camera.lookAt(new THREE.Vector3(0,0,0));

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild( renderer.domElement );

	light = new THREE.DirectionalLight( 0xffffbb, 1 );
	scene.add(light);
	generateTerrain(TERRAIN_SIZE);

	var axisHelper = new THREE.AxisHelper( 8 );
	scene.add(axisHelper);

	scene.fog = new THREE.FogExp2( 0x000000, 0.000025 );
	renderer.setClearColor( scene.fog.color, 1 );

	raycaster = new THREE.Raycaster();
	city = new City();

	setUpControlListeners();
	window.addEventListener('resize', onWindowResize, false);
	render();
}

function generateTerrain(size) {
	var tiles = new THREE.Geometry();
	for (var i = 0; i < (size +1)*(size +1); i++)
	{
		tiles.vertices.push(new THREE.Vector3(i%(size +1), 0, (i/(size +1))|0));
	}
	for(var i = 0; i < size*size; i++)
	{
		var topleft = i%size +(size +1)*((i/size)|0);
		var topright = topleft +1;
		var bottomleft = i%size +(size +1)*(((i/size)|0) +1);
		var bottomright = bottomleft +1;
		var initNormal = new THREE.Vector3(0,1,0);
		var initColor = [new THREE.Color(0x004000), new THREE.Color(0x004000), new THREE.Color(0x004000)];
		tiles.faces.push(new THREE.Face3(topright, topleft, bottomleft, initNormal, initColor));
		tiles.faces.push(new THREE.Face3(topright, bottomleft, bottomright, initNormal, initColor));
	}
	tiles.center();
	tiles.computeFaceNormals();
	tiles.computeVertexNormals();
	var terrainWire = new THREE.MeshBasicMaterial({color: 0x008000, wireframe: true, transparent: true});
	var terrainGround = new THREE.MeshLambertMaterial({color: 0xffffff, vertexColors: THREE.VertexColors, transparent: true});
	var materials = [terrainGround, terrainWire];
	terrain = THREE.SceneUtils.createMultiMaterialObject(tiles, materials);
	terrain.name = "terrain";
	scene.add(terrain);
}

function toggleTerrain(transparent) {
	var terrain = scene.getObjectByName('terrain').children;
	terrain[0].material.visible = transparent
}

function render() {
	simulate();
	var mouse = new THREE.Vector2(2*mousePositionX/renderer.getSize().width -1, -2*mousePositionY/renderer.getSize().height +1);
	if(mode <= 4)
		current = updateSelectedVertexPosition(mouse);
	else if(mode <= 24 || mode == 64)
		current = updateSelectedTilePosition(mouse);
	else
		current = updatePlacementPosition(mouse);
	requestAnimationFrame( render );
	renderer.render( scene, camera );
	lastAnchor = null;
}

function pan() {
	var worldProjection = camera.getWorldDirection().clone().projectOnPlane(new THREE.Vector3(0,1,0)).normalize();
	var strafeVector = worldProjection.clone().cross(new THREE.Vector3(0,1,0)).normalize().negate();
	var deltaX = (mouseBufferX -mousePositionX)/window.innerWidth;
	var deltaY = (mouseBufferY -mousePositionY)/window.innerHeight;
	camera.position.add(worldProjection.multiplyScalar(deltaY)).add(strafeVector.multiplyScalar(deltaX));
}
function rotate() {
	const worldVector = camera.getWorldDirection();
	var upVector = new THREE.Vector3(0,1,0);
	var tiltVector = new THREE.Vector3();
	tiltVector.crossVectors(worldVector.clone(),upVector.clone()).normalize();
	var deltaX = (mouseBufferX -mousePositionX)/window.innerWidth;
	var deltaY = (mouseBufferY -mousePositionY)/window.innerHeight;
	worldVector.applyAxisAngle(upVector, deltaX);
	worldVector.applyAxisAngle(tiltVector, deltaY);
	var cameraVector = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
	camera.lookAt(worldVector.add(cameraVector));
}
function zoom(amt) {
	var worldVector = camera.getWorldDirection().clone().normalize();
	var delta = (Math.pow(2, amt/16) -1)*camera.position.y;
	camera.position.add(worldVector.multiplyScalar(delta));
}

function startOperation() {
	anchor = current;
}

function endOperation() {
	lastAnchor = anchor;
	anchor = null;
	switch(mode){
		case 1://raise terrain
			editTerrain(true);
			break;
		case 2://raise terrain
			editTerrain(false);
			break;
		case 5://place roads
		case 6:
			constructRoad(mode, buildBridge ? bridgeHeight : null);
			break;
		case 64:
			demolish();
			break;
		case 12:
		case 13:
		case 14:
		case 15:
		case 16:
		case 17:
		case 18:
		case 19:
		case 20:
		case 21:
		case 22:
		case 23:
			zone(mode);
			break;
		case 24:
			zone(0); //dezone
			break;
		default:
			if(mode > 24 && mode < 64)
				plop(mode);
			break;
	}
}

function simulate() {
	if(simSpeed !== 0)
		counter = ((counter/simSpeed)|0)*simSpeed;
	counter += simSpeed;
	for(var i = 0; i < simSpeed; ++i)
		city.simulate();
	if(counter % 256 === 0)
		city.budget();
	$('#calendar').text('Current Year: ' + ((counter/256)|0));
}

function setUpControlListeners() {
	$('canvas').mousemove(function(e) {
		mousePositionX = e.pageX;
		mousePositionY = e.pageY;
		if(rightButton)
			pan();
		if(middleButton)
			rotate();
	});
	$('canvas').mousedown(function(e) {
	switch(e.which){
		case 1:
			leftButton = true;
			startOperation();
			break;
		case 2:
			e.preventDefault();
			middleButton = true;
			mouseBufferX = mousePositionX;
			mouseBufferY = mousePositionY;
			break;
		case 3:
			e.preventDefault();
			rightButton = true;
			mouseBufferX = mousePositionX;
			mouseBufferY = mousePositionY;
			break;
		}
	});
	$('canvas').mouseup(function(e) {
		switch(e.which){
		case 1:
			leftButton = false;
			endOperation();
			break;
		case 2:
			middleButton = false;
			mouseBufferX = center[0];
			mouseBufferY = center[1];
			break;
		case 3:
			rightButton = false;
			mouseBufferX = center[0];
			mouseBufferY = center[1];
			break;
		}
	});	
	$('canvas').mousewheel(function(e) {
		e.preventDefault();
		zoom(e.deltaY);
	});
	$(document).keypress(function(e) {
		if(!leftButton)
		{
			keyPressed = true;
			cleanUp();
			switch(e.keyCode)
			{
			case 96: // accent (demolish)
				mode = 64;
				break;
			case 126: // tilde (dezone)
				mode = 24;
				break;
			case 65: // Shift + A key (medium density mixed-use)
				mode = 16;
				break;
			case 70: // Shift + F key (large fire station)
				mode = 41;
				break;
			case 71: // Shift + G key (large plaza area)
				mode = 42;
				break;
			case 72: // Shift + H key (large hospital)
				mode = 43;
				break;
			case 74: // Shift + J key (large high school)
				mode = 44;
				break;
			case 75: // Shift + K key (large elementary)
				mode = 45;
				break;
			case 76: // Shift + L key (large library)
				mode = 46;
				break;
			case 77: // Shift + M Key ()
				mode = 47;
				break;
			case 78: // Shift + N key ()
				mode = 48;
				break;
			case 80: // Shift + P key (large police station)
				mode = 49;
				break;
			case 81: // Shift + Q key (high density mixed-use)
				mode = 17;
				break;
			case 82: // Shift + R key (large road)
				mode = 6;
				break;
			case 83: // Shift + S key (medium density PDR)
				mode = 22;
				break;
			case 87: // Shift + W key (heavy manufacturing)
				mode = 23;
				break;
			case 88: // Shift + X key (low density PDR)
				mode = 21;
				break;
			case 90: // Shift + Z key (low density commercial)
				mode = 15;
				break;
			case 97: // A key (medium density residential)
				mode = 13;
				break;
			case 102: // F key (fire station)
				mode = 25;
				break;
			case 103: // G key (plaza area)
				mode = 26;
				break;
			case 104: // H key (hospital)
				mode = 27;
				break;
			case 106: // J key (high school)
				mode = 28;
				break;
			case 107: // K key (elementary)
				mode = 29;
				break;
			case 108: // L key (library)
				mode = 30;
				break;
			case 109: // M Key (museum)
				mode = 31;
				break;
			case 110: // N key (city college)
				mode = 32;
				break;
			case 112: // P key (police station)
				mode = 33;
				break;
			case 113: // Q key (high density residential)
				mode = 14;
				break;
			case 114: // R Key (road)
				mode = 5;
				break;
			case 115: // S Key (medium density office/commercial)
				mode = 19;
				break;
			case 119: // W Key (high density office/commercial)
				mode = 20;
				break;
			case 120: // X key (low density office)
				mode = 18;
				break;
			case 122: // Z key (low density residential)
				mode = 12;
				break;
			case 44: // , (raise terrain)
				mode = 1;
				break;
			case 46: // . (lower terrain)
				mode = 2;
				break;
			case 47: // / (View tunnels)
				tunnelmode = !tunnelmode;
				toggleTerrain(tunnelmode);
				break;
			case 91: // [ (raise bridge height)
				if(buildBridge)
					bridgeHeight += 0.25;
					$('#bridge').text("Road Elevation: " + bridgeHeight*16 + " m");
				break;
			case 93: // ] (lower bridge height)
				if(buildBridge)
					bridgeHeight -= 0.25;
					$('#bridge').text("Road Elevation: " + bridgeHeight*16 + " m");
				break;
			case 92: // \ (toggle bridge construction)
				buildBridge = !buildBridge;
				if(!buildBridge)
					$('#bridge').text("Roads flush with terrain");
				else
					$('#bridge').text("Road Elevation: " + bridgeHeight*16 + " m");
				break;
			case 32: // Space
//				addObjectToScene();
			default:
				break;
			}
		}
	});
	$('canvas').keyup(function (e) {
		keyPressed = false;
	});
}

$(document).ready(function() {
	init();

});
window.oncontextmenu = function() { return false };
