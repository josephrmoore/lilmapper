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
    		<header>
    			<a href="https://supermetroid.xyz" className="home">supermetroid.xyz</a>
    			<h1>Lil&apos; Mapper</h1>
    		</header>
    		<div className="mapwrapper">
				<canvas id="canvas"></canvas>
				<Map />
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
			active_portal : null,
			connections : "[]",
			labels : true,
			isZoneActive : false,
			side_zones : [],
			main_zone : null,
			main_comp : null,
			side_comps : [],
			haveKraid : false,
			havePhantoon : false,
			haveDraygon : false,
			haveRidley : false
		};
		this.zones = data.zones;
		this.mapstatechange = this.mapstatechange.bind(this);	
		
		if(typeof localStorage.getItem('connections') !== "string"){
			// It has never been set before
			localStorage.setItem('connections', '[]');
		} else {
			var cnx = storageToJSON();
			if(cnx){
				this.state.connections = JSON.stringify(cnx);
			}
			// set connections to whatever is stored in local storage
			// get local storage string
			// parse to json
			// add [] from json to connections var
		}

	}
	
	mapstatechange(obj){
		this.setState(obj);
	}
	
	componentDidMount() {
		drawLines();
	}
	
	componentDidUpdate(){
		console.log("map updated");
		if(this.state.view === "zoneview"){
			placeSides();
		}
	}
	
	resetConnections(){
		this.state.connections = "[]";
	}
	
	render(){
		var newstyle = this.props.color;
		return (
			<div className="controlsWrapper">			
			    <div id="map" className={"map "+this.state.view} onClick={(e)=> mapView(this, "map")} onContextMenu={(e)=> mapRightClick(this, "map")} data-mode={this.state.view} data-mainzone={this.state.main_zone}>
			 		{this.zones.map((datum, key) => {
						return <Zone key={key} id={datum.id} name={datum.name} color={datum.color} portals={datum.portals} state={this.state} mapstatechange={this.mapstatechange} />
					})}
			    </div>
				<div className="control_panel">
					<button id="toggleText" className="toggletext" onClick={(e) => toggleLabels(e, useLabels)} >Area Names</button>
					<button id="toggleItems" className="toggleitems" onClick={(e) => toggleItems(e, useItems)} >Item Count</button>
					<button id="toggleBosses" className="togglebosses" onClick={(e) => toggleBosses(e, useBosses)} >Bosses</button>
					<button id="clearHistory" className="clear_history" onClick={(e) => clearHistory(e, this)} >Clear Map</button>
				</div>
			</div>
		);
	}
}


