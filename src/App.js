import './App.css';
import React from 'react';
import data from "./zones";


function App() {
  return (
    <div className="app">
 		<canvas id="canvas"></canvas>
 		<Map />
    </div>
  );
}

class Map extends React.Component {
	constructor(props) {
		super(props);
		// view: mapview, zoneview
		// 
		this.state = {
			view : "mapview",
			isPortalActive : false,
			active_portal : [null, null],
			connections : "[]",
			labels : true,
			isZoneActive : false,
			side_zones : [],
			main_zone : null
		};
		this.zones = data.zones;
		this.mapstatechange = this.mapstatechange.bind(this);	
		if(localStorage.getItem('connections') != '[]'){
			localStorage.setItem('connections', '[]');
		}
	}
	
	mapstatechange(obj){
		this.setState(obj);
	}
	
	render(){
//		localStorage.setItem('connections', "");
		var newstyle = this.props.color;
// 		console.log(newstyle);
		return (
    <div className={"map "+this.state.view} onClick={(e)=> mapView(this, "map")} onContextMenu={(e)=> mapRightClick(this, "map")}>
 		{this.zones.map((datum, key) => {
			return <Zone key={key} id={datum.id} name={datum.name} color={datum.color} portals={datum.portals} state={this.state} mapstatechange={this.mapstatechange} />
		})}
		<button id="toggleText" className="toggletext" onClick={(e) => toggleLabels(e, this)} >Toggle Area Labels</button>
    </div>
		);
	}
}


class Zone extends React.Component {
	constructor(props) {
		super(props);
	}

	render(){
//		var newstyle = this.props.color;
		var labelClass = "";
		var zoneState = "";
		
		if(this.props.id === this.props.state.main_zone){
			zoneState = " main";
		} 
//			console.log(this.props.state.side_zones);
		try{
		for(var i=0; i<this.props.state.side_zones.length; i++){
//			console.log(this.props.state.side_zones[i]);
//			console.log(this.props.id);
			if(this.props.id === this.props.state.side_zones[i]){
//				console.log("WOOP!");
				zoneState = " side";
			}
//			console.log(zoneState);
		}
		} catch(err) {
			console.log("No connections yet");
		}
		
		
		if(!this.props.state.labels){
			labelClass = " hidelabels"
		}
//		console.log(zoneState);
		return (
			<div className={"zone zone"+this.props.id+zoneState} data-id={this.props.id} data-name={this.props.name} data-color={this.props.color} onClick={(e)=> zoneClick(e, this.props.id, this)} onContextMenu={(e)=> zoneRightClick(e.target, this)}>
				<h2 className={"label"+labelClass}>{this.props.name}</h2>
				{this.props.portals.map((datum, key) => {
					return <Portal key={key} id={datum.id} color={this.props.color} zoneid={this.props.id} state={this.props.state} mapstatechange={this.props.mapstatechange} />
				})}
	      	</div>
		);
	}
}

class Portal extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			connected : "unassigned"
		};
		this.portalstatechange = this.portalstatechange.bind(this);	
	}
	
	portalstatechange(obj){
		this.setState(obj);
	}
	
	render(){
		return (
			<div className={"portal portal"+this.props.id+" "+ this.state.connected} data-id={this.props.id} data-zoneid={this.props.zoneid} onClick={(e)=> clickPortal(this, e, "left")} onContextMenu={(e)=> clickPortal(this, e, "right")}></div>
	  	);
  	}
}

// MAP LOGIC


function mapView(comp, fromWhich){
//	console.log(comp);
	if(fromWhich == "map"){
		try {
			comp.mapstatechange({
				view : "mapview",
				main_zone : null,
				side_zones : []
			});
		} catch(err) {
			console.log("mapview: map error");
		}
	}
	
	if(fromWhich == "zone"){
		try {
			comp.props.mapstatechange({
				view : "mapview",
				main_zone : null,
				side_zones : []
			});
		} catch(err) {
			console.log("mapview: zone error");
		}
	}

}

function mapRightClick(comp){
	if(comp.state.view == "zoneview"){
		mapView(comp, "map");	
	}
}


// ZONE LOGIC

