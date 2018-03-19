(function() {

  goog.provide('app.geocatalog');
  goog.require('app.mdextent');
  goog.require('app.formatter');
  goog.require('app.linksbtn');

  var module = angular.module('app.geocatalog', [
    'app.mdextent', 'app.formatter', 'app.linksbtn']);

  gn.geoCatalogDirective = function() {
    return {
      restrict: 'E',
      scope: {
        map: '=appGeoCatalogMap',
        user: '<appGeoCatalogUser'
      },
      controller: 'AppGeoCatalogController',
      controllerAs: 'ctrl',
      bindToController: true,
      templateUrl: '../../catalog/views/contrib/geocatalog/geocatalog.html',
      link: function(scope, element) {
      }
    };
  };
  module.directive('appGeoCatalog', gn.geoCatalogDirective);


  gn.AppGeoCatalogController = function($scope, $http, gnSearchSettings,
                                        suggestService, gnMap, appResultviewFns) {

    this.suggestService = suggestService;
    this.$http = $http;
    this.$scope = $scope;
    this.selectedMd = null;

    $scope.resultTemplate = gnSearchSettings.resultTemplate;
    $scope.searchObj = {
      params: {},
      sortbyValues: gnSearchSettings.sortbyValues,
      sortbyDefault: gnSearchSettings.sortbyDefault,
      hitsperpageValues: gnSearchSettings.hitsperpageValues,
      defaultParams: {
        'facet.q': '',
        resultType: gnSearchSettings.facetsSummaryType || 'details'
      },
      params: {
        'facet.q': '',
        resultType: gnSearchSettings.facetsSummaryType || 'details'
      }
    };

    $scope.paginationInfo = {
      pages: -1,
      currentPage: 1,
      hitsPerPage: 10
    };

    this.facetsSummaryType = 'details';
    $scope.map = this.map;
    $scope.resultviewFns = appResultviewFns;
    this.geomRelations = ['within'];

    var defaultSearchParams = ['sortBy', 'from', 'to', 'fast', 'resultType',
        'facet.q', 'sortOrder',
      '_content_type'];

    $scope.$watch('searchObj.params', function(v) {
      for (var p in v) {
        if(defaultSearchParams.indexOf(p) < 0) {
          $scope.searchObj.canReset = true;
          return;
        }
      }
      $scope.searchObj.canReset = false;
    });

    $scope.$on('aftersearch', function() {
      this.selectedMd = null;
    }.bind(this));

  };

  gn.AppGeoCatalogController.prototype.getAnySuggestions = function(val) {
    var url = this.suggestService.getUrl(val, 'anylight',
        ('STARTSWITHONLY'));

    return this.$http.get(url, {
    }).then(function(res) {
      return res.data[1];
    });
  };

  gn.AppGeoCatalogController.prototype.setRelation = function(rel) {
    this.$scope.searchObj.params.relation = rel;
    this.$scope.$parent.triggerSearch();
  };

  gn.AppGeoCatalogController['$inject'] = [
    '$scope',
    '$http', 'gnSearchSettings',
    'suggestService', 'gnMap', 'appResultviewFns'
  ];
  module.controller('AppGeoCatalogController',
      gn.AppGeoCatalogController);


  module.directive('appMdView', function() {
    return {
      restrict: 'E',
      scope: {
        md: '=appMdViewMd'
      },
      templateUrl: '../../catalog/views/contrib/geocatalog/mdview.html',
      link: function(scope, element) {
      }
    };
  });

})();
