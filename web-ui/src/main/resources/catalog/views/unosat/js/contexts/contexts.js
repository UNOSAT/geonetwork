(function() {

  goog.provide('un-contexts');

  var module = angular.module('un-contexts', []);

  gn.catalogDirective = function() {
    return {
      restrict: 'E',
      scope: {
        'map': '=unCatalogMap'
      },
      controller: 'UnCatalogController',
      controllerAs: 'catalogCtrl',
      bindToController: true,
      template: '<div ngeo-layertree="catalogCtrl.tree" ' +
          'ngeo-layertree-map="catalogCtrl.map" ' +
          'ngeo-layertree-nodelayer="catalogCtrl.getLayer(node)" ' +
          'class="themes-switcher collapse in"></div>'
    };
  };
  module.directive('unContexts', gn.catalogDirective);

  var layerCache_ = {};
  gn.UnCatalogController = function($http, unCatalogUrl, gnMap) {

    var $this = this;
    this.gnMap_ = gnMap;
    $http.get(unCatalogUrl).then(function(catalog) {
      $this.tree = catalog.data[0];
    });
  };

  gn.UnCatalogController.prototype.toggle = function(node) {
    var layer = this.getLayer(node);
    var map = this['map'];
    if (map.getLayers().getArray().indexOf(layer) >= 0) {
      map.removeLayer(layer);
    } else {
      map.addLayer(layer);
    }
  };
  gn.UnCatalogController.prototype.getLayer = function(node) {
    var layer, layerCacheKey, type;
    if (!('type' in node)) {
      return null;
    }
    type = node['type'];
    layerCacheKey = type + '_' + node['name'];
    if (layerCacheKey in layerCache_) {
      return layerCache_[layerCacheKey];
    }

    var layer = this.gnMap_.createOlWMS(this.map,
        {'LAYERS': node.layers},
        {label: node.name, url: node.url});

    layerCache_[layerCacheKey] = layer;
    return layer;
  };

  module.controller('UnCatalogController',
      gn.UnCatalogController);

  gn.UnCatalogController['$inject'] = [
    '$http',
    'unCatalogUrl',
    'gnMap'
  ];

})();
