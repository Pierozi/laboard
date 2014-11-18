angular.module('laboard-frontend')
    .factory('DurationsSocket', [
        'SocketFactory',
        function($socket) {
            return {
                on: function(event, callback) {
                    $socket.on('duration.' + event, callback);

                    return this;
                }
            }
        }
    ]);
