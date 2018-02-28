(function() {
    "use strict";

angular.module('app').filter('typeof', function() {
    return function(obj) {
      return typeof obj
    };
  });

})();