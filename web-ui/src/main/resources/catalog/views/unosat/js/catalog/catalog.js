(function() {

  goog.provide('un-catalog');

  var module = angular.module('un-catalog', []);
  module.constant('unCatalogUrl', '../../catalog/views/unosat/data/layers.json');
  module.value('ngeoLayertreeTemplateUrl',
    '../../catalog/views/unosat/js/catalog/layertrees.html');

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
  module.directive('unCatalog', gn.catalogDirective);

  var layerCache_ = {};
  gn.UnCatalogController = function($scope, $http, unCatalogUrl, gnMap) {

    this.gnMap_ = gnMap;
    $http.get(unCatalogUrl).then(function(catalog) {
      this.tree = catalog.data[0];

      // Apply text filter on the tree
      $scope.$watch(function() {
        return this.activeFilter;
      }.bind(this), function(filter) {
        if(angular.isDefined(filter)) {
          this.clearFilterNode_(this.tree);
          this.filterNode_(this.tree, filter);
        }
      }.bind(this));

    }.bind(this));
  };

  /**
   * Traverse tree and disable filter.
   * Mark all nodes as visible.
   * @param {TreeNode} node Node to traverse.
   * @private
   */
  gn.UnCatalogController.prototype.clearFilterNode_ = function(node) {
    delete node._matchFilter;
    if(node.children) {
      node.children.forEach(function(child) {
        this.clearFilterNode_(child);
      }.bind(this));
    }
  };

  /**
   * Filter a tree structure. Match filter text and `node.name` property.
   * All node that match are marked with `node._matchFilter = true`.
   * If a node match, then all children are visible.
   *
   * @param {TreeNode} node Node to traverse.
   * @param {string} text Filter text.
   * @returns {boolean}
   * @private
   */
  gn.UnCatalogController.prototype.filterNode_ = function(node, text) {
    var match = false;
    if(node.name && node.name.toLowerCase().indexOf(text.toLowerCase()) >= 0) {
      match = true;
    }
    else {
      if(node.children) {
        node.children.forEach(function(child) {
          match = (this.filterNode_(child, text) || match);
        }.bind(this));
      }
    }
    node._matchFilter = match;
    return match;
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

  gn.UnCatalogController.prototype.toggleNode = function(ctrl, evt) {
    if(ctrl.node.children && ctrl.depth > 1) {
      var el = $(evt.target);
      if(el.is('i')) {
        el = el.parent();
      }
      el.find('.fa').first().toggleClass('fa-minus-square')
        .toggleClass('fa-plus-square');
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
      {label: node.name, url: node.url, metadata: node.metadataUrl});

    this.gnMap_.addWmsFromScratch(this.map, node.url, node.layers, true).then(
      function(olLayer) {
        layer.setSource(olLayer.getSource());
        layer.setProperties(olLayer.getProperties());
      }, function() {
        layer.set('errors', ['not found']);
      });


    layer.set('cextent', node.cextent);
    layerCache_[layerCacheKey] = layer;
    return layer;
  };

  module.controller('UnCatalogController',
    gn.UnCatalogController);

  gn.UnCatalogController['$inject'] = [
    '$scope',
    '$http',
    'unCatalogUrl',
    'gnMap'
  ];

})();
