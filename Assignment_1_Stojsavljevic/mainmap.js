let initialZoomLevel = 10;
let initialCenter = [1588911.734653, 6026906.806230];

let mapObjectInput = {
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        target: 'map',
        view: new ol.View({
          center: initialCenter,
          zoom: initialZoomLevel
        })
      };

var map = new ol.Map(mapObjectInput);

var measureSource = new ol.source.Vector(); // line style
var measureLayer = new ol.layer.Vector({
  source: measureSource,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#29f737',
      width: 2,
      line: [8, 8]
    }),
    image: new ol.style.Circle({ //point style
      radius: 5,
      fill: new ol.style.Fill({ color: '#0c0c0c' })
    })
  })
});
map.addLayer(measureLayer);

document.getElementById('zoom-out').onclick = function() {
    var view = map.getView();
    var zoom = view.getZoom();
    view.setZoom(zoom - 1);
};

document.getElementById('zoom-in').onclick = function() {
    var view = map.getView();
    var zoom = view.getZoom();
    view.setZoom(zoom + 1);
};

document.getElementById('reset').onclick = function() {
    var view = map.getView();
    view.animate({zoom: initialZoomLevel}, {center: initialCenter});
};

document.getElementById('left').onclick = function() {
    var view = map.getView();
    var currentCenter = view.getCenter();
    view.animate({center: [currentCenter[0] - 100000, currentCenter[1]]});
};

document.getElementById('right').onclick = function() {
    var view = map.getView();
    var currentCenter = view.getCenter();
    view.animate({center: [currentCenter[0] + 100000, currentCenter[1]]});
};

document.getElementById('up').onclick = function() {
    var view = map.getView();
    var currentCenter = view.getCenter();
    view.animate({center: [currentCenter[0], currentCenter[1] + 100000]});
};

document.getElementById('down').onclick = function() {
    var view = map.getView();
    var currentCenter = view.getCenter();
    view.animate({center: [currentCenter[0], currentCenter[1] - 100000]});
};

let measuring = false; // starting the measuremant
let points = [];

map.on("click", function(event) { // setting up event, on click
  if (!measuring) return;

  points.push(event.coordinate);
  measureSource.clear();

  if (points.length === 1) {  // when putting first point, return that point
    var pointFeature = new ol.Feature(new ol.geom.Point(points[0]));
    measureSource.addFeature(pointFeature);
  }

  if (points.length === 2) { // when putting second point, create also a line bettwen points
    var lineFeature = new ol.Feature(new ol.geom.LineString(points));
    measureSource.addFeature(lineFeature);

    points.forEach(function(p) {
      measureSource.addFeature(new ol.Feature(new ol.geom.Point(p)));
    });

    var distance = calculateDistance(points[0], points[1]); // calculation of distance bettwen points
    var midpoint = [
      (points[0][0] + points[1][0]) / 2,
      (points[0][1] + points[1][1]) / 2
    ];

    var labelFeature = new ol.Feature(new ol.geom.Point(midpoint)); // setting the lable for distance number
    labelFeature.setStyle(new ol.style.Style({
      text: new ol.style.Text({
        text: distance.toFixed(2) + ' km',
        font: 'bold 14px sans-serif',
        fill: new ol.style.Fill({ color: '#000' }),
        stroke: new ol.style.Stroke({ color: '#fff', width: 3 }),
        offsetY: -15
      })
    }));
    measureSource.addFeature(labelFeature);

    measuring = false;
    points = []; // stoping the measuring and reseting of the points
  }
});
// getting the element, when click on button give this text and start the command (measuring)
document.getElementById("distance").onclick = function() {
  measuring = true;
  points = [];
  measureSource.clear(); 
  document.getElementById("status").textContent = "Click two points on the map (anywhere you want)." + "Click back on distance button to reset.";
};
// Haversine formula- for calculating distance between two points on sphere using the lat and lng
function calculateDistance(coord1, coord2) {
  const [lon1, lat1] = ol.proj.toLonLat(coord1);
  const [lon2, lat2] = ol.proj.toLonLat(coord2);

  const R = 6371; // Earth radius
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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