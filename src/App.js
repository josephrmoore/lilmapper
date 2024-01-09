import './App.css';
import React from 'react';
import data from "./zones";

	var useItems = true;
	var useBosses = true;
	var useLabels = true;

function App() {
	
	var labelText = "ON"
	
	return (
    	<div className="app">
 			<canvas id="canvas"></canvas>
 			<Map />
 			<div className="control_panel">
 				<button id="toggleText" className="toggletext" onClick={(e) => toggleLabels(e, useLabels)} >Area Name</button>
 				<button id="toggleItems" className="toggleitems" onClick={(e) => toggleItems(e, useItems)} >Item Count</button>
 				<button id="toggleBosses" className="togglebosses" onClick={(e) => toggleBosses(e, useBosses)} >Bosses</button>
 			</div>
 		</div>
 	);
}

class Map extends React.Component {
	constructor(props) {
		super(props);
		// view: mapview, zoneview
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
		var newstyle = this.props.color;
		return (
    <div id="map" className={"map "+this.state.view} onClick={(e)=> mapView(this, "map")} onContextMenu={(e)=> mapRightClick(this, "map")} data-mode={this.state.view} data-mainzone={this.state.main_zone}>
 		{this.zones.map((datum, key) => {
			return <Zone key={key} id={datum.id} name={datum.name} color={datum.color} portals={datum.portals} state={this.state} mapstatechange={this.mapstatechange} />
		})}
    </div>
		);
	}
}


class Zone extends React.Component {
	constructor(props) {
		super(props);
	}

	render(){
		var labelClass = "";
		var zoneState = "";
		
		if(this.props.id === this.props.state.main_zone){
			zoneState = " main";
		} 
		try{
			for(var i=0; i<this.props.state.side_zones.length; i++){
				if(this.props.id === this.props.state.side_zones[i]){
					zoneState = " side";
				}
			}
		} catch(err) {
			console.log("No connections yet");
		}
		
		
		if(!this.props.state.labels){
			labelClass = " hidelabels"
		}
		
		return (
			<div className={"zone zone"+this.props.id+zoneState} data-id={this.props.id} data-name={this.props.name} data-color={this.props.color} onClick={(e)=> zoneClick(e, this.props.id, this)} onContextMenu={(e)=> zoneRightClick(e.target, this)}>
				<h2 className={"label"+labelClass}>{this.props.name}</h2>
				{this.props.portals.map((datum, key) => {
					return <Portal key={key} id={datum.id} color={this.props.color} zoneid={this.props.id} state={this.props.state} mapstatechange={this.props.mapstatechange} direction={datum.dir} name={datum.name} />
				})}
				<Clickbox type="items" />
				{(this.props.id === 3 || this.props.id === 5 || this.props.id === 7 || this.props.id === 8) ? (<Clickbox type="bosses" />) : ("")}
				
	      	</div>
		);
	}
}

class Portal extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			connected : "unassigned",
			partner_color : ""
		};
		this.portalstatechange = this.portalstatechange.bind(this);	
	}
	
	portalstatechange(obj){
		this.setState(obj);
	}
	
	render(){
		return (
			<div className={"portal portal"+this.props.id+" "+ this.state.connected} data-id={this.props.id} data-zoneid={this.props.zoneid} onClick={(e)=> clickPortal(this, e, "left")} onContextMenu={(e)=> clickPortal(this, e, "right")} data-partnercolor={this.state.partner_color}><p className="portal_name">{this.props.name}</p></div>
	  	);
  	}
}

class Clickbox extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			// type: items, bosses
			type : this.props.type,
			value: 0,
			boss: "unknown"
		};
		this.clickboxstatechange = this.clickboxstatechange.bind(this);	
	}
	
	clickboxstatechange(obj){
		this.setState(obj);
	}
	
	render(){
		return (
			<div className={"clickbox "+this.state.type+" "+((this.state.boss)?this.state.boss:"")} onClick={(e)=> clickClickbox(e, this, "left")} onContextMenu={(e)=> clickClickbox(e, this, "right")}><span className={"value"}>{(this.state.type === "items") ? this.state.value : ""}</span></div>
	  	);
  	}
}


