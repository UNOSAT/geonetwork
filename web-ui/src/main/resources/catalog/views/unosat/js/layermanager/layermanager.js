(function() {

  goog.provide('un-layermanager');
  goog.require('app.layerclipping');

  var module = angular.module('un-layermanager', ['app.layerclipping']);

  gn.layermanagerDirective = function() {
    return {
      restrict: 'E',
      scope: {
        'map': '=unLayermanagerMap',
        'layers': '=unLayermanagerLayers'
      },
      controller: 'UnLayermanagerController',
      controllerAs: 'ctrl',
      bindToController: true,
      templateUrl: '../../catalog/views/unosat/js/layermanager/' +
          'layermanager.html'
    };
  };

  module.directive('unLayermanager', gn.layermanagerDirective);

  gn.LayermanagerController = function($scope, ngeoSyncArrays) {
    var $this = this;
    this['uid'] = goog.getUid(this);
    this.opacities_ = {};
    this.selectedLayers = this.layers;
  };


  gn.LayermanagerController.prototype.removeLayer = function(layer) {
    this['map'].removeLayer(layer);
  };

  gn.LayermanagerController.prototype.changeVisibility = function(layer) {
    var currentOpacity = layer.getOpacity();
    var newOpacity;
    var uid = goog.getUid(layer);
    if (currentOpacity === 0) {
      if (angular.isDefined(this.opacities_[uid])) {
        newOpacity = this.opacities_[uid];
      } else {
        newOpacity = 1;
      }
      // reset old opacity for later use
      delete this.opacities_[uid];
    } else {
      this.opacities_[uid] = currentOpacity;
      newOpacity = 0;
    }
    layer.setOpacity(newOpacity);
  };

  gn.LayermanagerController.prototype.toggleContent = function(idx) {

    var targetElem = $('#layermanager-item-' + idx + '-collapse');
    var isCollapse = targetElem.hasClass('collapsed');
    $('#layermanager-item-' + idx).toggle({
      complete: function() {
        if(!isCollapse) {
          targetElem.addClass('collapsed');
        }
        else {
          targetElem.removeClass('collapsed');
        }
      }
    });
  };

  gn.LayermanagerController.prototype.zoomToExtent = function(layer) {
      this['map'].getView().fit(layer.get('cextent'),
          this['map'].getSize());
  };


  gn.LayermanagerController['$inject'] = [
    '$scope',
    'ngeoSyncArrays'
  ];

  module.controller('UnLayermanagerController', gn.LayermanagerController);

  module.directive('ngRightClick', ['$parse', function($parse) {
    return function(scope, element, attrs) {
      var fn = $parse(attrs.ngRightClick);
      element.bind('contextmenu', function(event) {
        scope.$apply(function() {
          event.preventDefault();
          fn(scope, {$event:event});
        });
      });
    };
  }]);

})();