function zoneClick(e, id, comp){
	e.stopPropagation();
	var all_zones = document.getElementsByClassName("zone");
	var connections = localStorage.getItem("connections");
	var cnxzones = [];
	var filtered_cnxzones;
//	var sidecounter = 1;
//	var newarr = comp.props.state.side_zones;
//	console.log(connections);
	let cnx;
	try {
		cnx = JSON.parse(connections);
		if(cnx.length>0){
			for(var i=0; i<cnx.length; i++){
				if(cnx[i][0][0] === comp.props.id || cnx[i][1][0] === comp.props.id){
					for(var j=0; j<cnx[i].length; j++){
						cnxzones.push(cnx[i][j][0]);
						filtered_cnxzones = removeDuplicates(cnxzones);
					}				
				}
			}
			
//			console.log(filtered_cnxzones);
			
			if(filtered_cnxzones.length>0){
				var index = filtered_cnxzones.indexOf(comp.props.id);
				filtered_cnxzones.splice(index, 1);
			}
//			console.log(filtered_cnxzones);

		}
	} catch (err) {
		console.log("local storage connections data not valid JSON");
	}
//	console.log(filtered_cnxzones);
	zoneView(comp, filtered_cnxzones);

//	sidecounter = 1;
//	console.log("in func");
//	try{
//		for(var k=0; k<filtered_cnxzones.length; k++){
			// add sidezone class
//				console.log("in k loop");
	
//			if(filtered_cnxzones[k] != id){
//				console.log(comp);
//				console.log(id);
				
//				newarr.push(filtered_cnxzones[k]);				
				
/*
				var sideclass = 'sidezone'+(sidecounter);
				sidecounter++;
//				console.log(sideclass);
//				console.log(all_zones[filtered_cnxzones[k]].classList);
				all_zones[filtered_cnxzones[k]].classList.add(sideclass);
//				console.log(all_zones[filtered_cnxzones[k]].classList);
*/
//			}
//		}
//		console.log(newarr);
//	} catch (err) {
//		console.log("nothing in connex array yet");
//	}
//	console.log(newarr);
}

function zoneRightClick(comp){
	mapView(comp, "zone");
}


function zoneView(comp, side_ids){

	console.log(comp);
	console.log(side_ids);

// if it's a MAP click
/*
	try {
		comp.mapstatechange({
			view : "zoneview"
		});
	} catch(err) {
		console.log("zoneview: not a map");
	}
*/
	
// if it's a ZONE click
//console.log(side_ids);
	try {
		comp.props.mapstatechange({
			view : "zoneview",
			main_zone : comp.props.id,
			side_zones : side_ids
		});
	} catch(err) {
		console.log("zoneview: not a zone");
	}

}

// PORTAL LOGIC

function clickPortal(comp, e, type){
	e.stopPropagation();
	var hasConnection = false;
	for(var i=0; i<e.target.classList.length; i++){
		if(e.target.classList[i] == "connected"){
			hasConnection = true;
		}
	}
//	console.log(hasConnection);
	if(type == "left"){
		if(!hasConnection){
			//left click
			if(comp.props.state.isPortalActive){
				// There is already a clicked portal
				if(comp.props.state.active_portal[0] == comp.props.zoneid && comp.props.state.active_portal[1] == comp.props.id){
//					console.log("same portal");
					comp.props.mapstatechange({
						isPortalActive : false,
						active_portal : [null, null]
					});	
				} else {
					makePartnership(comp, [comp.props.state.active_portal[0], comp.props.state.active_portal[1]], [comp.props.zoneid, comp.props.id]);
//					console.log("make partnership");
					comp.props.mapstatechange({
						isPortalActive : false,
						active_portal : [null, null]
					});
					comp.portalstatechange({
						connected : "connected"
					});
				}

			} else {
	//			console.log(comp);
				// There are no clicked portals
				comp.props.mapstatechange({
					isPortalActive : true,
					active_portal : [comp.props.zoneid, comp.props.id]
				});
				comp.portalstatechange({
					connected : "connected"
				});

			}
//			console.log("TYPE FOR CONNX:");
//			console.log(e.target.classList);
		}
	} else if (type == "right") {
		// right click
		if(comp.props.state.active_portal[0] == comp.props.zoneid && comp.props.state.active_portal[1] == comp.props.id){
			comp.props.mapstatechange({
				isPortalActive : false,
				active_portal : [null, null]
			});
			comp.portalstatechange({
				connected : "unassigned"
			});
		}
	}

}

// CONNECTIONS LOGIC



function makePartnership(comp, portal1, portal2){
//	console.log(portal1);
//	console.log(portal2);
//	console.log(comp.props.state.connections);
	var connections_exist = false;
	var newportals = [portal1, portal2];
	let existing_connections;
	try {
		existing_connections = JSON.parse(comp.props.state.connections);
//		console.log(existing_connections);
		connections_exist = true;
	} catch (err) {
		console.log("map state connections data not valid JSON");
//		return console.error(e);
	}
	if(connections_exist){
		existing_connections.push(newportals);
		comp.props.mapstatechange({
			connections : JSON.stringify(existing_connections)
		});
		localStorage.setItem('connections', JSON.stringify(existing_connections));
	} else {
		comp.props.mapstatechange({
			connections : JSON.stringify(newportals)
		});
		localStorage.setItem('connections', JSON.stringify(newportals));
	}
	
	drawLines();
	
//	console.log(comp.props.state.connections);
}

