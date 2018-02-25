(function() {
    "use strict";

    angular
        .module("app")
        .controller("AppCtrl", ["$scope", "$state", "$uibModal",'$log', AppCtrl]) // overall control
        .controller('FormBuilderCtrl', ["$scope", "$uibModalInstance", '$log',  FormBuilderCtrl]);

    function AppCtrl($scope, $state, $uibModal, $log) {
        $scope.openFormBuilder = openFormBuilder;

        function openFormBuilder(inputJson) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'formBuilderTemplate.html',
                controller: "FormBuilderCtrl",
                size: "lg",
                resolve: {
                  inputJson: inputJson
                }
            });

            modalInstance.result.then(
                function() {},
                function() {
                    $log.info("Modal dismissed at: " + new Date());
                }
            );
        }
    }

    function FormBuilderCtrl($scope, $uibModalInstance, $log, model) {

    }
})();
