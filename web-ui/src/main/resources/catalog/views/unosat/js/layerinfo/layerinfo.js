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
    '$rootScope',
    '$compile',
    function(Metadata, gnSearchManagerService, gnPopup, $rootScope,
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

        var scope = $rootScope.$new();
        scope.layer = layer;
        scope.md = md;
        gnPopup.create({
          title: md.title || md.defaultTitle,
          content: '<div un-layerinfo="" md="md" layer="layer" class="info-content"></div>',
          className: 'un-popup un-layerinfo'
        }, scope);
/*
        unLayerState.md = md;
        unLayerState.layer = layer;
*/
      };
    }]);

  gn.layerinfoDirective = function() {
    return {
      restrict: 'A',
      scope: {
        md: '=',
        layer: '='
      },
      templateUrl: '../../catalog/views/unosat/js/layerinfo/layerinfo.html',
      link: function(scope) {
      }
    };
  };

  module.directive('unLayerinfo', [gn.layerinfoDirective]);

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
