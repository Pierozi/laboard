angular.module('laboard-frontend')
    .factory('DurationsRepository', [
        '$rootScope', 'Restangular', '$q', 'DurationsSocket',
        function($root, $rest, $q, $socket) {

            var storage = {
                $objects: undefined,
                events: {}
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
                },

                add: function(data) {
                    var deferred = $q.defer();

                    $rest.all('projects/' + $root.project.path_with_namespace)
                        .customPUT(data, 'durations')
                        .then(
                            function(response) {
                                deferred.resolve(response);
                            },
                            function(err) {
                                deferred.reject(err);
                            }
                        );

                    return deferred.promise;
                },

                update: function(id, data) {
                    var deferred = $q.defer();

                    $rest.all('projects/' + $root.project.path_with_namespace)
                        .customPUT(data, 'durations/' + id)
                        .then(
                        function(response) {
                            deferred.resolve(response);
                        },
                        function(err) {
                            deferred.reject(err);
                        }
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

                                deferred.resolve(storage.$objects);
                            },
                            deferred.reject
                        );

                    return deferred.promise;
                }
            };

            var eventServer = {
                start: function(data) {
                    storage.$objects.push(data.duration);
                    on.call('start');
                },

                update: function(data) {
                    var durationId = data.duration['id'],
                        timeStart  = data.duration['time_start'],
                        timeStop   = data.duration['time_stop'];

                    for (var i = 0, ilen = storage.$objects.length; i < ilen; i++) {
                        if (durationId != storage.$objects[i].id)
                            continue;

                        storage.$objects[i]['time_start'] = timeStart;
                        storage.$objects[i]['time_stop']  = timeStop;

                        on.call('update');
                        break;
                    }
                }
            };

            var on = {
                reg: function(events, callback, scope) {
                    events = typeof events === 'string' ? [events] : events;

                    events.forEach(function(event) {
                        if (!(event in storage.events))
                            storage.events[event] = [];

                        storage.events[event].push({
                            'callback'  : callback,
                            'scope'     : scope
                        });
                    });
                },

                unreg: function() {
                  //TODO... unreg callback
                },

                call: function(event, args) {
                    args = args || [];

                    if (!(event in storage.events))
                        return;

                    storage.events[event].forEach(function(collection) {
                        collection.callback.apply(collection.scope, args);
                    });
                }
            };

            $socket
                .on('start', eventServer.start)
                .on('update', eventServer.update);

            return {
                all: caller.all,
                add: requester.add,
                update: requester.update,
                on: on.reg
            };
        }
    ]);