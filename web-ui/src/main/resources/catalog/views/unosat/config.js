var gn = {};

if(!goog) {
  var goog = {};
  goog.UID_PROPERTY_ = 'closure_uid_406936994';
  goog.uidCounter_ = 0;
  goog.getUid = function(obj) {
    return obj[goog.UID_PROPERTY_] ||
        (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
  };
}

(function() {

  goog.provide('gn_search_unosat_config');
  window.gn = {};
  var module = angular.module('gn_search_unosat_config', []);

  module
      .run([
        'gnSearchSettings',
        'gnViewerSettings',
        'gnOwsContextService',
        'gnMap',
        function(searchSettings, viewerSettings, gnOwsContextService, gnMap) {
          // Load the context defined in the configuration
          viewerSettings.defaultContext =
            viewerSettings.mapConfig.viewerMap ||
            '../../map/config-viewer.xml';

          // Keep one layer in the background
          // while the context is not yet loaded.
          viewerSettings.bgLayers = [];

          viewerSettings.servicesUrl = {
            wms: [{
              name: 'ResEau Geoportal',
              url: 'http://http://geoportal.reseau-tchad.org/geoserver/wms?'
            }],

            wmts: [{
              name: 'Arcgisonline - Relief ombré',
              url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?REQUEST=GetCapabilities&service=WMTS'
            }, {
              name: 'Arcgisonline - World Imagery',
              url: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?REQUEST=GetCapabilities&service=WMTS'
            }]
          };

          var bboxStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgba(255,0,0,1)',
              width: 2
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255,0,0,0.3)'
            })
          });
          searchSettings.olStyles = {
            drawBbox: bboxStyle,
            mdExtent: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'orange',
                width: 2
              })
            }),
            mdExtentHighlight: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'orange',
                width: 3
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255,255,0,0.3)'
              })
            })
          };

          var mapsConfig = {
            center: [280274.03240585705, 6053178.654789996],
            zoom: 2,
            maxResolution: 9783.93962050256
          };

          var viewerMap = new ol.Map({
            controls: [],
            view: new ol.View(mapsConfig)
          });

          viewerSettings.singleTileWMS = true;



          // Set custom config in gnSearchSettings
          angular.extend(searchSettings, {
            viewerMap: viewerMap
          });

          viewerSettings.contexts = ['france', 'italy', 'gb'];
        }]);
})();
