angular.module('laboard-frontend')
    .factory('DurationsRepository', [
        '$rootScope', 'Restangular', '$q', 'DurationsSocket',
        function($root, $rest, $q, $socket) {

            var storage = {
                $objects: undefined
            };

            var requester = {
                fetch: function() {
                    var deferred = $q.defer();

                    $rest.all('projects/' + $root.project.path_with_namespace + '/durations')
                        .getList()
                        .then(
                            function (durations) {
                                storage.$objects = _.sortBy(durations, 'iid');

                                deferred.resolve(durations);
                            },
                            deferred.reject
                        );

                    return deferred.promise;
                }
            };

            var caller = {
                all: function() {
                    var deferred = $q.defer();

                    if (!$root.project) {
                        deferred.reject();
                        return deferred.promise;
                    }

                    if (storage.$objects) {
                        deferred.resolve(storage.$objects);
                        return deferred.promise;
                    }

                    requester.fetch()
                        .then(
                        function(durations) {
                            if (durations.length)
                                storage.$objects = durations;

                            deferred.resolve(issues);
                        },
                        deferred.reject
                    );

                    return deferred.promise;
                }
            };

            var handler = function(data) {
            };

            $socket
                .on('update', handler);

            return {
                all: caller.all
            };
        }
    ]);