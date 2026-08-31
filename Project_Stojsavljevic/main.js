let initialZoomLevel = 7;
let initialCenter = [1801056.1928057887, 5585223.095425637]; // zoom level

var vectorSource = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
  url: 'http://localhost:8080/geoserver/ne/ows?service=WFS&' +
       'version=1.0.0&request=GetFeature&typeName=ne%3APeriske_2024&' +
       'outputFormat=application%2Fjson&maxFeatures=50&srsName=EPSG:3857',
  strategy: ol.loadingstrategy.all
}); // conection to the vector layer, conection on the GeoServer

var clusterSource = new ol.source.Cluster({
        distance: 20,
        source: vectorSource
      }); // clustering 

var vector = new ol.layer.Vector({
source: clusterSource,
style: function (feature) {
  var size = feature.get('features').length;
  
  if (size === 1) {
    return new ol.style.Style({
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
        color: 'rgba(0, 0, 255, 0.8)'
        }),
        stroke: new ol.style.Stroke({
        color: 'rgba(0, 0, 255, 1.0)',
        width: 2
        })
      })
    }); 
  } else {
    return new ol.style.Style({
        image: new ol.style.Circle({
            radius: 20,
            fill: new ol.style.Fill({
                color:'rgba(0, 0, 225, 0.8)' 
            }),
            stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 255, 1.0)',
            width: 2  
            })
        }),
    
              text: new ol.style.Text({
                text: size.toString(),
                fill: new ol.style.Fill({
                  color: '#fff'
                })
              })
            });
        }
    }
}); // conecting the vector to clusters, which means we are creating the spetial computation of the vector layer

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer'); // elements of pop-ups

var overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: { duration: 250 }
}); // overlay to anchor the pop-up on map

closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
}; // click function

let mapObjectInput = { // ol.Map create object from class map, constractor
        layers: [ // array
          new ol.layer.Tile({
            source: new ol.source.OSM()
        }),
        new ol.layer.Tile({
         // extent: [-180,-83.22690927523922,180,-64.57068368922714],
            source: new ol.source.TileWMS({
            url: 'http://localhost:8080/geoserver/appdevcourse/wms',
            params: {'LAYERS':'appdevcourse:NE1_HR_LC_SR_W_DR', 'TILED': true}, // WMS layer
            serverType: 'geoserver',
            // Countries have transparency, so do not fade tiles:
            transition: 0
        })
        }),
        
        vector // vector layer
   
        ],

        overlays: [overlay],
        target: 'map', // string
        view: new ol.View({
          center: [1801056.1928057887, 5585223.095425637], // array
          zoom: initialZoomLevel // number
        }) // target map and view properties
     };


 var map = new ol.Map(mapObjectInput); // map where everything is showing
    
map.on('singleclick', function (evt) {
  var feature = map.forEachFeatureAtPixel(evt.pixel, function (f) {
    return f;
  });

  if (!feature) {
    overlay.setPosition(undefined);
  } else {
    var clusterMembers = feature.get('features');
    
    if (clusterMembers.length === 1) {
      var props = clusterMembers[0].getProperties();
      content.innerHTML = '<p>' + props.dat_opaza + '</p>';
	  content.innerHTML += '<p>' + props.opazac + '</p>';
	  content.innerHTML += '<p>' + props.lokalitet + '</p>';
	  content.innerHTML += '<p>' + props.br_jedinki + '</p>';
      overlay.setPosition(evt.coordinate);
    } else {
      overlay.setPosition(undefined);
    }
  }
}); // click hendler part where we are saying that when we click on the dot of the WFS layer we want to see the data in var props part of the code

 document.getElementById('zoom-out').onclick = function() {
        var view = map.getView();
        var zoom = view.getZoom();
        view.setZoom(zoom - 1);
      }; // zoom- out button interactivitie code

document.getElementById('zoom-in').onclick = function() {
        var view = map.getView();
        var zoom = view.getZoom();
        view.setZoom(zoom + 1);
      }; // zoom- in button interactivitie code


document.getElementById('reset').onclick = function() {
        var view = map.getView();
        view.animate({zoom: initialZoomLevel, center: initialCenter});
 }; // reset button interactivitie code

document.getElementById('right').onclick = function() {
        var view = map.getView();
        var currentCenter = view.getCenter();
        view.animate({center: [currentCenter[0] + 100000, currentCenter[1]]});
 }; // right button interactivitie code

 document.getElementById('left').onclick = function() {
        var view = map.getView();
        var currentCenter = view.getCenter();
        view.animate({center: [currentCenter[0] - 100000, currentCenter[1]]});
 }; // left button interactivitie code

 document.getElementById('up').onclick = function() {
        var view = map.getView();
        var currentCenter = view.getCenter();
        view.animate({center: [currentCenter[0], currentCenter[1] + 100000]});
 };// up button interactivitie code

 document.getElementById('down').onclick = function() {
        var view = map.getView();
        var currentCenter = view.getCenter();
        view.animate({center: [currentCenter[0], currentCenter[1] - 100000]});
 }; // down button interactivitie code

 map.on('click', function(e) {
    console.log(e);
 });

 const options = {
  enableHighAccuracy: true, // usage of GPS percise location
  timeout: 10000, // stop after 10 seconds of running the function
  maximumAge: 0, // always provide fresh location
};

function success(pos) { // for every sucesful implementation return corrdinates
  const crd = pos.coords;
  
  var coords = ol.proj.fromLonLat([crd.longitude, crd.latitude]); // creating the map coordinates
  map.getView().animate({ center: coords, zoom: 14 }); // centering the map on location
}

function error(err) { // if there is an error provide a massage
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

document.getElementById("location").onclick = function() { //get location when location button is clicked
  navigator.geolocation.getCurrentPosition(success, error, options);
};
 