class Zone extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			//view: default, main, side, offscreen
			view : "default"
		}
	}
	
	zonestatechange(obj){
		this.setState(obj);
	}

	render(){
	
		try{
			this.state.view = "default";
			if(this.props.state.main_zone === this.props.id){
				this.state.view = "main"
			}
			if(this.props.state.side_zones.length>0){
				for(var i=0; i<this.props.state.side_zones.length; i++){
					if(this.props.state.side_zones[i] == this.props.id){
						this.state.view = "side";
					}
				}
			}
		} catch (err) {
			console.log("no side zones");
		}
		
		return (
			<div className={"zone zone"+this.props.id+" "+this.state.view} data-id={this.props.id} data-name={this.props.name} data-color={this.props.color} onClick={(e)=> zoneClick(e, this.props.id, this)} onContextMenu={(e)=> zoneRightClick(e.target, this)}>
				<h2 className={"label"}>{this.props.name}</h2>
				{this.props.portals.map((datum, key) => {
					return <Portal key={key} id={datum.id} color={this.props.color} zoneid={this.props.id} state={this.props.state} mapstatechange={this.props.mapstatechange} dir={datum.dir} name={datum.name} />
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
	
	componentDidMount(){
		checkPortalState(this);
		console.log("portal mounted");
	}
	
	componentDidUpdate(){
		console.log("portal updated");
		if(this.props.state.view === "zoneview"){
			placeSides();
		}
	}
	
	render(){
		var zoneclass = "nozone";
		zoneclass = partnerColors(this);
		
		return (
			<div className={"portal portal"+this.props.id+" part_"+ zoneclass +" "+ this.state.connected} data-id={this.props.id} data-zoneid={this.props.zoneid} onClick={(e)=> clickPortal(this, e, "left")} onContextMenu={(e)=> clickPortal(this, e, "right")} data-partnercolor={this.state.partner_color} data-dir={this.props.dir}><p className="portal_name">{this.props.name}</p><div className={"partner"}></div></div>
	  	);
  	}
}

function checkPortalState(comp){
	var cnx = storageToJSON();
	if(cnx){
		if(cnx.length>0){
			console.log(comp.state.connected);
//			comp.state.connected = "unassigned";
			// cnx[i] is individual connections level
			for(var i=0; i<cnx.length; i++){
				// cnx[i][j] is each portal in a connection 
				for(var j=0; j<cnx[i].length; j++){
					// cnx[i][j][0] is the zone id for a portal
					// cnx[i][j][1] is the portal id for a portal
					if(cnx[i][j][0] === Number(comp.props.zoneid) && cnx[i][j][1] === Number(comp.props.id)){
						console.log(comp.state.connected);
						try{
							comp.portalstatechange({
								connected : "connected"
							});
						} catch (err) {
							console.log("first one failed");
							try {
								comp.state.connected = "connected";
							} catch (err) {
								console.log("portal state error with trys")
							}
						}
					}
				}
			}
		}
	}
}

function storageToJSON(){
	var cnx_text = localStorage.getItem("connections");
	let cnx;
	try {
		cnx = JSON.parse(cnx_text);
		return cnx;
	} catch (err){
		console.log(err);
		console.log("JSON Parse error from localstorage string");
		return false;
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
				side_zones : [],
				main_comp : null,
				side_comps : []
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
				side_zones : [],
				main_comp : null,
				side_comps : []
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
	var all_portals = comp.props.portals;
	var zone_portals = [];
	var connected_portals = [];
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
/*
							if(cnx[i][j][0] === comp.props.id){
								for(var k=0; k<all_portals.length; k++){
									if(cnx[i][j][1] === all_portals[k].id){
										var dir = all_portals[k].dir;
									}	
								}
							}
*/
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
//		console.log(comp.props.state.active_portal);
		try{
			comp.props.state.active_portal.portalstatechange({
				connected : "unassigned",
				partner_color : ""
			});
			comp.props.mapstatechange({
				isPortalActive : false,
				active_portal : null
			});
		} catch(err) {
			console.log("no active portal right now");
		}
		zoneView(comp, filtered_cnxzones);
		comp.zonestatechange({
			view : "main"
		});
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
			side_zones : side_ids,
			main_comp : comp
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
				if(comp.props.state.active_portal.props.zoneid == comp.props.zoneid && comp.props.state.active_portal.props.id == comp.props.id){
					comp.props.mapstatechange({
						isPortalActive : false,
						active_portal : null
					});	
				} else {
					makePartnership(comp, comp.props.state.active_portal, comp);
					comp.portalstatechange({
						connected : "connected",
						partner_color : comp.props.state.active_portal.props.color
					});
//					console.log(comp.props.state.active_portal);
					comp.props.state.active_portal.portalstatechange({
						connected : "connected",
						partner_color : comp.props.color
					});
					comp.props.mapstatechange({
						isPortalActive : false,
						active_portal : null
					});
				}

			} else {
				// There are no clicked portals
				comp.props.mapstatechange({
					isPortalActive : true,
					active_portal : comp
				});
				comp.portalstatechange({
					connected : "connecting"
				});
//				console.log(data.zones[comp.props.zoneid].color);
			}
		}
	} else if (type == "right") {
		// right click
		try{
			if(comp.props.state.active_portal.props.zoneid == comp.props.zoneid && comp.props.state.active_portal.props.id == comp.props.id){
				comp.props.mapstatechange({
					isPortalActive : false,
					active_portal : null
				});
				comp.portalstatechange({
					connected : "unassigned",
					partner_color : ""
				});
			}
			if(comp.state.connected==="connected"){
				// get connections from JSON
				// find cnx same as this portal
				// change portal state for both portals to unassigned
				// delete cnx item in array
				// save to map connections & localstorage

			}
		} catch (err){
			console.log("no active portal");
		}
	}

}

function partnerColors(comp){
	switch(comp.state.partner_color){
		case "#f8d132":
			return "crat";
			break;
		case "#94f073":
			return "gb";
			break;
		case "#d054a8":
			return "rb";
			break;
		case "#24825d":
			return "ws";
			break;
		case "#ff8058":
			return "un";
			break;
		case "#c55251":
			return "ln";
			break;
		case "#99cbfe":
			return "wm";
			break;
		case "#8585f7":
			return "em";
			break;
		case "#979797":
			return "k";
			break;
		case "#676767":
			return "croc";
			break;
		case "#d4d4d4":
			return "t";
			break;
		default:
			return "nozone";
//			console.log("switch break");
	}
//	console.log(comp.state.partner_color);
//	console.log(zoneclass);
}

// CONNECTIONS LOGIC


function makePartnership(comp, portal1, portal2){
	var connections_exist = false;
	var newcnxs = [[portal1.props.zoneid, portal1.props.id], [portal2.props.zoneid, portal2.props.id]];
	let existing_connections;
	try {
		existing_connections = JSON.parse(comp.props.state.connections);
		connections_exist = true;
	} catch (err) {
		console.log("map state connections data not valid JSON");
//		return console.error(e);
	}
	if(connections_exist){
		existing_connections.push(newcnxs);
		comp.props.mapstatechange({
			connections : JSON.stringify(existing_connections)
		});
		localStorage.setItem('connections', JSON.stringify(existing_connections));
	} else {
		comp.props.mapstatechange({
			connections : JSON.stringify(newcnxs)
		});
		localStorage.setItem('connections', JSON.stringify(newcnxs));
	}
	
	drawLines();
	
}

// DRAWING LINES

function drawLines(){
//	console.log("drawlines");
	clearLines();
	try{
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
	var cnx = storageToJSON();
	if(cnx){
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
	}

	} catch (err) {
		console.log("something's broken with draw lines");
	}
}

function clearLines(){
	try {
		const canvas = document.getElementById("canvas");
//		console.log(canvas);
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	} catch (err) {
		console.log("no canvas");
	}
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


function clearHistory(e, comp){
	if (window.confirm("Do you REALLY want to clear ALL your map connections? You can't get them back.")) {
		localStorage.setItem("connections", "[]");
		// use handler to reset map state "connections"
		comp.resetConnections();
//		comp.resetConnections();
		// remove connections
//		drawLines();
		window.location.reload();
	}
}


function placeSides(){
	console.log("placing sides");
	// 0-4, 5-7, 8-13, 14-15, 16-20, 21-22, 23-26, 27-28, 29, 30, 31
	var zoneportalkey = [0,5,8,14,16,21,23,27,29,30,31];
	var zoneportallengths = [5,3,6,2,5,2,4,2,1,1,1];
	var portals = document.getElementsByClassName("portal");
	var zones = document.getElementsByClassName("zone");
	var main_id = -1;
	var main_portals = [];
//	console.log(zones);
	for(var n=0; n<zones.length; n++){
		for(var m=0; m<zones[n].classList.length; m++){
//			console.log(zones[n].classList[m]);
			if(zones[n].classList[m] === "main"){
				main_id = Number(zones[n].dataset.id);
//				console.log(main_id);
				for(var l=0; l<zoneportallengths[main_id]; l++){
					var portalkey = Number(zoneportalkey[main_id])+l;
					for(var k=0; k<portals[portalkey].classList.length; k++){
//						console.log(portals[portalkey].classList[k]);
						if(portals[portalkey].classList[k] === "connected"){
							main_portals.push(portals[portalkey]);
						}
					}
				}
			}
		}
	}
//	console.log(main_portals);
//	console.log(portals);

	var cnx = storageToJSON();
	if(cnx){
		if(cnx.length>0){
			// cnx[i] is individual connections level
			for(var i=0; i<cnx.length; i++){
				// cnx[i][j] is each portal in a connection 
				for(var j=0; j<cnx[i].length; j++){
					// cnx[i][j][0] is the zone id for a portal
					// cnx[i][j][1] is the portal id for a portal
//						console.log(cnx[i][j]);
					for(var p=0; p<main_portals.length; p++){
						var pid = Number(main_portals[p].dataset.id);
						var zid = Number(main_portals[p].dataset.zoneid);
						var dir = Number(main_portals[p].dataset.dir);
						var classname = "side"+dir;
//							console.log(pid);
//							console.log(zid);
//							console.log(dir);
						if(cnx[i][j][0] === zid && cnx[i][j][1] === pid){
							if(j===0){
								// main portal is #1, target is #2
								zones[cnx[i][1][0]].classList.add(classname);
							} else if(j===1){
								// main portal is #2, target is #1
								zones[cnx[i][0][0]].classList.add(classname);
							}
						}
					}
				}
			}				
		}	
	}
}

// LISTENERS


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
