var addColumn = function($modal, $columns) {
    return function() {
        $modal
            .open({
                templateUrl: 'column/partials/modal.html',
                controller: function ($scope, $modalInstance) {
                    $scope.theme = 'default';
                    $scope.closable = false;
                    $scope.error = false;

                    $scope.save = function () {
                        var column = {
                            title: $scope.title,
                            theme: $scope.theme,
                            position: $columns.$objects.length,
                            limit: $scope.limit ? ($scope.limit < 0 ? 0 : $scope.limit) : 0
                        };

                        $columns.persist(column)
                            .then(
                            $modalInstance.close,
                            function () {
                                $scope.error = true;
                            }
                        );
                    };
                }
            });
    };
};

angular.module('laboard-frontend')
    .controller('ProjectController', [
        '$rootScope', '$scope', '$stateParams', '$state', '$modal', 'ColumnsRepository', 'ProjectsRepository', 'IssuesRepository', 'ProjectManager', 'DurationsRepository',
        function($root, $scope, $params, $state, $modal, $columns, $projects, $issues, $projectManager, $durations) {

            var render = function() {
                $projects.members($root.project)
                    .then(
                        function(members) {
                            $root.project.members = members;
                        }
                    );

                $columns.all()
                    .then(
                        function() {
                            $root.project.columns = $columns;
                        }
                    );

                $issues.all()
                    .then(
                        function() {
                            $root.project.issues = $issues;
                        }
                    );

                $durations.all()
                    .then(
                        function() {
                            $root.project.durations = $durations;
                        }
                    );
            };

            if ($params.namespace && $params.project) {
                $projectManager.select($params.namespace + '/' + $params.project)
                    .then(
                        render,
                        function() {
                            $state.go('home');
                        }
                    );
            } else {
                render();
            }

            $scope.addColumn = addColumn($modal, $columns);

            $scope.bootstrap = function() {
                $root.LABOARD_CONFIG.defaultColumns.forEach($columns.persist, $columns);
            };
        }
    ])
    .controller('ProjectMenuController', [
        '$rootScope', '$scope', '$modal', 'ColumnsRepository',
        function ($root, $scope, $modal, $columns) {
            $scope.addColumn = addColumn($modal, $columns);
        }
    ]);
