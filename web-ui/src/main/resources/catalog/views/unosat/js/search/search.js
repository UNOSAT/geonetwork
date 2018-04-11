(function() {

  goog.provide('un-search');
  var module = angular.module('un-search', []);

  gn.searchDirective  = function() {
    return {
      restrict: 'E',
      scope: {
        'map': '=unSearchMap'
      },
      controller: 'UnSearchController',
      bindToController: true,
      controllerAs: 'ctrl',
      templateUrl: '../../catalog/views/unosat/js/search/' +
      'search.html',
      link: function(scope, element, attrs) {

        // If no clear button
        // element.find('input').on('focus', function() {
        //   $(this).val('');
        //   $(this).addClass('placeholder-text');
        // });
        element.find('span.clear-button').on('click',
          function() {
            $(element).find('input').val('').trigger('input');
            scope.ctrl.featureOverlay_.clear();
          });

        element.find('input').on(
          'input propertyChange focus blur', function() {
            var clearButton =
              $(this).parents('.form-group').find('span.clear-button');
            if ($(this).val() === '') {
              clearButton.css('display', 'none');
            } else {
              clearButton.css('display', 'block');
            }
          });
      }
    };
  };
  module.directive('unSearch', gn.searchDirective);


  gn.SearchController = function($rootScope, $compile, ngeoAutoProjection, ngeoFeatureOverlayMgr,
                                 ngeoCreateGeoJSONBloodhound, gnUrlUtils, $translate) {

    this.gnUrlUtils_ = gnUrlUtils;
    this.$translate = $translate;
    this.$rootScope = $rootScope;
    this.$compile = $compile;
    this.ngeoAutoProjection_ = ngeoAutoProjection;
    this.ngeoCreateGeoJSONBloodhound = ngeoCreateGeoJSONBloodhound;
    this.featureOverlay_ = ngeoFeatureOverlayMgr.getFeatureOverlay();
    this.featureOverlay_.setStyle(new ol.style.Style({
      image: new ol.style.Icon({
        src: '../../catalog/views/unosat/data/marker.png',
        anchorYUnits: 'pixels',
        anchor: [0.5, 50]
      }),
      stroke: new ol.style.Stroke({
        color: 'rgba(255,0,0,1)',
        width: 2
      }),
      fill: new ol.style.Fill({
        color: 'rgba(255,0,0,0.3)'
      })
    }));

    this['options'] = {
      highlight: true
    };

    this.listeners = /** @type {ngeox.SearchDirectiveListeners} */ ({
      select: gn.SearchController.selected_.bind(this)
    });
  };

  gn.SearchController.prototype.$onInit = function() {
    var coordProj = ['EPSG:4326'];
    if (coordProj === undefined) {
      coordProj = [this.map.getView().getProjection()];
    } else {
      coordProj = this.ngeoAutoProjection_.getProjectionList(coordProj);
    }
    this.coordinatesProjections = coordProj;

    this.initDatasets_();
  }

  /**
   * @param {ol.View} view View.
   * @return {function(string, function(Object))} function defining parameters for the search suggestions.
   * @private
   */
  gn.SearchController.prototype.createSearchCoordinates_ = function(view) {
    var viewProjection = view.getProjection();
    var extent = viewProjection.getExtent();
    return function(query, callback) {
      var suggestions = [];
      var coordinates = this.ngeoAutoProjection_.stringToCoordinates(query);
      if (coordinates === null) {
        return;
      }
      var position = this.ngeoAutoProjection_.tryProjectionsWithInversion(coordinates,
        extent, viewProjection, this.coordinatesProjections);
      if (position === null) {
        return;
      }
      suggestions.push({
        label: coordinates.join(' '),
        position: position,
        'tt_source': 'coordinates'
      });
      callback(suggestions);
    }.bind(this);
  }

  /**
   * Initialize datasets for the search
   * @private
   */
  gn.SearchController.prototype.initDatasets_ = function() {

    var bloodhoundEngine = this.createAndInitBloodhound_(
      this.ngeoCreateGeoJSONBloodhound);

    this.datasets = [{
      source: bloodhoundEngine.ttAdapter(),
      displayKey: function(suggestion) {
        return suggestion.toponymName;
      },
      templates: {
        header: function() {
          var header = this.$translate.instant('locations');
          return '<div class="header">' + header + '</div>';
        }.bind(this),
        suggestion: function(suggestion) {

          // A scope for the ng-click on the suggestion's « i » button.
          var scope = this.$rootScope.$new(true);
          scope['extent'] = suggestion.bbox;
          scope['click'] = function(event) {
            window.alert(feature.get('label'));
            event.stopPropagation();
          };
          var formatter = function(loc) {
            var props = [];
            ['adminName1', 'countryName'].
            forEach(function(p) {
              if (loc[p]) { props.push(loc[p]); }
            });
            return (props.length == 0) ? '' : '-' + props.join(', ');
          };

          var html = '<p>' + suggestion.toponymName + '<span class="italic">' + formatter(suggestion) +
            '</span></p>';
          return this.$compile(html)(scope);
        }.bind(this)
      }
    }];

    // For searching coordinates
    this.datasets.push({
      source: this.createSearchCoordinates_(this.map.getView()),
      name: 'coordinates',
      display: 'label',
      templates: {
        header: function() {
          var header = this.$translate.instant('recenterTo');
          return '<div class="header">' + header +'</div>';
        }.bind(this),
        suggestion: function(suggestion) {
          var coordinates = suggestion['label'];
          var html = '<p class="app-search-label">' + coordinates +'</p>';
          // html = '<div class="app-search-datum">' + html +'</div>';
          return html;
        }
      }
    });
  }

  /**
   * @param {ngeo.CreateGeoJSONBloodhound} ngeoCreateGeoJSONBloodhound The ngeo
   *     create GeoJSON Bloodhound service.
   * @return {Bloodhound} The bloodhound engine.
   * @private
   */
  gn.SearchController.prototype.createAndInitBloodhound_ =
    function(ngeoCreateGeoJSONBloodhound) {
      var params = {
        lang: 'fr',
        style: 'full',
        type: 'json',
        maxRows: 10,
        username: 'georchestra'
      };

      var url = 'http://api.geonames.org/searchJSON?';
      url = this.gnUrlUtils_.append(url,
        this.gnUrlUtils_.toKeyValue(params));

      url += '&name_startsWith=%QUERY';

      var bloodhound = ngeoCreateGeoJSONBloodhound(url,
        undefined, undefined, undefined, undefined, {filter: function(resp) {
          return resp.geonames;
        }});

      bloodhound.initialize();
      return bloodhound;
    };


  /**
   * @param {jQuery.event} event Event.
   * @param {Object} suggestion Suggestion.
   * @param {TypeaheadDataset} dataset Dataset.
   * @this {gn.SearchController}
   * @private
   */
  gn.SearchController.selected_ = function(event, suggestion, dataset) {
    var map = this.map;
    if (suggestion['tt_source'] === 'coordinates') {
      const geom = new ol.geom.Point(suggestion['position']);

      this.featureOverlay_.clear();
      this.featureOverlay_.addFeature(new ol.Feature({
        geometry: geom,
        'layer_name': 'coordinate_layer'
      }));
      this.map.getView().setCenter(suggestion['position']);
      // this.leaveSearch_();
    } else {
      var extent = ol.proj.transformExtent([suggestion.bbox.west,
          suggestion.bbox.south, suggestion.bbox.east, suggestion.bbox.north],
        'EPSG:4326', 'EPSG:3857');

      var geom = ol.geom.Polygon.fromExtent(extent);
      map.getView().fit(geom.getExtent(), map.getSize(), {
        maxZoom: 16
      });
    }
  };


  module.controller('UnSearchController', gn.SearchController);

  gn.SearchController['$inject'] = [
    '$rootScope', '$compile', 'ngeoAutoProjection', 'ngeoFeatureOverlayMgr',
    'ngeoCreateGeoJSONBloodhound',
    'gnUrlUtils', '$translate'];

})();
