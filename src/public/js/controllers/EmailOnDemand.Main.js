var EmailOnDemand = angular.module('EmailOnDemand', ['textAngular', 'checklist-model', 'ui.bootstrap']);

/**
 * Logging level configuration.
 */
EmailOnDemand.config(function ($logProvider) {
    if (window.EmailOnDemandMODE != 'debug') {
        $logProvider.debugEnabled(false);
    }
});

/**
 * Represents multipart/form-data POSTer.
 *
 * @param {String} url Where to post to.
 * @param {FormData} formData The data to post. Instance of `FormData`.
 * @param {Object} config $http config.
 * @returns {HttpPromise} $http promise.
 */
EmailOnDemand.factory('FormDataPost', [
    '$http',
    function ($http) {
        return function (url, formData, config) {
            return $http.post(url, formData, angular.extend({
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined
                }
            }, config));
        };
}]);


EmailOnDemand.controller('ComposeCtrl', [
    '$scope', '$rootScope', '$modal', 'FormDataPost', '$log',
    function ($scope, $rootScope, $modal, FormDataPost, $log) {
        // Data to work with, exported by the template engine via script tag.
        // Here we just consume it.
        $scope.Tree = window.EmailOnDemandTree;

        // Recipients selection management.
        // --------------------------------
        $scope.Selection = {};
        $scope.Recipients_cnt = 0;
        $scope.$watch('Selection', function (newVal) {
            $scope.Recipients_cnt = 0;
            angular.forEach(newVal, function (users) {
                $scope.Recipients_cnt = $scope.Recipients_cnt + users.length;
            });
        }, true);
        /**
         * Toggles recipients in a store.
         *
         * @param {String} store Name of the sore.
         * @param {Boolean} selected Selected status.
         */
        $scope.toggleAll = function (store, selected) {
            if (selected) {
                $scope.Selection[store] = angular.copy($scope.Tree[store]);
            } else {
                $scope.Selection[store] = [];
            }
        };

        // Gather content related.
        // -----------------------
        /**
         * Gathers text content via the Text extraction API.
         *
         * @param {String} from Type of the gather operation.
         * @param {String} model Value for reference and url only.
         */
        $scope.gatherContent = function (from, model) {
            var fromFile = document.getElementById('fromFile').files[0];

            if (from == 'file' && !fromFile) {
                alert('Please, select some file first.');
                return;
            }

            var fd = new FormData();
            fd.append('from', from);
            fd.append('value', model);
            fd.append('file', fromFile);
            FormDataPost('/gather', fd)
                .success(function (data) {
                    // Add to content editor.
                    $scope.htmlContent = $scope.htmlContent + '<div>' + data + '</div>';
                    modalInstance.close();
                })
                .error(function (data, status) {
                    // Inform about erro and exit.
                    $log.error(data, status);
                    $rootScope.$broadcast('GatherError', {
                        type: 'warning',
                        msg: data.error + ': ' + data.actions[0].errors[0].detail
                    });
                    modalInstance.close();
                });

            var modalInstance = $modal.open({
                templateUrl: 'modal-Working.html',
                backdrop: 'static'
            });
        };

        // Attached files related.
        // -----------------------
        $scope.attachedFiles = [0];
        $scope.addFileInput = function () {
            $scope.attachedFiles.push($scope.attachedFiles.length);
        };
        $scope.removeFileInput = function (index) {
            $scope.attachedFiles.splice(index, 1);
        };

        // Sending.
        // --------
        /**
         * Sends the email.
         */
        $scope.Send = function () {

            var fd = new FormData();
            fd.append('from', $scope.Sender);
            fd.append('to', JSON.stringify($scope.Selection));
            fd.append('subject', $scope.Subject);
            fd.append('html', $scope.htmlContent);
            fd.append('toIndex', $scope.addToIndex);
            angular.forEach($scope.attachedFiles, function (f, index) {
                var aF = document.getElementById('attached' + index).files[0];
                if (aF) {
                    fd.append('file' + index, aF);
                }
            });

            $scope.sending = true;
            FormDataPost('/send', fd)
                .success(function (data, status) {
                    $log.debug(data, status);
                    $rootScope.$broadcast('Email sent alert', {
                        type: 'success',
                        msg: '<strong>Sent successfully!</strong><p>Some infos: ' + data.text + '</p>'
                    });
                    $scope.Selection = {};
                    $scope.attachedFiles = [0];
                    $scope.Subject = null;
                    $scope.htmlContent = null;
                    $scope.sending = false;
                    $scope.addToIndex = false;
                })
                .error(function (data, status) {
                    $log.error(data, status);
                    $rootScope.$broadcast('Email sent alert', {
                        type: 'warning',
                        msg: data.text
                    });
                    $scope.sending = false;
                });
        };

}]);

