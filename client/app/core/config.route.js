(function () {
    'use strict';

    angular.module('app')
        .config(['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) { 
                $urlRouterProvider
                .otherwise('/app');

                $stateProvider
                .state('app', {
                    url: "/app",
                    templateUrl: "/app/core/app.html"
                });

            }]);

})();