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
                '   id,' +
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

    router.authenticated.put('/projects/:ns/:name/durations',
        function(req, res) {
            var duration = req.body;

            ['issueId', 'userId', 'userName', 'columnName', 'timeStart'].forEach(function(k, i) {
                if (!(k in duration))
                    res.error.conflict({
                        message: 'Bad arguments',
                        code: k
                    });
            });

            container.get('mysql').execute(
                'INSERT INTO durations(namespace, project, issue_id, user_id, user_name, tag_column, time_start) VALUES(?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?))',
                [
                    req.params.ns,
                    req.params.name,
                    duration.issueId,
                    duration.userId,
                    duration.userName,
                    duration.columnName,
                    duration.timeStart
                ],
                function(err, result) {
                    if (err) {
                        res.error(err);
                        return;
                    }

                    container.get('server.websocket').broadcast(
                        'duration.start',
                        {
                            namespace: req.params.ns,
                            project: req.params.name,
                            duration: {
                                id: result.insertId,
                                issue_id: duration.issueId,
                                user_id: duration.userId,
                                user_name: duration.userName,
                                tag_column: duration.columnName,
                                time_start: duration.timeStart,
                                time_stop: null
                            }
                        }
                    );

                    res.response.ok({"success" : true, "durationId" : result.insertId});
                }
            );
        }
    );

    router.authenticated.put('/projects/:ns/:name/durations/:id',
        function(req, res) {

            container.get('mysql').execute(
                'UPDATE durations SET time_start = FROM_UNIXTIME(?), time_stop = FROM_UNIXTIME(?) WHERE id = ?',
                [
                    req.body.timeStart,
                    req.body.timeStop,
                    req.params.id
                ],
                function(err, result) {
                    if (err) {
                        res.error(err);
                        return;
                    }

                    res.response.ok({"success" : true});

                    container.get('server.websocket').broadcast(
                        'duration.update',
                        {
                            namespace: req.params.ns,
                            project: req.params.name,
                            duration: {
                                id: req.params.id,
                                time_start: req.body.timeStart,
                                time_stop: req.body.timeStop
                            }
                        }
                    );
                }
            );
        }
    );
};