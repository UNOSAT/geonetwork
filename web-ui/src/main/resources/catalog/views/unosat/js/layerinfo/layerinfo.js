(function() {

  goog.provide('un-layerinfo');

  var module = angular.module('un-layerinfo', []);

  module.value('unLayerState', {
    layer: undefined,
    md: undefined
  });

  module.service('unLayerInfoService', [
    'Metadata',
    'gnSearchManagerService',
    'gnPopup',
    'unLayerState',
    '$compile',
    function(Metadata, gnSearchManagerService, gnPopup, unLayerState,
             $compile) {

      var mds = [];

      this.getAllMetadatas = function() {
        return gnSearchManagerService.gnSearch({
          from: 1,
          to: 1000,
          fast: 'index',
          _content_type: 'json'
        }).then(function(response) {
          for (var i = 0; i < response.metadata.length; i++) {
            var md = new Metadata(response.metadata[i]);
            md.overview = md.getThumbnails() && md.getThumbnails().list[0];
            mds.push(md);
          }
          return mds;
        });
      };

      this.openMd = function(layer) {
        var uuid = layer.get('metadataUuid') || '63a1cd60-16b2-4a9b-881f-e4e8667fe9d4';
        var md = mds.filter(function(o){
          return o.getUuid() == uuid;
        });
        md = angular.isArray(md) && md.length == 1 && md[0];
        unLayerState.md = md;
        unLayerState.layer = layer;
      };
    }]);

  gn.layerinfoDirective = function(unLayerState) {
    return {
      restrict: 'A',
      templateUrl: '../../catalog/views/unosat/js/layerinfo/layerinfo.html',
      link: function(scope) {
        scope.obj = unLayerState;
      }
    };
  };

  module.directive('unLayerinfo', ['unLayerState', gn.layerinfoDirective]);

  gn.layerinfoDirectiveBtn = function() {
    return {
      restrict: 'E',
      scope: {
        layer: '='
      },
      controller: 'UnLayerinfoController',
      controllerAs: 'ctrl',
      bindToController: true,
      templateUrl: '../../catalog/views/unosat/js/layerinfo/layerinfobtn.html'
    };
  };

  module.directive('unLayerinfoBtn', gn.layerinfoDirectiveBtn);

  gn.LayerinfoController = function(unLayerInfoService) {
    this.showLayerInfo_ = unLayerInfoService;
  };

  gn.LayerinfoController.prototype.getInfo = function() {
    this.showLayerInfo_.openMd(this.layer);
  };


  module.controller('UnLayerinfoController',
    gn.LayerinfoController);

  gn.LayerinfoController['$inject'] = [
    'unLayerInfoService'
  ];

})();
