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
    var map = this.map;

    var hasKml = false;
    map.getLayers().on('change:length', function() {
      hasKml = this.map.getLayers().getArray().some(function(layer) {
        return layer.get('kml');
      }.bind(this));
    }.bind(this));

    // Display pop up on feature over
    var div = document.createElement('div');
    div.className = 'overlay';
    var overlay = new ol.Overlay({
      element: div,
      positioning: 'bottom-left'
    });
    map.addOverlay(overlay);

    var hidetimer;
    var hovering = false;
    $(map.getViewport()).on('mousemove', function(e) {
      if (hovering) { return; }
      if(!hasKml) return;
      var f;
      var pixel = map.getEventPixel(e.originalEvent);
      var coordinate = map.getEventCoordinate(e.originalEvent);
      map.forEachFeatureAtPixel(pixel, function(feature, layer) {
        if (!layer || !layer.get('getinfo')) { return; }
        $timeout.cancel(hidetimer);
        if (f != feature) {
          f = feature;
          var html = '';
          if (feature.getKeys().indexOf('description') >= 0) {
            html = feature.get('description');
          } else {
            $.each(feature.getKeys(), function(i, key) {
              if (key == feature.getGeometryName() || key == 'styleUrl') {
                return;
              }
              html += '<dt>' + key + '</dt>';
              html += '<dd>' + feature.get(key) + '</dd>';
            });
            html = '<dl class="dl-horizontal">' + html + '</dl>';
          }
          overlay.getElement().innerHTML = html;
        }
        overlay.setPosition(coordinate);
        $(overlay.getElement()).show();
      }, this, function(layer) {
        return layer && !layer.get('temporary') ;
      });
      if (!f) {
        hidetimer = $timeout(function() {
          $(div).hide();
        }, 200, false);
      }
    });
    $(div).on('mouseover', function() {
      hovering = true;
    });
    $(div).on('mouseleave', function() {
      hovering = false;
    });


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
            desc.match(/\<img.+src\s*\=\s*(?:\"|\')(.+?)(?:\"|\')(?:.+?)\>/);
          if(match && match[1]) {
            if(this.kmzService.imageMapping[match[1]]) {
              desc = desc.replace(match[1],
                this.kmzService.imageMapping[match[1]]);
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