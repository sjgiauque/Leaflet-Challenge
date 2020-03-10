// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
// https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features)
});

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

// Define a markerSize function to set circle size based on magnitude
function radiusSize(magnitude) {
  return magnitude * 20000;
}

// Define circleColor function to set circle color based on magnitude 
function circlefillColor(magnitude) {
  if (magnitude < 1) {
    return "#ccff33"
  }
  else if (magnitude < 2) {
    return "#ffff33"
  }
  else if (magnitude < 3) {
    return "#ffcc33"
  }
  else if (magnitude < 4) {
    return "#ff9933"
  }
  else if (magnitude < 5) {
    return "#ff6633"
  }
  else {
    return "#ff3333"
  }
}

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function(earthquakeData, latlng) {
      return L.circle(latlng, {
        radius: radiusSize(earthquakeData.properties.mag),
        fillColor: circlefillColor(earthquakeData.properties.mag),
        color: "white",
        fillOpacity: 1,
      });
    },
    
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  
  // Define streetmap and darkmap and grayscale layers
  var grayscalemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Grayscalemap": grayscalemap,
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the grayscale and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.42, -122.08],
    zoom: 5,
    layers: [grayscalemap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


// Define legend color spectrum corresponding to circle colors by magnitude
function getColor(d) {
  return d > 5 ? "#ff3333" :
         d > 4  ? "#ff6633" :
         d > 3  ? "#ff9933" :
         d > 2  ? "#ffcc33" :
         d > 1  ? "#ffff33" :
                  "#ccff33" ;
}

// Create legend dimensions and criteria
var legend = L.control({ position: "bottomright" });
legend.onAdd = function(map) {
  var div = L.DomUtil.create("div", "info legend");
      mags = [0, 1, 2, 3, 4, 5];
      labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < mags.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(mags[i] + 1) + '"></i> ' +
        mags[i] + (mags[i + 1] ? '&ndash;' + mags[i + 1] + '<br>' : '+');
}

    return div;
}; 

// Add legend to map
legend.addTo(myMap);

};