/**
 * Represents application level alers controller.
 *
 * @param {Object} $scope
 */
EmailOnDemand.controller('AppAlertsCtrl', [
    '$scope',
    function ($scope) {
        $scope.alerts = [
            {
                type: 'info',
                msg: '<strong>Need programmatic access?</strong>' +
                    ' See <a href="http://docs.emailondemand.apiary.io/" target="_blank">here</a> for API usage and tips.'
        }
    ];

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
}]);

/**
 * Represents Gather content level alers controller.
 *
 * @param {Object} $scope
 */
EmailOnDemand.controller('GatherAlertsCtrl', [
    '$scope',
    function ($scope) {
        $scope.alerts = [];

        $scope.$on('GatherError', function (e, alert) {
            $scope.alerts.push(alert);
        });

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
}]);

/**
 * Represents Send level alers controller.
 * Alerts auto hide.
 *
 * @param {Object} $scope
 */
EmailOnDemand.controller('SendAlertsCtrl', [
    '$scope', '$timeout',
    function ($scope, $timeout) {
        $scope.alerts = [];

        $scope.$on('Email sent alert', function (e, alert) {
            var i = $scope.alerts.push(alert) - 1;
            $timeout(function () {
                $scope.closeAlert(i);
            }, 5000);
        });

        $scope.closeAlert = function (index) {
            $scope.alerts.splice(index, 1);
        };
}]);

/**
 * Represents History controller.
 *
 * @param {Object} $scope
 */
EmailOnDemand.controller('HistoryCtrl', [
    '$scope', '$http', '$log',
    function ($scope, $http, $log) {
        /**
         * Get history data and store it on the `$scope` as chache.
         */
        $scope.onShow = function () {
            if (!$scope.History) {
                $scope.fetching = true;
                $http.get('/history/', {
                        params: {
                            AllMessages: true
                        }
                    })
                    .success(function (data) {
                        $scope.History = data.Data;
                        $log.debug('History data', $scope.History);
                        $scope.fetching = false;
                    })
                    .error(function (data, status) {
                        // Inform about error and exit.
                        $log.error(data, status);
                        $scope.History = [];
                        $scope.fetching = false;
                    });
            }
        };

        $scope.refresh = function () {
            $scope.History = null;
            $scope.onShow();
        };
}]);

/**
 * Represents Search controller.
 *
 * @param {Object} $scope
 */
EmailOnDemand.controller('SearchCtrl', [
    '$scope', '$http', '$log', '$modal',
    function ($scope, $http, $log, $modal) {
        /**
         * Search indexed messages.
         */
        $scope.search = function () {
            $scope.FoundData = null;
            $scope.searching = true;
            $http.get('/search', {
                    params: {
                        text: $scope.TheQuery
                    }
                })
                .success(function (data) {
                    $log.debug('Search data', data);
                    $scope.FoundData = data;
                    $scope.searching = false;
                })
                .error(function (data, status) {
                    // Inform about error and exit.
                    $log.error('Search data error', data, status);
                    $scope.searching = false;
                });
        };

        /**
         * [[Description]]
         * @param {Number} $index [[Description]]
         */
        $scope.showContent = function ($index) {
            $modal.open({
                templateUrl: 'modal-MsgContent.html',
                size: 'lg',
                controller: 'ViewIndexedMsgCtrl',
                resolve: {
                    Match: function () {
                        return $scope.FoundData[$index];
                    }
                }
            });
        };
}]);

/**
 * Represents View indexed message modal controller.
 *
 * @param {Object} $scope
 */
EmailOnDemand.controller('ViewIndexedMsgCtrl', [
    '$scope', '$modalInstance', 'Match',
    function ($scope, $modalInstance, Match) {
        $scope.Match = Match;
}]);
