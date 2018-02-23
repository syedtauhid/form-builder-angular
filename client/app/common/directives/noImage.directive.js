(function () {
    'use strict';

    angular.module('app')
        .directive('noImage', ['appSettings', noImage]);

    function noImage(appSettings) {
        var setDefaultImage = function (element) {
            element.attr('src', appSettings.noImageUrl);
        };
    
        var directive = {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.$watch(function() {
                    return attrs.ngSrc;
                }, function () {
                    if (!attrs.ngSrc) {
                        setDefaultImage(element);
                    }
                });
    
                element.bind('error', function() { setDefaultImage(element); });
            }
        };

        return directive;
    }
})(); 

