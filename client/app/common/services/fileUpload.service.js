"use strict";

(function () {

    angular
        .module("app")
        .factory('fileUploadService', ['$http', 'appSettings', fileUploadService]);

    function fileUploadService($http, appSettings) {

        var uploadImage = function (files, callback) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];

                    $http.put(appSettings.uploadUrl, file, {
                        transformRequest: angular.identity,
                        headers: { 'Content-Type': undefined }
                    }).then(function (response) {
                       callback(response.headers('X-File-URL'));
                    }, function (data, status, headers, config) {
                        console.log('error status: ' + status);
                    });
                }
            }
        }

        var uploadVideo = function (files, callback) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];

                    $http.put(appSettings.uploadUrl, file, {
                        transformRequest: angular.identity,
                        headers: { 'Content-Type': undefined }
                    }).then(function (response) {
                       callback(response.headers('X-File-URL'));
                    }, function (data, status, headers, config) {
                        console.log('error status: ' + status);
                    })
                }
            }
        }

        // Public API here
        return {
            uploadImage: uploadImage,
            uploadVideo: uploadVideo
        };
    }
})();
