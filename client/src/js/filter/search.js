angular.module('laboard-frontend')
    .filter('search', [
        '$filter', '$rootScope',
        function($filter, $rootScope) {
            var escape = function(str) {
                    return str.replace(/[.^$*+?()[{\\|\]-]/g, '\\$&');
                },
                searchMilestone = function(query) {
                    var regex = new RegExp(escape(query), 'i');

                    return function(issue) {
                        if (!issue.milestone) return;

                        if (/^[\w\s]+$/.test(query) === false) {
                            try {
                                return semver.satisfies(issue.milestone.title, query)
                            } catch(e) {}
                        }

                        console.log(regex, issue.milestone.title, regex.test(issue.milestone.title));
                        return regex.test(issue.milestone.title);
                    };
                },
                searchAuthor = function(query) {
                    var regex = new RegExp(escape(query), 'i');

                    return function(issue) {
                        return issue.author && (regex.test(issue.author.username) || regex.test(issue.author.name));
                    };
                },
                searchAssignee = function(query) {
                    var regex = new RegExp(escape(query), 'i');

                    return function(issue) {
                        return issue.assignee && (regex.test(issue.assignee.username) || regex.test(issue.assignee.name));
                    };
                },
                searchPeople = function(query) {
                    var regex = new RegExp(escape(query), 'i');

                    return function(issue) {
                        return (
                            (issue.assignee && (regex.test(issue.assignee.username) || regex.test(issue.assignee.name))) ||
                            (issue.author && (regex.test(issue.author.username) || regex.test(issue.author.name)))
                        );
                    };
                },
                searchNumber = function(query) {
                    var regex = new RegExp(escape(query), 'i');

                    return function(issue) {
                        return regex.test(issue.iid);
                    };
                };

            return function(values, query) {
                if(query && values) {
                    if (/^(@|#|:)/.test(query)) {
                        var search;

                        if (/^@/.test(query)) {
                            if (/^@from /.test(query)) {
                                search = searchAuthor;
                                query = query.replace(/^@from /, '');
                            } else if (/^@to /.test(query)) {
                                search = searchAssignee;
                                query = query.replace(/^@to /, '');
                            } else if (/^@me$/.test(query)) {
                                search = searchPeople;
                                query = $rootScope.user.username;
                            } else {
                                search = searchPeople;
                                query = query.replace(/^@/, '');
                            }
                        } else if (/^#/.test(query)) {
                            search = searchNumber;
                            query = query.replace(/^#/, '');
                        } else if (/^:/.test(query)) {
                            search = searchMilestone;
                            query = query.replace(/^:/, '');
                        }

                        return values.filter(search(query));
                    } else {
                        return $filter('filter')(values, query);
                    }
                }

                return values || [];
            };
        }
    ]);
