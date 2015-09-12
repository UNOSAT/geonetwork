(function() {

  goog.provide('un-scaleselector');
  var module = angular.module('un-scaleselector', []);

  module.value('ngeoScaleselectorTemplateUrl',
      '../../catalog/views/unosat/js/infobar/scaleselector.html');

  gn.scaleselectorDirective = function() {
    return {
      restrict: 'E',
      scope: {
        'map': '='
      },
      template: '<div ngeo-scaleselector="scaleCtrl.scales" ' +
          'ngeo-scaleselector-map="scaleCtrl.map" ' +
          'ngeo-scaleselector-options="scaleCtrl.options"></div>',
      controllerAs: 'scaleCtrl',
      bindToController: true,
      controller: 'UnScaleselectorController'
    };
  };
  module.directive('unScaleselector', gn.scaleselectorDirective);

  gn.ScaleselectorController = function($sce) {

    /**
     * The zoom level/scale map object for the ngeoScaleselector directive.
     * The values need to be trusted as HTML.
     * @type {Object.<string, string>}
     * @const
     */
    this['scales'] = {
      '5': $sce.trustAsHtml('1&nbsp;:&nbsp;12\'000\'000'),
      '6': $sce.trustAsHtml('1&nbsp;:&nbsp;6\'000\'000'),
      '7': $sce.trustAsHtml('1&nbsp;:&nbsp;3\'000\'000'),
      '8': $sce.trustAsHtml('1&nbsp;:&nbsp;1\'500\'000'),
      '9': $sce.trustAsHtml('1&nbsp;:&nbsp;750\'000'),
      '10': $sce.trustAsHtml('1&nbsp;:&nbsp;400\'000'),
      '11': $sce.trustAsHtml('1&nbsp;:&nbsp;200\'000'),
      '12': $sce.trustAsHtml('1&nbsp;:&nbsp;100\'000'),
      '13': $sce.trustAsHtml('1&nbsp;:&nbsp;50\'000'),
      '14': $sce.trustAsHtml('1&nbsp;:&nbsp;25\'000'),
      '15': $sce.trustAsHtml('1&nbsp;:&nbsp;12\'000'),
      '16': $sce.trustAsHtml('1&nbsp;:&nbsp;6\'000'),
      '17': $sce.trustAsHtml('1&nbsp;:&nbsp;3\'000'),
      '18': $sce.trustAsHtml('1&nbsp;:&nbsp;1\'500'),
      '19': $sce.trustAsHtml('1&nbsp;:&nbsp;750')
    };

    /**
     * Use the "dropup" variation of the Bootstrap dropdown.
     */
    this['options'] = {
      'dropup': true
    };
  };

  module.controller('UnScaleselectorController', ['$sce',
      gn.ScaleselectorController]);

})();
