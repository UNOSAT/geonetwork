(function() {

  goog.provide('un-bgselector');

  var module = angular.module('un-bgselector', []);

  var bgLayers = [{
    "name": "Open Street Map",
    "layer": "osm"
  }, {
    "name": "Bing",
    "layer": "bing_aerial"
  }, {
    "name": "Relief Ombré",
    "layer": "wmts",
    "opts" : {
      "url": "http://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/WMTS/1.0.0/WMTSCapabilities.xml?REQUEST=GetCapabilities&service=WMTS",
      "name": "World_Shaded_Relief"
    }
  },{
    "name": "Aucun",
    "layer": "voidLayer"
  }];

  gn.backgroundlayerDirective = function() {
    return {
      restrict: 'E',
      scope: {
        'map': '=unBgSelectorMap'
      },
      templateUrl: '../../catalog/views/unosat/js/bgselector/' +
          'bgselector.html',
      controllerAs: 'ctrl',
      bindToController: true,
      controller: 'UnBgSelectorController'
    };
  };
  module.directive('unBgSelector', gn.backgroundlayerDirective);


  gn.BgSelectorController = function(gnMap, ngeoBackgroundLayerMgr) {

    this.isBackgroundSelectorClosed = true;
    this.backgroundLayerMgr_ = ngeoBackgroundLayerMgr;
    this.gnMap_ = gnMap;
    this.bgLayers = bgLayers;
    this.layerCache = {};

    this.setLayer(bgLayers[1]);

    var adminLimitLayer = gnMap.createOlWMS(this.map, {LAYERS: 'unosat:AFR_Admin0_P', STYLES: 'unosat:AFR_fond_carte'}, {
      url: 'http://geoportal.reseau-tchad.org/geoserver/wms?',
      label: "Limites administratives"
    });
    adminLimitLayer.set('no_gfi', true);
    this.map.addLayer(adminLimitLayer);
  };


  /**
   * Function called when the user selects a new background layer in the
   * dropdown. Called by the ng-click directive used in the partial.
   * @param {Object} layerSpec Layer specification object.
   * @export
   */
  gn.BgSelectorController.prototype.setLayer = function(layerSpec) {
    if(layerSpec == this.currentBgLayer) return;
    this.currentBgLayer = layerSpec;
    var layer;
    if(this.layerCache[layerSpec.name]) {
      layer = this.layerCache[layerSpec.name];
    }
    else {
      layer = this.createLayer_(layerSpec);
      this.layerCache[layerSpec.name] = layer;
    }
    this.backgroundLayerMgr_.set(this['map'], layer);
  };

  gn.BgSelectorController.prototype.activateBackgroundLayer = function(layerSpec) {
    if (this.isBackgroundSelectorClosed) {
      this.isBackgroundSelectorClosed = false;
    } else {
      this.isBackgroundSelectorClosed = true;
      this.setLayer(layerSpec);
    }
  };

  gn.BgSelectorController.prototype.toggleMenu = function() {
    if (this.isBackgroundSelectorClosed) {
      this.isBackgroundSelectorClosed = false;
    } else {
      this.isBackgroundSelectorClosed = true;
    }
  };

  /**
   * @param {string} layerName Layer name.
   * @return {ol.layer.Tile} The layer.
   * @private
   */
  gn.BgSelectorController.prototype.createLayer_ = function(layerSpec) {
    var layer;
    if(layerSpec.layer != 'voidLayer') {
      layer = this.gnMap_.createLayerForType(layerSpec.layer, layerSpec.opts, undefined, this.map);
    }
    else {
      layer = new ol.layer.Tile();
    }
    layer.set('bgType', layerSpec.layer);
    layer.displayInLayerManager = false;
    return layer;
  };

  gn.BgSelectorController.prototype.getClass = function(layer, index) {
    if (layer) {
      return 'ga-' + layer.layer +
          ' ' + ((!this.isBackgroundSelectorClosed) ?
          'ga-bg-layer-' + index : '');
    }
  };

  module.controller('UnBgSelectorController',
      gn.BgSelectorController);

  gn.BgSelectorController['$inject'] = [
    'gnMap',
    'ngeoBackgroundLayerMgr'
  ];

})();
