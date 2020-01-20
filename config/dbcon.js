// Configuration details for connecting to MySQL database
var url = require('url');
let uri = url.parse(process.env.CLEARDB_DATABASE_URL);

module.exports = {
  connectionLimit : 10,
  host            : process.env.CLEARDB_HOST,
  user            : process.env.CLEARDB_USER,
  password        : process.env.CLEARDB_PASSWORD,
  database        : process.env.CLEARDB_DATABASE,
  waitForConnections: true,
  queueLimit: 0,
  timezone: 'Z'
};