function clickClickbox(e, comp, dir){
	var all_bosses = ["kraid", "phantoon", "draygon", "ridley", "unknown"];
	e.preventDefault();
	e.stopPropagation();
	var maxvalue;
	if(comp.state.type === "bosses"){
		maxvalue = all_bosses.length-1;
		if(dir === "left"){
			// left click
			if(comp.state.value < maxvalue){
				comp.clickboxstatechange({
					value : (Number(comp.state.value)+1),
					boss : all_bosses[(Number(comp.state.value)+1)]
				});
			} else {
				comp.clickboxstatechange({
					value : 0,
					boss : all_bosses[0]
				});
			}
		} else if (dir === "right"){
			// right click
			if(comp.state.value > 0){
				comp.clickboxstatechange({
					value : (Number(comp.state.value)-1),
					boss : all_bosses[(Number(comp.state.value)-1)]
				});
			} else {
				comp.clickboxstatechange({
					value : maxvalue,
					boss : all_bosses[maxvalue]
				});
			}
		}
	} else if(comp.state.type === "items"){
		maxvalue = 9;
		if(!comp.state.value){
			comp.clickboxstatechange({
				value : 0
			});
		}
		if(dir === "left"){
			// left click
			if(comp.state.value < maxvalue){
				comp.clickboxstatechange({
					value : (Number(comp.state.value)+1)
				});
			} else {
				comp.clickboxstatechange({
					value : 0
				});
			}
		} else if (dir === "right"){
			// right click
			if(comp.state.value > 0){
				comp.clickboxstatechange({
					value : (Number(comp.state.value)-1)
				});
			} else {
				comp.clickboxstatechange({
					value : maxvalue
				});
			}
		}
	}
}

// MAP LOGIC


function mapView(comp, fromWhich){
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
	let cnx;
	if(comp.props.state.view === "mapview"){
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
				if(filtered_cnxzones.length>0){
					var index = filtered_cnxzones.indexOf(comp.props.id);
					filtered_cnxzones.splice(index, 1);
				}
			}
		} catch (err) {
			console.log("local storage connections data not valid JSON");
		}
		zoneView(comp, filtered_cnxzones);
	}
}

function zoneRightClick(comp){
	mapView(comp, "zone");
}


function zoneView(comp, side_ids){

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
//	e.preventDefault();
	e.stopPropagation();
	if(type == "left"){
//		console.log(comp.state.connected);
		if(comp.state.connected !== "connected"){
			//left click
			if(comp.props.state.isPortalActive){
				// There is already a clicked portal
				if(comp.props.state.active_portal[0] == comp.props.zoneid && comp.props.state.active_portal[1] == comp.props.id){
					comp.props.mapstatechange({
						isPortalActive : false,
						active_portal : [null, null]
					});	
				} else {
					makePartnership(comp, [comp.props.state.active_portal[0], comp.props.state.active_portal[1]], [comp.props.zoneid, comp.props.id]);
					comp.props.mapstatechange({
						isPortalActive : false,
						active_portal : [null, null]
					});
					comp.portalstatechange({
						connected : "connected",
						partner_color : data.zones[comp.props.state.active_portal[0]].color
					});
//					console.log(data.zones[comp.props.zoneid].color);
				}

			} else {
				// There are no clicked portals
				comp.props.mapstatechange({
					isPortalActive : true,
					active_portal : [comp.props.zoneid, comp.props.id]
				});
				comp.portalstatechange({
					connected : "connected"
				});
//				console.log(data.zones[comp.props.zoneid].color);
			}
		}
	} else if (type == "right") {
		// right click
		if(comp.props.state.active_portal[0] == comp.props.zoneid && comp.props.state.active_portal[1] == comp.props.id){
			comp.props.mapstatechange({
				isPortalActive : false,
				active_portal : [null, null]
			});
			comp.portalstatechange({
				connected : "unassigned",
				partner_color : ""
			});
		}
	}

}

