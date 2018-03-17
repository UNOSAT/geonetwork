(function() {

  goog.provide('app.contrib');

  goog.require('app.auth');
  goog.require('app.geocatalog');

  var module = angular.module('app.contrib', ['app.auth', 'app.geocatalog']);

})();