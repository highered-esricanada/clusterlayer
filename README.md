# ClusterLayer

A custom layer that uses the [supercluster](https://github.com/mapbox/supercluster) library to perform
fast clustering of point datasets, designed for the ArcGIS API for JavaScript 4.6.

## Description

**Caution**: ***This is experimental...***

The ClusterLayer module is implemented as a subclass of the [FeatureLayer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html) class in the ArcGIS API for JavaScript.  It uses a worker in the background that loads the [supercluster](https://github.com/mapbox/supercluster) library and generates an index of point features that is used to supply the point features representing clusters, which are drawn as graphics in a map view for a particular zoom/extent.

You can instantiate a ClusterLayer using the same constructor options as a standard FeatureLayer.

If you specify a URL to a FeatureServer, then it will load all features, then generate the clusters.  You can use a definitionExpression to limit features to match a specific query.  You can also modify the definitionExpression and
the source data will be queried again for all matching features and clusters will be updated.

If you have client-side graphics, then you can instantiate the ClusterLayer the same way you would do for a regular [FeatureLayer using client-side graphics](https://developers.arcgis.com/javascript/latest/sample-code/layers-featurelayer-collection/index.html)

If you have a URL to a static file that contains a) a GeoJSON feature collection or array of GeoJSON point features, b) a file containing a JSON representation of a [FeatureSet](https://developers.arcgis.com/documentation/common-data-types/featureset-object.htm) or an array of [Feature](https://developers.arcgis.com/documentation/common-data-types/feature-object.htm) objects, or c) a simple JavaScript array of arrays, each containing longitude/latitude coordinate pairs, then you can instantiate the ClusterLayer with a URL to the file, but you will need to provide extra constructor options that indicate that the URL is meant to be loaded by the supercluster worker script (i.e., in the background), and an additional parameter that specifies the data type.

The renderer and popup for the cluster graphics on the map, and the behaviour of the supercluster module that runs in the background worker can be controlled by supplying an extra 'supercluster' object in the constructor options for the ClusterLayer class.

## Demos:

- [Points loaded directly from a feature layer](https://esricanada-ce.github.io/clusterlayer/demo/featurelayer.html) (using crime data from the Toronto Police data portal)
- [10k random points FeatureSet loaded as local FeatureLayer graphics](https://esricanada-ce.github.io/clusterlayer/demo/featureset10k.html) (using crime data from the Toronto Police data portal)
- [50k random points FeatureSet loaded as local FeatureLayer graphics](https://esricanada-ce.github.io/clusterlayer/demo/featureset50k.html) (using crime data from the Toronto Police data portal)
- [50k random points FeatureSet loaded in the background](https://esricanada-ce.github.io/clusterlayer/demo/featureset50kdirect.html) (using crime data from the Toronto Police data portal)
- [1 million random coordinates loaded in the background](https://esricanada-ce.github.io/clusterlayer/demo/coords1mil.html) (using crime data from the Toronto Police data portal) ***40mb!!! Takes 10-30s to index in the background***

# Using the ClusterLayer module:

Add the module to your dojoConfig, and require it where appropriate in your app's code:

```html

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
  <title>ClusterLayer Demo</title>
  <style>
    html,
    body,
    #viewDiv {
      padding: 0;
      margin: 0;
      height: 100%;
      width: 100%;
    }
  </style>
  
  <script>
      var dojoConfig = {
        packages: [{
          name: 'lib',
          location: location.pathname.replace(/\/[^/]+$/, '/') + '../../src'
        }]
      };
  </script>

  <link rel="stylesheet" href="https://js.arcgis.com/4.6/esri/css/main.css">
  <script src="https://js.arcgis.com/4.6/"></script>

  <script>
  
    require([
      "esri/Map",
      "esri/views/MapView",
      "lib/ClusterLayer",
      "dojo/domReady!"
    ], function(Map, MapView, ClusterLayer) {

      var map = new Map({
        basemap: "topo"
      });

      var view = new MapView({
        container: "viewDiv",
        map: map,
        zoom: 5,
        center: [-79.328942, 43.73061]
      });
      
      var clusterlayer = window.cl = new ClusterLayer({
        url: "https://hostname/arcgis/rest/services/example/FeatureServer/0",
        supercluster: {labelsVisible: true}
      });

      map.add(clusterlayer);

    });
    
  </script>
</head>

<body>
  <div id="viewDiv"></div>
</body>
</html>
    
```

# ClusterLayer constructor options:

```js
var clusterlayer = new ClusterLayer({

  // URL to a point feature layer on a FeatureServer, or 
  // a JSON data file...
  url: "http://hostname/sampledata.json",
  
  // Any other standard FeatureLayer constructor options.
  ...,
  
  // Optional: specify outFields for any fields you expect
  // to use in custom initial/map/reduce methods (discussed 
  // below) - be selective to reduce the size of data 
  // downloaded.  This only applies when the ClusterLayer is
  // instantiated with the URL to a FeatureServer layer
  outFields: ["objectid"],
  
  // Optional: set this true if URL above is a JSON data 
  // file - the URL will be passed to the background worker.
  direct_url: true, 
  
  // Optional: parse JSON data as Esri JSON, GeoJSON, or 
  // simple coordinates by setting this equal to 
  // "esri", "geojson", or "coords"
  direct_type: "esri",
  
  supercluster: {
    // An optional URL to a JavaScript file that defines custom 
    // initial/map/reduce methods for the supercluster module
    functions: "path/to/clusterFunctions.js",
    
    // An optional JSON representation or instance of an
    // ArcGIS JavaScript API Renderer object...
    renderer: { ... },
    
    // An optional JSON representation or instance of an
    // ArcGIS JavaScript API PopupTemplate object
    popupTemplate: { ... },
    
    // An optional list of JSON representations or instances 
    // of ArcGIS JavaScript API Field objects - these should 
    // match any extra properties added to clusters if you 
    // supply custom initial/map/reduce methods (see the 
    // functions option above).
    fields: [{...}, ...],
    
    // If true, a secondary Graphics layer is added to serve 
    // as the labels for the cluster graphics, using points 
    // with TextSymbols (since labeling isn't yet implemented 
    // for 2D feature layers in the JavaScript 4.6 API)
    labelsVisible: true,
    
    // If labelsVisible is true, then this is the field 
    // used for the label text,
    labelField: "fieldname",
    
    // An optional method to format values for use as labels,
    labelFormatter: function(v){ return v; },
    
    // An optional JSON representation or instance of a 
    // [TextSymbol]() object that will be used for labels,
    labelSymbol: { ... },
    
    // Any other parameters respected by supercluster, 
    // ***EXCEPT*** for initial/map/reduce functions 
    // (which must be defined in a separate script that 
    // may be loaded by the worker module - see the 
    // 'functions' option above)
    ...
  }
});
```

## Notes

- If the same instance of a ClusterLayer is displayed in multiple map views, it will only listen to the zoom/extent for the first map view that it is added to.
- There are some issues with popups that are open when you pan/zoom the map (maybe)
- Will work in a 3D SceneView, but isn't tested for it, and would (at least) require different renderer configuration

## Building from source

If you want to build the source, you can clone this repository, then run the following commands from inside the directory (requires [NodeJS](https://nodejs.org/en/)):

```sh
npm install       # install dependencies
npm run build     # generate dist/ClusterLayer.js and dist/ClusterWorker.js
```