// DRAWING LINES

function drawLines(){
	var connections = localStorage.getItem("connections");
	var all_portals = document.getElementsByClassName("portal");
	var all_zones = document.getElementsByClassName("zone");
	var x, y;
	var color1, color2, c1, c2 = "white";
	var colors = ["white", "yellow", "red", "orange", "yellow", "blue", "purple", "pink", "brown", "gray"];
	var colorcounter = 0;
	shuffle(colors);
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	canvas.width  = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
	let cnx;
	try {
		cnx = JSON.parse(connections);
//		console.log(cnx);
		for(var i=0; i<cnx.length; i++){
			// all connections loop
	//		console.log(cnx[i]);
			for(var j=0; j<cnx[i].length; j++){
				// each portal in a connection
	//			console.log(cnx[i][j]);
				var strokecolor = getcolor(colors, colorcounter);
				var zoneid = cnx[i][j][0];
				var portalid = cnx[i][j][1];
				var zone_x = all_zones[zoneid].offsetLeft;
				var zone_y = all_zones[zoneid].offsetTop;
	//			console.log("ZONE: " + zone_x + ", " + zone_y)
	//			console.log(all_zones[zoneid].childNodes);
				var portal_x = all_zones[zoneid].childNodes[(portalid+1)].offsetLeft;
				var portal_y = all_zones[zoneid].childNodes[(portalid+1)].offsetTop;
	//			console.log("PORTAL: " + portal_x + ", " + portal_y);
			
				if(j===0){
					// first portal in connection
					x = (zone_x)+(portal_x);
					y = (zone_y)+(portal_y);
					color1 = all_zones[zoneid].dataset.color;
//					console.log("LINES");
//					console.log(all_zones[zoneid].dataset.color);
				} else if(j===1) {
					// second portal
					color2 = all_zones[zoneid].dataset.color;
					const this_w = Math.abs((x-(zone_x+portal_x)));
					const this_h = Math.abs((y-(zone_y+portal_y)));
/*
					const angle = 90 * (Math.PI / 180);
					const x2 = 300 * Math.cos(angle);
					const y2 = 300 * Math.sin(angle);
*/
					const gradient = ctx.createLinearGradient(x, y, (zone_x+portal_x), (zone_y+portal_y));
//					var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
//					gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
/*
					if(x>(zone_x+portal_x)){
						c2 = color1;
						c1 = color2;
					} else {
						c1 = color1;
						c2 = color2;
					}
*/
					gradient.addColorStop("0", color1);
//					gradient.addColorStop("0.5", "#111111");
					gradient.addColorStop("1.0", color2);
					//console.log(gradient);
//					console.log(this_w);
//					console.log(this_h);
					ctx.strokeStyle = gradient;
					ctx.lineWidth = 3;
					ctx.beginPath();
					ctx.moveTo((zone_x)+(portal_x)+(10), (zone_y)+(portal_y)+(10));
					ctx.lineTo(x+(10), y+(10));
					ctx.stroke();
					x=0;
					y=0;
				}
			}
			
		}
	} catch (e) {
		console.log("local storage connections data not valid JSON");
//		return console.error(e);
	}
}

function getcolor(arr, counter){
	if(counter >= arr.length){
		counter = 0;
	} else {
		counter++;
	}
	return arr[counter];
}

function randomColor(){
	var colors = ["white", "yellow", "red", "orange", "yellow", "blue", "purple", "pink", "brown", "gray"];
	var num = colors.length;
	var i = Math.floor(Math.random()*num);
	return colors[i];
}

function clearLines(){
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// APP FEATURES

function toggleLabels(e, comp){
	if(comp.state.labels){
		try {
			comp.mapstatechange({
				labels : false
			});
		} catch(err) {
			console.log("togglebuttons: not a map");
		}
		
	} else {
		try {
			comp.mapstatechange({
				labels : true
			});
		} catch(err) {
			console.log("togglebuttons: not a map");
		}
	}
}

// GENERAL FUNCTIONS

function removeDuplicates(arr) { 
	return arr.filter((item, 
		index) => arr.indexOf(item) === index); 
} 

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}



// LISTENERS

window.addEventListener('contextmenu', function (e) {
//  console.log('context menu disabled');
  e.preventDefault();
}, false);
window.addEventListener("transitionstart", function (e) {
	clearLines();
});
window.addEventListener("transitionend", function (e) {
	drawLines();
});
window.addEventListener("resize", (event) => {
	clearLines();
	drawLines();
});



export default App;
