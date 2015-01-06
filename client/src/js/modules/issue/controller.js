angular.module('laboard-frontend')
    .controller('IssueController', [
        '$scope', '$rootScope', '$filter', '$timeout', 'Restangular', 'ColumnsRepository', '$modal', 'IssuesRepository', 'AuthorizationFactory', 'DurationsRepository',
        function($scope, $rootScope, $filter, $timeout, Restangular, ColumnsRepository, $modal, $issues, $authorization, $durations) {

            $scope.workInProgress = false;
            $scope.timestampMsStart = undefined;
            $scope.workerName = undefined;

            var updateProgressDurationTime = function() {
                $rootScope.project.durations.all().then(function(r) {
                    var durations = $filter('filter')(r, {"issue_id": $scope.issue.iid, "time_stop":null}, true),
                        duration  = 0 === durations.length ? null : durations[0];

                    $timeout(function() {

                        $scope.workInProgress   = (null !== duration);
                        $scope.timestampMsStart = null === duration ? undefined : parseInt(duration['time_start']) * 1000;
                        $scope.workerName       = duration ? duration['user_name'] : 'Undefined';

                        $scope.$apply();
                    }, 200);
                });
            };

            (function(){
                updateProgressDurationTime();
                $durations.on(['start', 'update'], updateProgressDurationTime, this);
            })();

            $scope.close = function() {
                $issues.close($scope.issue)
            };

            $scope.unpin = function() {
                $scope.issue.from = $scope.column.title;
                $scope.issue.to = null;

                $issues.move($scope.issue)
            };

            $scope.drag = function() {
                $scope.issue.from = $scope.column;
                $scope.issue.column = null;
            };

            $scope.theme = function(theme) {
                $scope.issue.before = $scope.issue.theme || null;

                if (theme === $scope.issue.before) {
                    theme = null;
                }

                $scope.issue.after = theme;

                $issues.theme($scope.issue);
            };

            var modal;
            $scope.assign = function() {
                var issue = $scope.issue;

                modal = $modal
                    .open({
                        templateUrl: 'issue/partials/assign.html',
                        controller: function($scope, $modalInstance) {
                            $scope.issue = issue;
                            $scope.assignTo = function(member) {
                                modal.close(member);
                            };
                        }
                    });

                modal.result
                    .then(function(member) {
                        $scope.issue.assignee = member;

                        $issues.persist($scope.issue);
                    });
            };

            var modalDuration;
            $scope.openDuration = function() {

                modalDuration = $modal
                    .open({
                        templateUrl: 'duration/partials/modalissue.html',
                        controller: 'DurationController',
                        resolve: {
                            issue: function () {
                                return $scope.issue;
                            }
                        }
                    });
            };

            $scope.draggable = $authorization.authorize('developer');
        }
    ]);