// CONNECTIONS LOGIC



function makePartnership(comp, portal1, portal2){
	var connections_exist = false;
	var newportals = [portal1, portal2];
	let existing_connections;
	try {
		existing_connections = JSON.parse(comp.props.state.connections);
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
	
}

// DRAWING LINES

function drawLines(){
	clearLines();
	var map = document.getElementById("map");
	var map_mode = map.dataset.mode;
	var map_main_zone = Number(map.dataset.mainzone);
	var connections = localStorage.getItem("connections");
	var all_portals = document.getElementsByClassName("portal");
	var all_zones = document.getElementsByClassName("zone");
	var x, y;
	var color1, color2, c1, c2 = "white";
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	canvas.width  = canvas.offsetWidth;
	canvas.height = canvas.offsetHeight;
	let cnx;
	try {
		cnx = JSON.parse(connections);
		for(var i=0; i<cnx.length; i++){
			// all connections loop		
			if(map_mode === "mapview" || map_main_zone === cnx[i][0][0] || map_main_zone === cnx[i][1][0]){
				for(var j=0; j<cnx[i].length; j++){
					// each portal in a connection
					var zoneid = cnx[i][j][0];
					var portalid = cnx[i][j][1];
					var zone_x = all_zones[zoneid].offsetLeft;
					var zone_y = all_zones[zoneid].offsetTop;
					var portal_x = all_zones[zoneid].childNodes[(portalid+1)].offsetLeft;
					var portal_y = all_zones[zoneid].childNodes[(portalid+1)].offsetTop;
				
					if(j===0){
						// first portal in connection
						x = (zone_x)+(portal_x);
						y = (zone_y)+(portal_y);
						color1 = all_zones[zoneid].dataset.color;
					} else if(j===1) {
						// second portal
						color2 = all_zones[zoneid].dataset.color;
						const this_w = Math.abs((x-(zone_x+portal_x)));
						const this_h = Math.abs((y-(zone_y+portal_y)));
	
						const gradient = ctx.createLinearGradient(x, y, (zone_x+portal_x), (zone_y+portal_y));
						gradient.addColorStop("0", color1);
						gradient.addColorStop("1.0", color2);
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
			
			if(map_mode === "zoneview" && map_main_zone !== cnx[i][0][0] && map_main_zone !== cnx[i][1][0]){
				for(var j=0; j<cnx[i].length; j++){
					var zoneid = cnx[i][j][0];
					var portalid = cnx[i][j][1];
					// Do css/canvas semicircles
				}
			}
			
		}
	} catch (e) {
		console.log("local storage connections data not valid JSON");
	}
}

function clearLines(){
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// APP FEATURES

function toggleLabels(e, bool){
	
	toggleHidden(e);
	
	toggleClass(bool, "label");
	useLabels = !bool;
}

function toggleItems(e, bool){
	
	toggleHidden(e);
	
	toggleClass(bool, "items");
	useItems = !bool;
}

function toggleBosses(e, bool){
	
	toggleHidden(e);

	toggleClass(bool, "bosses");
	useBosses = !bool;
}


function toggleHidden(e){
	var newbool = false;
	for(var i=0; i<e.target.classList.length; i++){
		if(e.target.classList[i] === "hidden"){
			newbool = true;
		}
	}
	
	if(newbool){
		e.target.classList.remove("hidden");
	} else {
		e.target.classList.add("hidden");
	}
}

function toggleClass(bool, classname){
	var items = document.getElementsByClassName(classname);
	if(bool){
		// Currently YES, turn them OFF
		for(var i=0; i<items.length; i++){
			items[i].classList.add("off");
		}
	} else {
		// Currently NO, turn them ON
		for(var i=0; i<items.length; i++){
			items[i].classList.remove("off");
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
  console.log('context menu disabled');
//  e.preventDefault();
}, false);
window.addEventListener("transitionstart", function (e) {
	clearLines();
});
window.addEventListener("transitionend", function (e) {
	drawLines();
});
window.addEventListener("resize", (event) => {
	drawLines();
});



export default App;
