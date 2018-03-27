(function() {

  goog.provide('app.kmz.overlay');
  goog.require('app.kmz.service');
  goog.require('app.kmz.format');

  var module = angular.module('app.kmz.overlay', [
    'app.kmz.service'
  ]);
  
  gn.KmlOverlay = function() {
    return {
      restrict: 'E',
      scope: {
        map: '<appKmlOverlayMap'
      },
      controller: 'AppKmlOverlayController',
      controllerAs: 'ctrl',
      bindToController: true
    };
  };

  module.directive('appKmlOverlay', gn.KmlOverlay);

  gn.KmlOverlayController = function($timeout, kmzService) {

    this.kmzService = kmzService;
    this.handleHighlight();
  };


  gn.KmlOverlayController.prototype.handleHighlight = function() {
    var map = this.map;

    var div = $('' +
      '<div id="popup" class="kml-popup">' +
      '   <a href="#" id="popup-closer" class="ol-popup-closer"></a>' +
      '   <div id="popup-content"></div>' +
      '</div>');

    var overlay = new ol.Overlay({
      element: div.get(0),
      positioning: 'bottom-left',
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    map.addOverlay(overlay);

    // Hide on close click
    div.find('#popup-closer').click(function() {
      overlay.setPosition(undefined);
      div.get(0).blur();
      return false;
    });

    map.on('singleclick', function(evt) {
      if (evt.dragging) {
        return;
      }
      var pixel = map.getEventPixel(evt.originalEvent);
      map.forEachFeatureAtPixel(pixel, function(feature) {

        var desc = feature.get('description');
        if(desc && desc.indexOf('<') == 0) {
          var contentEl = $(overlay.getElement()).find('#popup-content');

          // Replace image url with one from KMZ
          var match =
            desc.match(/(?:<img[^>]+src\s*=\s*"(?!blob:)([^">]+)")/);

          while(match && match[1]) {
            if(this.kmzService.imageMapping[match[1]]) {
              desc = desc.replace(match[1],
                this.kmzService.imageMapping[match[1]]);

              match =
                desc.match(/(?:<img[^>]+src\s*=\s*"(?!blob:)([^">]+)")/);
            }
            else {
              break;
            }
          }
          if(feature.get('name')) {
            desc = '<h5>'+ feature.get('name') + '</h5>' + desc;
          }
          contentEl.html(desc);
          overlay.setPosition(evt.coordinate);
          $(overlay.getElement()).show();
          return true;
        }
        if(feature.get('placemark')) {
          console.log(feature.get('description'));
        }
      }, this, function(layer) {
        return layer.get('kml');
      });


    }.bind(this));
  };

  gn.KmlOverlayController['$inject'] = [
    '$timeout',
    'kmzService'
  ];

  module.controller('AppKmlOverlayController', gn.KmlOverlayController);

})();