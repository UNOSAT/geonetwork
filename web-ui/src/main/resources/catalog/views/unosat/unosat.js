(function() {

  goog.provide('gn_search_unosat');

  goog.require('gn_legendpanel_directive');
  goog.require('gn_search');
  goog.require('gn_search_unosat_config');
  goog.require('un-bgselector');
  goog.require('un-catalog');
  goog.require('un-contexts');
  goog.require('un-layerinfo');
  goog.require('un-layermanager');
  goog.require('un-search');
  goog.require('un-mouseposition');
  goog.require('un-scaleselector');

  var module = angular.module('gn_search_unosat', [
    'gn_search',
    'gn_search_unosat_config',
    'un-bgselector',
    'un-search',
    'un-layermanager',
    'un-catalog',
    'un-contexts',
    'un-layerinfo',
    'un-mouseposition',
    'un-scaleselector',
    'gn_legendpanel_directive'
  ]);

  module.constant('defaultExtent', [604168.9251648698, 827653.5815669585, 3495323.0830233768, 2750197.7169957114]);

  proj4.defs('EPSG:32633', '+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
  proj4.defs('EPSG:32634', '+proj=utm +zone=34 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');

  gn.MainController = function($scope, gnSearchSettings, defaultExtent,
                               gnMeasure, ngeoSyncArrays, unLayerInfoService,
                               unLayerState) {

    this.searchSettings_ = gnSearchSettings;
    this.defaultExtent_ = defaultExtent;
    this.map = null;
    this.setMap_();
    this.measureObj = {};
    this.legendOpen = false;
    this.drawVector;
    this.unLayerState = unLayerState;
    var $this = this;

    this['selectedLayers'] = [];
    this.manageSelectedLayers_($scope, ngeoSyncArrays);

/*
    this.map.addControl(new ol.control.MousePosition({
      target: document.querySelector('footer')
    }));
*/
    this.map.addControl(new ol.control.ScaleLine({
      target: document.querySelector('footer')
    }));

    this.mInteraction = gnMeasure.create(this.map,
        this.measureObj, $scope);

    $scope.$watch('mainCtrl.drawOpen', function() {
      if($scope.mainCtrl.drawVector) {
        $scope.mainCtrl.drawVector.inmap = !$scope.mainCtrl.drawVector.inmap;
      }
    });

    unLayerInfoService.getAllMetadatas();
  };

  /**
   * @private
   */
  gn.MainController.prototype.setMap_ = function() {

    this.map = new ol.Map({
      view: new ol.View({
        center: [2081543.807860756, 1688640.2681711826],
        zoom: 6
      }),
      controls: [
        new ol.control.Zoom(),
        new ol.control.ZoomToExtent({
          extent: this.defaultExtent_,
          tipLabel: 'Full extent',
          className: 'un-zoom-extent',
          label:$(
              '<span class="fa fa-globe"></span>')}),

        new ol.control.FullScreen({
          tipLabel: 'Full screen',
          className: 'un-full-screen',
          label:$(
            '<span class="fa fa-arrows-alt"></span>')})
      ]
    });

    map = this.map;
  };

  gn.MainController.prototype.manageSelectedLayers_ =
      function(scope, ngeoSyncArrays) {
        var map = this.map;
        ngeoSyncArrays(map.getLayers().getArray(),
            this['selectedLayers'], true, scope,
            function(layer) {
              return layer.displayInLayerManager;
            }
        );

/*
        scope.$watchCollection('mainCtrl.selectedLayers, goog.bind(function() {
          this.map_.render();
        }, this));
*/

      };

  gn.MainController.prototype.closeSidebar = function() {
    this.layersOpen = false;
    this.contextOpen = false;
    this.printOpen = false;
    this.drawOpen = false;
    this.importOpen = false;
  };
  gn.MainController.prototype.closeInfopanel = function() {
    this.unLayerState.md = undefined;
    this.legendOpen = false;
  };

  gn.MainController.prototype.sidebarOpen = function() {
    return this.layersOpen || this.contextOpen || this.printOpen ||
        this.drawOpen || this.importOpen;
  };

  gn.MainController.prototype.infopanelOpen = function() {
    return this.unLayerState.md || this.legendOpen;
  };

  gn.MainController.prototype.showTab = function(selector) {
    $(selector).tab('show');
  };

  module.controller('MainController', gn.MainController);
  gn.MainController['$inject'] = [
    '$scope',
    'gnSearchSettings',
    'defaultExtent',
    'gnMeasure',
    'ngeoSyncArrays',
    'unLayerInfoService',
    'unLayerState'
  ];
})();
