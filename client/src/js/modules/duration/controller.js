angular.module('laboard-frontend')
    .controller('DurationController', [
        '$scope', '$rootScope', '$filter', 'Restangular', 'ColumnsRepository', '$modal', '$modalInstance', 'DurationsRepository', 'AuthorizationFactory', 'issue',
        function($scope, $rootScope, $filter, Restangular, ColumnsRepository, $modal, $modalInstance, $durations, $authorization, issue) {

            var updateTime = function(timeStart, timeStop, rezMsStart) {
                rezMsStart = rezMsStart || false;

                $durations.update($scope.durationId, {
                    "timeStart" : timeStart,
                    "timeStop"  : timeStop
                }).then(function(response) {
                    if (!response.success) {
                        return;
                    }

                    if (rezMsStart)
                        $scope.timestampMsStart = undefined;
                });
            };

            (function() {
                $scope.issue            = issue;
                $scope.timeStarted      = false;
                $scope.timestampMsStart = undefined;
                $scope.durationId       = undefined;
                $scope.history          = undefined;
                $scope.workerName       = undefined;
                $scope.workerLogged     = false;
                $scope.totalTimeWorked  = 0;

                $rootScope.project.durations.all().then(function(r) {
                    var durations = $filter('filter')(r, {"issue_id": issue.iid}, true);

                    if (0 === durations.length)
                        return;

                    for (var i = 0, ilen = durations.length; i < ilen; i++) {
                        if (durations[i]['time_stop'] == null)
                            continue;

                        durations[i]['countdown'] = (parseInt(durations[i]['time_stop']) - parseInt(durations[i]['time_start']));
                        $scope.totalTimeWorked += durations[i]['countdown'];
                    }

                    $scope.history = durations;

                    for (i = 0, ilen = durations.length; i < ilen; i++) {
                        var duration = durations[i];

                        if (null !== duration['time_stop'])
                            continue;

                        $scope.timeStarted      = true;
                        $scope.durationId       = duration.id;
                        $scope.timestampMsStart = parseInt(duration['time_start']) * 1000;
                        $scope.workerName       = duration['user_name'];
                        $scope.workerLogged     = duration['user_id'] == $rootScope.user.id;

                        return;
                    }
                });
            })();

            $scope.$on('timer-stopped', function (event, data){
                var timeStart = Math.round($scope.timestampMsStart / 1000),
                    timeStop  = timeStart + (data.days * 86400) + (data.hours * 3600) + (data.minutes * 60) + data.seconds;

                updateTime(timeStart, timeStop, true);
            });

            $scope.start = function() {
                $scope.timestampMsStart = new Date().getTime();

                $durations.add({
                    "issueId"   : issue.iid,
                    "userId"    : $rootScope.user.id,
                    "userName"  : $rootScope.user.name,
                    "columnName": issue.column,
                    "timeStart" : Math.round($scope.timestampMsStart / 1000)
                }).then(function(response) {
                    if (!response.success) {
                        return;
                    }

                    $scope.timeStarted  = true;
                    $scope.workerLogged = true;
                    $scope.workerName   = $rootScope.user.name;
                    $scope.durationId   = response.durationId;

                    $('timer.worker-countdown')[0].start();
                });
            };

            $scope.stop = function() {
                $scope.timeStarted = false;
                $('timer.worker-countdown')[0].stop();
            };

            $scope.timeAdd = function(min) {
                $scope.timestampMsStart -= (min * 60) * 1000;

                var timeStart = Math.round($scope.timestampMsStart / 1000);
                updateTime(timeStart, null);
            };

            $scope.timeRm = function(min) {
                var nextVal = $scope.timestampMsStart + ((min * 60) * 1000);

                if (nextVal > new Date().getTime())
                    return;

                $scope.timestampMsStart = nextVal;

                var timeStart = Math.round($scope.timestampMsStart / 1000);
                updateTime(timeStart, null);
            };

            $scope.close = function() {
                $modalInstance.close();
            };
        }
    ]);