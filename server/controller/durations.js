var q = require('q');

module.exports = function(router, container) {
    var callback = function(req, res, callback) {
        return function (err, resp, body) {
            if (err) {
                return res.error(err);
            }

            if (resp.statusCode !== 200) {
                return res.error(body, resp.statusCode);
            }

            return callback(body);
        };
    };

    router.authenticated.get('/projects/:ns/:name/durations',
        function(req, res) {

            var sql = 'SELECT' +
                '   issue_id,' +
                '   user_id,' +
                '   user_name,' +
                '   tag_column,' +
                '   UNIX_TIMESTAMP(time_start) AS time_start,' +
                '   UNIX_TIMESTAMP(time_stop) AS time_stop' +
                ' FROM ' +
                '   durations' +
                ' WHERE' +
                '    namespace = \'' + req.params.ns + '\' AND ' +
                '    project = \'' + req.params.name + '\' ' +
                ' ORDER BY' +
                '   (time_stop - time_start) ASC';

            container.get('mysql').execute(
                sql,
                function(err, result) {
                    if (err) {
                        res.error(err);

                        return;
                    }

                    res.response.ok(result);
                }
            );
        }
    );
};