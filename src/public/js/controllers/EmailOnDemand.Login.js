var EmailOnDemand = angular.module('EmailOnDemand', []);

/**
 * Represents the login controller.
 *
 * @param {Object} $scope
 * @param {Object} $http
 * @param {Object} $log
 * @param {Function} $timeout
 */
EmailOnDemand.controller('LoginCtrl', ['$scope', '$http', '$log', '$timeout', function ($scope, $http, $log, $timeout) {
    $scope.logging = false;
    $scope.logged = false;
    $scope.logerror = null;

    $scope.login = function () {
        $scope.logging = true;
        $scope.logged = false;
        $scope.logerror = null;

        $http.post('/login', {
            user: $scope.Email,
            password: $scope.Password
        }).
        success(function (data, status, headers, config) {
            $scope.logging = false;
            $scope.logged = true;
            $log.info('Login OK', data, status, headers, config);
            $timeout(function () {
                window.location.href = '/';
            }, 200);
        }).
        error(function (data, status, headers, config) {
            $scope.logging = false;
            $log.error(data, status, headers, config);
            $scope.logerror = 'Ups, it didn\'t work! You could try again...';
        });
    };
}]);
