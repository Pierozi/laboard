CREATE TABLE `moves` (
  `namespace` varchar(255) DEFAULT NULL,
  `project` varchar(255) DEFAULT NULL,
  `issue` int(11) DEFAULT NULL,
  `from` varchar(255) DEFAULT NULL,
  `to` varchar(255) DEFAULT NULL,
  `date` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE `durations` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `namespace` varchar(255) DEFAULT NULL,
  `project` varchar(255) DEFAULT NULL,
  `issue_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `tag_column` varchar(255) DEFAULT NULL,
  `time_start` datetime DEFAULT NULL,
  `time_stop` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
