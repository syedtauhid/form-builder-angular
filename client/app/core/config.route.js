(function () {
    'use strict';

    angular.module('app')
        .config(['$stateProvider', '$urlRouterProvider',
            function ($stateProvider, $urlRouterProvider) { 
                $urlRouterProvider
                .otherwise('/app/home');

                $stateProvider
                .state('app', {
                    abstract: true,
                    url: "/app",
                    templateUrl: "/app/core/app.html"
                })
                .state('app.dashboard', {
                    url: "/home",
                    templateUrl: "/app/home/home.html",
                    controller: 'HomeCtrl',
                    controllerAs: 'vm'
                });

            }]);

})();