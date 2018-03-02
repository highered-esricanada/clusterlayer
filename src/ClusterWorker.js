'use strict';

var index;
var features = [];
var defaultopts = {
  log: false,
  radius: 60,
  extent: 256,
  maxZoom: 23,
  minZoom: 0,
  nodeSize: 64,

  /* Initialize cluster properties... */
  initial: function(props) { 
    return { /* total: 0, ... */ }; 
  },
  
  /* map properties for each point */
  map: function(props) {
    
    // Initializing these properties ensures all points
    // Returned by the cluster index have a value of
    // at least 1 (i.e., a single-point cluster).  If
    // you override the map function, include these lines
    // in your method if you intend to rely on the
    // point_count & point_count_abbreviated properties...
    props.point_count = 1;
    props.point_count_abbreviated = "1";
    
    // props.value = ...;
    
    return props;
  },
  
  /* aggregate properties of a cluster */
  reduce: function(accumulated, props) {
    // accumulated.total += props.value
  }
}

self.onmessage = function (e) {
  if (e.data.supercluster) {
      importScripts(e.data.supercluster);
      postMessage({superclusterReady: true});
  }
  
  else if (e.data && e.data.bbox && e.data.zoom) {
    postMessage(self.index.getClusters(e.data.bbox, e.data.zoom));
  }
  
  else if (e.data.opts)
  {
    var opts = {};
    for (var opt in defaultopts) opts[opt] = defaultopts[opt];
    for (var opt in e.data.opts) opts[opt] = e.data.opts[opt];
    
    // If the opts include a URL to a cluster functions script, it is
    // expected that the script will defines a 'functions' object
    // that has initial, map, and/or reduce functions specified that
    // will be used in place of the default methods defined in 
    // the defaultopts above.
    if (opts.functions)
    {
      importScripts(opts.functions);
      if (functions.initial) opts.initial = functions.initial;
      if (functions.map) opts.map = functions.map;
      if (functions.reduce) opts.reduce = functions.reduce;
    }
    
    index = supercluster(opts);
  }
  
  else if (e.data.clear)
  {
    features = [];
    loadFeatures();
  }
  
  else if (e.data.features) {
    addFeatures(e.data.features, e.data.type);
    if (e.data.load) loadFeatures();
  }
  
  else if (e.data.url)
  {
    getJSON(e.data.url, function (data) {
      addFeatures(data, e.data.type || "geojson");
      loadFeatures();
    });
  }
};

// If supercluster is not loaded already (i.e., minified/packed into the same file), then 
// send a message indicating the worker is ready - the ClusterLayer module will respond
// with the URL to script for the supercluster module from (this happens when running from 
// uncompiled source).  Otherwise, a message is posted to indicate that the supercluster
// module is ready.
if (!self.supercluster) { postMessage({workerReady: true}); }
else { postMessage({superclusterReady: true}); }

function loadFeatures()
{
  if (!index) return;
  index.load(features);
  postMessage({indexReady: true});
}

function addFeatures(features, type)
{
  if (type=="esri") self.features = self.features.concat((features.features || features).filter(function(g) { return validGeom(g,type); }).map(esriToGeoJSON));
  else if (type=="coords") self.features = self.features.concat(features.filter(function(g) { return validGeom(g,type); }).map(coordToGeoJSON));
  else self.features = self.features.concat((features.features || features).filter(function(g) { return validGeom(g,type); }));
}

function validGeom(geom, type){
  if (geom) {
    if (type=="coords") return (geom.length >= 2 && geom[0] && geom[1]);
    if (type=="esri") return (geom.geometry && geom.geometry.x && geom.geometry.y);
    else return (geom && geom.geometry && geom.geometry.coordinates && geom.geometry.coordinates.length >=2 && geom.geometry.coordinates[0] && geom.geometry.coordinates[1]);
  }
  return false;
}

// Convert Esri JSON Point feature to GeoJSON features that are usable with
// the supercluster module:
function esriToGeoJSON(feature){
  try {
    var g = {
      type:"Feature",
      geometry:{
        type:"Point",
        coordinates: [feature.geometry.x, feature.geometry.y]
      },
      properties: feature.attributes
    };
    g.properties.point_count = 1;
    g.properties.point_count_abbreviated = "1";
    return g;
  } catch (e) {
    console.log('Error converting feature to GeoJSON:', feature, e);
  }
}

// Convert a simple array of lon/lat coordinate pairs to GeoJSON features
// that are usable with the supercluster module:
function coordToGeoJSON(xy, index){
  try {
    return {
      type:"Feature",
      geometry:{
        type:"Point",
        coordinates: xy
      },
      properties: {objectid: index+1, point_count: 1, point_count_abbreviated: "1"}
    };
  } catch (e) {
    console.log('Error converting feature to GeoJSON:', feature, e);
  }
}

function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            callback(xhr.response);
        }
    };
    xhr.send();
}