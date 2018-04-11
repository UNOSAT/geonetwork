goog.provide('app.profile.drawLineComponent');


var module = angular.module('app.profile.drawLineComponent', [
]);


/**
 * Simple directive that can be put on any element. The directive listen on
 * clicks events to allow/disallow to draw one line (and only one) on the
 * map. Typically used to draw the line that will serve the app.Profile.
 *
 * Example:
 *
 *      <app-drawprofileline
 *        app-drawprofileline-active="mainCtrl.drawProfileActive"
 *        app-drawprofileline-map="mainCtrl.map"
 *        app-drawprofileline-line="mainCtrl.line"
 *      </app-drawprofileline>
 *
 *
 * @htmlAttribute {ol.Map} app-drawprofileline-map The map.
 * @htmlAttribute {ol.geom.LineString} app-drawprofileline-line The variable to
 *     connect with the drawed line.
 * @htmlAttribute {boolean=} app-drawprofileline-active Active the component.
 * @htmlAttribute {ol.style.Style=} app-drawprofileline-style Optional style
 *     for the drawed line.
 * @return {angular.Directive} Directive Definition Object.
 * @ngdoc directive
 * @ngname appDrawprofileline
 */
var directive = function() {
  return {
    scope: true,
    controller: 'AppDrawprofilelineController as ctrl',
    restrict: 'A',
    bindToController: {
      'getMapFn': '&appDrawprofilelineMap',
      'line': '=appDrawprofilelineLine',
      'active': '=appDrawprofilelineActive',
      'getStyleFn': '&?appDrawprofilelineStyle'
    }
  };
};


module.directive('appDrawprofileline', directive);

/**
 * @param {!angular.Scope} $scope Scope.
 * @param {!angular.JQLite} $element Element.
 * @param {!angular.$timeout} $timeout Angular timeout service.
 * @param {!ngeo.map.FeatureOverlayMgr} ngeoFeatureOverlayMgr Feature overlay
 *     manager.
 * @constructor
 * @private
 * @ngInject
 * @ngdoc controller
 * @ngname appDrawprofilelineController
 */
var controller = function($scope, $element, $timeout,
  ngeoFeatureOverlayMgr, ngeoDecorateInteraction) {

  /**
   * @type {?ol.geom.LineString}
   * @export
   */
  this.line;

  /**
   * @type {?ol.Map}
   * @private
   */
  this.map_ = null;


  /**
   * @type {boolean}
   * @export
   */
  this.active;

  /**
   * @type {!ol.Collection}
   * @private
   */
  this.features_ = new ol.Collection();

  var overlay = ngeoFeatureOverlayMgr.getFeatureOverlay();
  overlay.setFeatures(this.features_);

  var style;
  var styleFn = this['getStyleFn'];
  if (styleFn) {
    style = styleFn();
    goog.asserts.assertInstanceof(style, ol.style.Style);
  } else {
    style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 2
      })
    });
  }
  overlay.setStyle(style);

  /**
   * @type {!ol.interaction.Draw}
   * @export
   */
  this.interaction = new ol.interaction.Draw({
    type: /** @type {ol.geom.GeometryType} */ ('LineString'),
    features: this.features_
  });

  ngeoDecorateInteraction(this.interaction);

  // Clear the line as soon as the interaction is activated.
  this.interaction.on('change:active', function() {
    if (this.interaction.getActive()) {
      this.clear_();
    }
  }.bind(this));

  // Update the profile with the new geometry.
  this.interaction.on('drawend', function(event) {
    this.line = event.feature.getGeometry();
    // using timeout to prevent double click to zoom the map
    $timeout(function() {
      this.interaction.setActive(false);
    }.bind(this), 0);
  }.bind(this));

  // Line may be removed from an other component
  // for example closing the chart panel
  $scope.$watch(
    function() {return this.line}.bind(this),
    function(newLine, oldLine) {
      if (newLine === null) {
        this.clear_();
      }
    }.bind(this));

  $scope.$watch(
    function() {return this.active},
    function(newValue) {
      if (newValue === false) {
        this.clear_();
      }
      // Will activate the interaction automatically the first time
      this.interaction.setActive(this.active);
    }.bind(this)
  );
};


/**
 * Initialise the controller.
 */
controller.prototype.$onInit = function() {
  var map = this['getMapFn']();
  goog.asserts.assertInstanceof(map, ol.Map);
  this.map_ = map;
  this.map_.addInteraction(this.interaction);
};


/**
 * Clear the overlay and profile line.
 * @private
 */
controller.prototype.clear_ = function() {
  this.features_.clear();
  this.line = null;
};

controller['$inject'] = [
  '$scope', '$element', '$timeout', 'ngeoFeatureOverlayMgr',
  'ngeoDecorateInteraction'
];

module.controller('AppDrawprofilelineController',
  controller);

