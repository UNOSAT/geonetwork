(function() {

  goog.provide('app.kmz.service');

  var module = angular.module('app.kmz.service', []);

  var imageMapping = {};

  var KmzService = function() {
    this.imageMapping = imageMapping;
    this.model = this.getFSModel();
  };

  KmzService['$inject'] = [
  ];


  KmzService.prototype.addImage = function(key, value) {
    imageMapping[key] = value;
  };

  KmzService.prototype.getImage = function(key) {
    return imageMapping[key]
  };

  KmzService.prototype.preProcessEntries = function(entries) {
    var kmlEntries = [];
    entries.forEach(function(entry) {
      var isImage = (/\.(gif|jpg|jpeg|tiff|png)$/i).test(entry.filename);
      if(isImage) {
        this.model.getEntryFile(entry, function(blobUrl) {
          this.addImage(entry.filename, blobUrl);
        }.bind(this));
      }
      // Suppose it's kml
      else {
        kmlEntries.push(entry);
      }
    }.bind(this));
    return kmlEntries;
  };

  KmzService.prototype.getFSModel = function() {
    var URL = window.webkitURL || window.mozURL || window.URL;

    return {
      getEntries: function(file, onend) {
        zip.createReader(new zip.BlobReader(file),
          function(zipReader) {
            zipReader.getEntries(onend);
          }, onerror);
      },
      getEntryFile: function(entry, onend, onprogress) {
        var writer;
        function getData() {
          entry.getData(writer, function(blob) {
            var blobURL = URL.createObjectURL(blob);
            onend(blobURL);
          }, onprogress);
        }
        writer = new zip.BlobWriter();
        getData();
      }
    };
  }

  module.service('kmzService', KmzService);
})();

