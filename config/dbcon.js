// Configuration details for connecting to MySQL database

module.exports = {
  connectionLimit : 20,
  host            : '',
  user            : '',
  password        : '',
  database        : '',
  port            : 3306,
  waitForConnections: true,
  queueLimit: 0,
  timezone: 'Z'
};